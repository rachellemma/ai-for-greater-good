import 'server-only'
import { ToolLoopAgent, Output, generateText, isStepCount, tool } from 'ai'
import { z } from 'zod'
import { search, tokenize, type RetrievalHit } from './knowledge/retrieve'
import { findEntity, neighbourhood, type GraphFact } from './knowledge/graph'
import { assessRisk } from './safety'
import {
  addMessage,
  createEscalation,
  getFarmer,
  type AnswerStatus,
  type Channel,
  type Language,
  type Trace,
} from './store'

const MODEL = 'google/gemini-3.8-flash'

const SMS_LIMIT = 300

const templates: Record<Language, { refuse: string; escalate: string; sourcePrefix: string }> = {
  en: {
    refuse:
      'Sorry, I do not have a verified local source for this question, so I will not guess. Please ask your extension officer or lead farmer.',
    escalate: 'Your question has been sent to a human advisor. They will reply to this number soon.',
    sourcePrefix: 'Src',
  },
  ny: {
    refuse:
      'Pepani, ndilibe uthenga wotsimikizika wa m’dera lanu pa funso limeneli, choncho sindingangoganiza. Funsani mlangizi wa zaulimi kapena mlimi wotsogolera.',
    escalate: 'Funso lanu latumizidwa kwa mlangizi. Akuyankhani pa nambala iyi posachedwa.',
    sourcePrefix: 'Gwero',
  },
}

const answerSchema = z.object({
  status: z
    .enum(['answered', 'refused'])
    .describe('"refused" if the retrieved sources do not directly support an answer.'),
  answer: z.string().describe('Plain-language reply in the farmer language. Short sentences.'),
  citedSourceIds: z.array(z.string()).describe('IDs of knowledge-base documents the answer relies on.'),
  needsHumanAdvisor: z.boolean().describe('True if a human advisor should follow up.'),
})

function instructions(language: Language, channel: Channel, highStakes: boolean) {
  const lang = language === 'ny' ? 'Chichewa (Chinyanja)' : 'simple English'
  const format =
    channel === 'voice'
      ? 'The reply will be read aloud on a phone call. Use 3-5 short spoken sentences. No symbols, no lists, no abbreviations.'
      : `The reply is an SMS on a feature phone. Keep it under ${SMS_LIMIT - 40} characters. Plain text, no markdown, no emoji.`

  return `You are Mlangizi, a farming advisory assistant for smallholder farmers in Malawi. Many users have low literacy and share a basic phone.

GROUNDING RULES (non-negotiable):
- Always call searchKnowledge first. You may call queryKnowledgeGraph to link crops, pests, symptoms and practices.
- Only state facts that appear in the retrieved documents. Never use outside knowledge.
- If no document directly answers the question, set status "refused". Do not guess.
- List every document you used in citedSourceIds.
- Never give pesticide doses, mixing rates, drug names to buy, or veterinary drug doses. For those, give only general safety steps from the sources and set needsHumanAdvisor true.
${highStakes ? '- THIS QUESTION IS HIGH-STAKES. It is already being sent to a human advisor. Give only safe, non-dosage steps from the sources and say an advisor will follow up.\n' : ''}
STYLE:
- Reply in ${lang}. Use everyday words a farmer would use. Be warm and direct.
- ${format}
- Give the single most useful action first.`
}

/**
 * Degraded mode when the model is unreachable: quote the most relevant
 * validated passage verbatim. Still fully grounded and cited.
 */
