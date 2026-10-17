import { listEscalations, resolveEscalation, stats } from '@/lib/store'

export async function GET() {
  return Response.json({ escalations: listEscalations(), stats: stats() })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : ''
  const reply = typeof body?.reply === 'string' ? body.reply.trim().slice(0, 480) : ''
  if (!id || !reply) return Response.json({ error: 'id and reply are required' }, { status: 400 })
  const esc = resolveEscalation(id, reply)
  if (!esc) return Response.json({ error: 'Escalation not found or already resolved' }, { status: 404 })
  return Response.json({ escalation: esc })
}
