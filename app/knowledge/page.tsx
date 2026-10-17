import type { Metadata } from 'next'
import { documents } from '@/lib/knowledge/documents'
import { entities, relations } from '@/lib/knowledge/graph'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Knowledge base — Mlangizi' }

const labelOf = new Map(entities.map((e) => [e.id, e.label]))

export default function KnowledgePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Knowledge base</h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          The only material the agent may answer from. Each document carries its source and reviewer; drafts are
          indexed only after expert validation. Seed entries are placeholders — replace them with your partners&apos;
          verified leaflets.
        </p>
      </div>

      <section aria-labelledby="docs-heading" className="flex flex-col gap-4">
        <h2 id="docs-heading" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Documents ({documents.length})
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {documents.map((d) => (
            <li key={d.id} id={d.id} className="flex scroll-mt-6 flex-col gap-3 rounded-lg border bg-card p-4 target:ring-2 target:ring-primary">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-primary">{d.id}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    d.status === 'validated' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground',
                  )}
                >
                  {d.status === 'validated' ? 'Validated' : 'Pending review'}
                </span>
              </div>
              <h3 className="text-balance font-medium leading-snug">{d.title}</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t pt-3 text-xs">
                <dt className="text-muted-foreground">Region</dt>
                <dd>{d.region}</dd>
                <dt className="text-muted-foreground">Source</dt>
                <dd>{d.source}</dd>
                <dt className="text-muted-foreground">Reviewer</dt>
                <dd>
                  {d.validatedBy} · {d.validatedOn}
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="graph-heading" className="flex flex-col gap-4">
        <h2 id="graph-heading" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Knowledge graph ({entities.length} entities · {relations.length} relations)
        </h2>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b font-mono text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Subject</th>
                <th scope="col" className="px-3 py-2 font-medium">Relation</th>
                <th scope="col" className="px-3 py-2 font-medium">Object</th>
                <th scope="col" className="px-3 py-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {relations.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2">{labelOf.get(r.from)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.rel.replace('_', ' ')}</td>
                  <td className="px-3 py-2">{labelOf.get(r.to)}</td>
                  <td className="px-3 py-2">
                    <a href={`#${r.docId}`} className="font-mono text-xs text-primary hover:underline">
                      {r.docId}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
