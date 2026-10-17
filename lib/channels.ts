import type { Language } from './store'

export function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)
}

export function twiml(body: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { 'Content-Type': 'text/xml' },
  })
}

export function isForm(req: Request) {
  const ct = req.headers.get('content-type') ?? ''
  return ct.includes('application/x-www-form-urlencoded')
}

export function parseLanguage(v: unknown): Language | undefined {
  return v === 'en' || v === 'ny' ? v : undefined
}

export function normalisePhone(v: unknown) {
  const s = String(v ?? '').replace(/[^\d+]/g, '')
  return s.length >= 7 ? s : null
}

export const MAX_QUESTION = 600
