import { normalisePhone } from '@/lib/channels'
import { listMessages } from '@/lib/store'

export async function GET(req: Request) {
  const phone = normalisePhone(new URL(req.url).searchParams.get('phone'))
  if (!phone) return Response.json({ error: 'phone is required' }, { status: 400 })
  return Response.json({ messages: listMessages(phone) })
}
