import type { RiskCategory } from './safety'

export type Channel = 'sms' | 'voice' | 'photo'
export type Language = 'en' | 'ny'
export type AnswerStatus = 'answered' | 'refused' | 'escalated'

export interface Farmer {
  phone: string
  name: string
  district: string
  language: Language
  device: string
}

export interface SourceRef {
  id: string
  title: string
  source: string
  validatedBy: string
}

export interface Trace {
  status: AnswerStatus
  risk: RiskCategory
  sources: SourceRef[]
  graphFacts: { subject: string; relation: string; object: string; docId: string }[]
  toolCalls: string[]
  observations?: string
  escalationId?: string
  latencyMs: number
}

export interface Message {
  id: string
  phone: string
  channel: Channel
  direction: 'in' | 'out'
  author: 'farmer' | 'agent' | 'advisor'
  text: string
  createdAt: number
  trace?: Trace
}

export interface Escalation {
  id: string
  phone: string
  farmerName: string
  district: string
  channel: Channel
  question: string
  category: NonNullable<RiskCategory> | 'insufficient-sources' | 'agent-requested'
  reason: string
  status: 'open' | 'resolved'
  createdAt: number
  resolvedAt?: number
  advisorReply?: string
}

export const farmers: Farmer[] = [
  { phone: '+265991000101', name: 'Chimwemwe Banda', district: 'Dedza', language: 'ny', device: 'Shared feature phone' },
  { phone: '+265881000202', name: 'Grace Phiri', district: 'Mzimba', language: 'en', device: 'Feature phone' },
  { phone: '+265991000303', name: 'Tiyamike Mwale', district: 'Zomba', language: 'ny', device: 'Basic phone (voice only)' },
]

interface Db {
  messages: Message[]
  escalations: Escalation[]
}

/**
 * In-memory store kept on globalThis so it survives hot reloads.
 * Swap these functions for a Postgres-backed implementation in production.
 */
const g = globalThis as unknown as { __farmDb?: Db }
const db: Db = (g.__farmDb ??= { messages: [], escalations: [] })

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`

export function getFarmer(phone: string): Farmer {
  return (
    farmers.find((f) => f.phone === phone) ?? {
      phone,
      name: 'Unregistered farmer',
      district: 'Unknown',
      language: 'ny',
      device: 'Unknown',
    }
  )
}

export function addMessage(m: Omit<Message, 'id' | 'createdAt'>): Message {
  const msg = { ...m, id: uid('msg'), createdAt: Date.now() }
  db.messages.push(msg)
  return msg
}

export function listMessages(phone: string) {
  return db.messages.filter((m) => m.phone === phone)
}

export function createEscalation(e: Omit<Escalation, 'id' | 'createdAt' | 'status'>): Escalation {
  const existing = db.escalations.find(
    (x) => x.phone === e.phone && x.question === e.question && x.status === 'open',
  )
  if (existing) return existing
  const esc: Escalation = { ...e, id: uid('esc'), createdAt: Date.now(), status: 'open' }
  db.escalations.unshift(esc)
  return esc
}

export function listEscalations() {
  return db.escalations
}

export function resolveEscalation(id: string, reply: string): Escalation | null {
  const esc = db.escalations.find((e) => e.id === id)
  if (!esc || esc.status === 'resolved') return null
  esc.status = 'resolved'
  esc.advisorReply = reply
  esc.resolvedAt = Date.now()
  addMessage({
    phone: esc.phone,
    channel: esc.channel === 'voice' ? 'voice' : 'sms',
    direction: 'out',
    author: 'advisor',
    text: reply,
  })
  return esc
}

export function stats() {
  const out = db.messages.filter((m) => m.author === 'agent' && m.trace)
  const count = (s: AnswerStatus) => out.filter((m) => m.trace?.status === s).length
  return {
    total: out.length,
    answered: count('answered'),
    refused: count('refused'),
    escalated: count('escalated'),
    openEscalations: db.escalations.filter((e) => e.status === 'open').length,
  }
}
