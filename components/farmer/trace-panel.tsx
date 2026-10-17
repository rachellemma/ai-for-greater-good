import Link from 'next/link'
import { BookCheck, CircleSlash, Network, ShieldAlert, Wrench } from 'lucide-react'
import type { Message } from '@/lib/store'
import { cn } from '@/lib/utils'

const statusCopy = {
  answered: { label: 'Answered from verified source', icon: BookCheck, cls: 'bg-primary text-primary-foreground' },
  refused: { label: 'Refused — no verified source', icon: CircleSlash, cls: 'bg-secondary text-secondary-foreground' },
  escalated: { label: 'Escalated to human advisor', icon: ShieldAlert, cls: 'bg-accent text-accent-foreground' },
} as const

export function TracePanel({ message }: { message: Message | null }) {
  return (
    <section aria-labelledby="trace-heading" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 id="trace-heading" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Answer trace
        </h2>
        {message?.trace && <span className="font-mono text-xs text-muted-foreground">{message.trace.latencyMs} ms</span>}
      </div>

      {!message?.trace ? (
        <p className="rounded-lg border border-dashed p-4 text-sm leading-relaxed text-muted-foreground">
          Each reply on the phone links back to the documents it came from. Send a question, then tap a reply to inspect it.
        </p>
      ) : (
        <TraceBody message={message} />
      )}
    </section>
  )
}

function TraceBody({ message }: { message: Message }) {
  const trace = message.trace!
  const s = statusCopy[trace.status]
  return (
    <div className="flex flex-col gap-4">
      <div className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium', s.cls)}>
        <s.icon className="size-4 shrink-0" aria-hidden="true" />
        {s.label}
      </div>

      {trace.risk && (
        <p className="text-sm leading-relaxed">
          <span className="font-medium">Safety screen:</span>{' '}
          <span className="font-mono">{trace.risk}</span> — dosage and drug advice is never generated.
        </p>
      )}

      {trace.observations && (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">Photo observations</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{trace.observations}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <BookCheck className="size-4" aria-hidden="true" /> Cited sources
        </h3>
        {trace.sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">None. The system did not answer from model memory.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {trace.sources.map((src) => (
              <li key={src.id} className="rounded-lg border bg-card p-3">
                <Link href={`/knowledge#${src.id}`} className="font-mono text-xs text-primary underline-offset-2 hover:underline">
                  {src.id}
                </Link>
                <p className="text-sm font-medium leading-snug">{src.title}</p>
                <p className="text-xs text-muted-foreground">Validated by {src.validatedBy}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {trace.graphFacts.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Network className="size-4" aria-hidden="true" /> Knowledge graph
          </h3>
          <ul className="flex flex-col gap-1 font-mono text-xs">
            {trace.graphFacts.map((f, i) => (
              <li key={i} className="text-muted-foreground">
                <span className="text-foreground">{f.subject}</span> {'→'} {f.relation} {'→'}{' '}
                <span className="text-foreground">{f.object}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Wrench className="size-4" aria-hidden="true" /> Agent tool calls
        </h3>
        <ol className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          {trace.toolCalls.length === 0 ? <li>none</li> : trace.toolCalls.map((c, i) => <li key={i}>{c}</li>)}
        </ol>
      </div>

      {trace.escalationId && (
        <Link href="/advisor" className="text-sm font-medium text-primary underline underline-offset-4">
          Open in advisor desk
        </Link>
      )}
    </div>
  )
}
