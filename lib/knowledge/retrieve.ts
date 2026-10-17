import { validatedDocuments, type KnowledgeDocument } from './documents'

/** Local-language terms mapped to the English vocabulary used in the knowledge base. */
const synonyms: Record<string, string[]> = {
  chimanga: ['maize'],
  mtedza: ['groundnut'],
  chinangwa: ['cassava'],
  nkhuku: ['chicken', 'poultry'],
  mbozi: ['caterpillar', 'armyworm'],
  nsabwe: ['aphid'],
  manyowa: ['manure', 'compost'],
  feteleza: ['fertilizer'],
  kubzala: ['planting'],
  mvula: ['rains'],
  masamba: ['leaves'],
  achikasu: ['yellow'],
  chikasu: ['yellow'],
  nkhokwe: ['storage'],
  mankhwala: ['pesticide', 'medicine'],
  katemera: ['vaccine'],
  corn: ['maize'],
  peanut: ['groundnut'],
  hen: ['chicken'],
  hens: ['chicken'],
  chickens: ['chicken'],
  worms: ['caterpillar', 'armyworm'],
  worm: ['caterpillar', 'armyworm'],
  mold: ['mould'],
}

const stopwords = new Set(
  'a an the is are was were be my our your of to in on for and or with what how why when do does i we it this that there can should which from at by me have has'.split(
    ' ',
  ),
)

export function tokenize(text: string): string[] {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !stopwords.has(t))
  const expanded: string[] = []
  for (const t of base) {
    expanded.push(t)
    const stem = t.replace(/(ing|es|s)$/, '')
    if (stem !== t && stem.length > 2) expanded.push(stem)
    for (const s of synonyms[t] ?? []) expanded.push(...s.split(' '))
  }
  return expanded
}

interface IndexedDoc {
  doc: KnowledgeDocument
  tf: Map<string, number>
  length: number
}

const index: IndexedDoc[] = validatedDocuments.map((doc) => {
  const tokens = tokenize(`${doc.title} ${doc.tags.join(' ')} ${doc.tags.join(' ')} ${doc.body}`)
  const tf = new Map<string, number>()
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
  return { doc, tf, length: tokens.length }
})

const avgLength = index.reduce((s, d) => s + d.length, 0) / Math.max(index.length, 1)

function idf(term: string) {
  const n = index.filter((d) => d.tf.has(term)).length
  return Math.log(1 + (index.length - n + 0.5) / (n + 0.5))
}

export interface RetrievalHit {
  id: string
  title: string
  source: string
  validatedBy: string
  region: string
  score: number
  excerpt: string
}

/** Minimum BM25 score for a passage to count as grounding. Below it, the agent must refuse. */
export const MIN_SCORE = 2.2

export function search(query: string, k = 3): RetrievalHit[] {
  const terms = [...new Set(tokenize(query))]
  const k1 = 1.4
  const b = 0.75
  return index
    .map(({ doc, tf, length }) => {
      let score = 0
      for (const term of terms) {
        const f = tf.get(term)
        if (!f) continue
        score += idf(term) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * length) / avgLength)))
      }
      return { doc, score }
    })
    .filter((h) => h.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ doc, score }) => ({
      id: doc.id,
      title: doc.title,
      source: doc.source,
      validatedBy: doc.validatedBy,
      region: doc.region,
      score: Math.round(score * 100) / 100,
      excerpt: doc.body,
    }))
}