function extractiveAnswer(query: string, retrieved: Map<string, RetrievalHit>, toolCalls: string[]) {
  toolCalls.push('fallback:extractive')
  const [top] = search(query, 1)
  if (!top) return null
  retrieved.set(top.id, top)
  const terms = new Set(tokenize(query))
  const sentences = top.excerpt.split(/(?<=\.)\s+/)
  const ranked = sentences
    .map((s, i) => ({ s, i, score: tokenize(s).filter((w) => terms.has(w)).length }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, 2)
    .sort((a, b) => a.i - b.i)
  return { id: top.id, answer: ranked.map((r) => r.s).join(' ') }
}

export interface AdviceResult {
  reply: string
  trace: Trace
}

export async function runAdvisor(input: {
  phone: string
  channel: Channel
  question: string
  language?: Language
  observations?: string
}): Promise<AdviceResult> {
  const started = Date.now()
  const farmer = getFarmer(input.phone)
  const language = input.language ?? farmer.language
  const t = templates[language]
  const risk = assessRisk(input.question)

  addMessage({
    phone: input.phone,
    channel: input.channel,
    direction: 'in',
    author: 'farmer',
    text: input.question,
  })

  const retrieved = new Map<string, RetrievalHit>()
  const graphFacts: GraphFact[] = []
  const toolCalls: string[] = []
  let agentRequestedEscalation: string | null = null

  const agent = new ToolLoopAgent({
    model: MODEL,
    instructions: instructions(language, input.channel, risk.highStakes),
    stopWhen: isStepCount(6),
    output: Output.object({ schema: answerSchema }),
    tools: {
      searchKnowledge: tool({
        description:
          'Search the expert-validated local knowledge base. Query in English farming terms (translate local words first).',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          toolCalls.push(`searchKnowledge("${query}")`)
          const hits = search(query)
          for (const h of hits) retrieved.set(h.id, h)
          if (hits.length === 0) return { results: [], note: 'No validated source found.' }
          return { results: hits.map(({ id, title, excerpt }) => ({ id, title, text: excerpt })) }
        },
      }),
      queryKnowledgeGraph: tool({
        description:
          'Look up how a crop, animal, pest, disease or symptom is linked to others (spread by, prevented by, shows...).',
        inputSchema: z.object({ entity: z.string().describe('e.g. "maize", "fall armyworm", "chicken"') }),
        execute: async ({ entity }) => {
          toolCalls.push(`queryKnowledgeGraph("${entity}")`)
          const found = findEntity(entity)
          if (!found) return { facts: [], note: 'Entity not in graph.' }
          const facts = neighbourhood(found.id)
          graphFacts.push(...facts)
          return { entity: found.label, facts }
        },
      }),
      escalateToAdvisor: tool({
        description:
          'Send the question to a human extension or veterinary advisor. Use for dosage, drugs, poisoning, or anything risky or outside the sources.',
        inputSchema: z.object({ reason: z.string() }),
        execute: async ({ reason }) => {
          toolCalls.push(`escalateToAdvisor("${reason}")`)
          agentRequestedEscalation = reason
          return { queued: true }
        },
      }),
    },
  })

  const prompt = input.observations
    ? `Farmer sent a photo. Visual observations (not a diagnosis): ${input.observations}\nFarmer's message: ${input.question || '(no caption)'}`
    : input.question

  let status: AnswerStatus = 'refused'
  let answer = t.refuse
  let cited: string[] = []
  let needsHuman = false

  try {
    const { output } = await agent.generate({ prompt })
    cited = output.citedSourceIds.filter((id) => retrieved.has(id))
    needsHuman = output.needsHumanAdvisor
    if (output.status === 'answered' && cited.length > 0 && output.answer.trim()) {
      status = 'answered'
      answer = output.answer.trim()
    }
  } catch (error) {
    console.log('[v0] Agent error, using extractive fallback:', error instanceof Error ? error.message : error)
    const fallback = extractiveAnswer(`${input.question} ${input.observations ?? ''}`, retrieved, toolCalls)
    if (fallback && !risk.highStakes) {
      status = 'answered'
      answer = fallback.answer
      cited = [fallback.id]
    }
  }

  const shouldEscalate = risk.highStakes || needsHuman || agentRequestedEscalation !== null
  let escalationId: string | undefined

  if (shouldEscalate) {
    const esc = createEscalation({
      phone: input.phone,
      farmerName: farmer.name,
      district: farmer.district,
      channel: input.channel,
      question: input.observations
        ? `${input.question || '(photo, no caption)'}\n[Photo observations] ${input.observations}`
        : input.question,
      category: risk.category ?? (status === 'refused' ? 'insufficient-sources' : 'agent-requested'),
      reason: risk.reason ?? agentRequestedEscalation ?? 'Model flagged for human follow-up',
    })
    escalationId = esc.id
    status = 'escalated'
    answer = cited.length > 0 ? `${answer} ${t.escalate}` : t.escalate
  }

  let reply = answer
  if (cited.length > 0 && input.channel !== 'voice') {
    const tag = ` [${t.sourcePrefix}: ${cited.join(',')}]`
    const room = SMS_LIMIT - tag.length
    reply = (answer.length > room ? `${answer.slice(0, room - 1).trimEnd()}…` : answer) + tag
  }

  const trace: Trace = {
    status,
    risk: risk.category,
    sources: cited.map((id) => {
      const h = retrieved.get(id)!
      return { id, title: h.title, source: h.source, validatedBy: h.validatedBy }
    }),
    graphFacts: graphFacts.filter((f) => cited.includes(f.docId)).slice(0, 8),
    toolCalls,
    observations: input.observations,
    escalationId,
    latencyMs: Date.now() - started,
  }

  addMessage({
    phone: input.phone,
    channel: input.channel,
    direction: 'out',
    author: 'agent',
    text: reply,
    trace,
  })

  return { reply, trace }
}

/** Vision step: extracts observable symptoms only. Grounded diagnosis happens in runAdvisor. */
export async function describePhoto(image: Uint8Array, mediaType: string) {
  const { output } = await generateText({
    model: MODEL,
    output: Output.object({
      schema: z.object({
        usable: z.boolean().describe('False if the photo is too dark, blurry or not a plant/animal.'),
        subject: z.string().describe('e.g. "maize leaf", "groundnut plant", "chicken"'),
        observations: z.string().describe('Visible symptoms only, in plain English. No diagnosis, no treatment.'),
      }),
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'A smallholder farmer in Malawi sent this photo from a basic phone camera. Describe only what is visibly wrong (colours, holes, spots, insects, droppings, posture). Do not diagnose.',
          },
          { type: 'file', mediaType, data: image },
        ],
      },
    ],
  })
  return output
}
