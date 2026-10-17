'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { CheckCircle2, Phone, MessageSquare, Camera } from 'lucide-react'
import type { Escalation } from '@/lib/store'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Data {
  escalations: Escalation[]
  stats: { total: number; answered: number; refused: number; escalated: number; openEscalations: number }
}

const channelIcon = { sms: MessageSquare, voice: Phone, photo: Camera }

const categoryLabel: Record<string, string> = {
  'pesticide-dosage': 'Pesticide dosage',
  'veterinary-drug': 'Veterinary drug',
  'human-health': 'Human health / poisoning',
  'insufficient-sources': 'No verified source',
  'agent-requested': 'Agent requested review',
}

export function AdvisorDesk() {
  const { data, mutate, isLoading } = useSWR<Data>('/api/escalations', fetcher, { refreshInterval: 4000 })
  const [filter, setFilter] = useState<'open' | 'resolved'>('open')
  const items = (data?.escalations ?? []).filter((e) => e.status === filter)
  const st = data?.stats

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Advisor desk</h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          High-stakes questions land here instead of being answered by the model. Your reply is sent back to the
          farmer over the same channel they used.
        </p>
      </div>

      {st && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Agent replies', st.total],
            ['Answered with source', st.answered],
            ['Refused', st.refused],
            ['Open escalations', st.openEscalations],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border bg-card p-3">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="font-mono text-xl font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex gap-1" role="tablist" aria-label="Escalation status">
        {(['open', 'resolved'] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium capitalize',
              filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading queue…</p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm leading-relaxed text-muted-foreground">
          {filter === 'open'
            ? 'No open escalations. Ask a dosage or drug question from the farmer phone to see one arrive.'
            : 'Nothing resolved yet.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((e) => (
            <EscalationCard key={e.id} escalation={e} onResolved={() => mutate()} />
          ))}
        </ul>
      )}
    </div>
  )
}

function EscalationCard({ escalation: e, onResolved }: { escalation: Escalation; onResolved: () => void }) {
  const [reply, setReply] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const Icon = channelIcon[e.channel]

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!reply.trim()) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/escalations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: e.id, reply }),
    })
    setSaving(false)
    if (!res.ok) {
      setError((await res.json()).error ?? 'Failed to send')
      return
    }
    onResolved()
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">{e.farmerName}</span>
          <span className="text-sm text-muted-foreground">{e.district}</span>
          <span className="font-mono text-xs text-muted-foreground">{e.phone}</span>
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            e.status === 'open' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground',
          )}
        >
          {categoryLabel[e.category] ?? e.category}
        </span>
      </div>

      <blockquote className="whitespace-pre-line border-l-2 border-primary pl-3 leading-relaxed">{e.question}</blockquote>
      <p className="font-mono text-xs text-muted-foreground">
        {e.reason} · {new Date(e.createdAt).toLocaleTimeString()}
      </p>

      {e.status === 'resolved' ? (
        <p className="flex items-start gap-2 rounded-md bg-secondary p-3 text-sm leading-relaxed">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          {e.advisorReply}
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <label htmlFor={`reply-${e.id}`} className="text-sm font-medium">
            Reply to farmer ({e.channel === 'voice' ? 'read on callback' : 'sent by SMS'})
          </label>
          <textarea
            id={`reply-${e.id}`}
            rows={3}
            maxLength={480}
            value={reply}
            onChange={(ev) => setReply(ev.target.value)}
            placeholder="Give the verified product, rate and safety steps, or arrange a field visit."
            className="rounded-md border bg-background p-2 text-sm leading-relaxed focus-visible:outline-2 focus-visible:outline-primary"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground">{reply.length}/480</span>
            <button
              type="submit"
              disabled={saving || !reply.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? 'Sending…' : 'Send & resolve'}
            </button>
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </form>
      )}
    </li>
  )
}
