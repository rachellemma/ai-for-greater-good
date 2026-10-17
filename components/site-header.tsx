'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Farmer phone' },
  { href: '/advisor', label: 'Advisor desk' },
  { href: '/knowledge', label: 'Knowledge base' },
]

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-semibold">Mlangizi</span>
            <span className="font-mono text-xs text-muted-foreground">open farm advisory · SMS · voice · photo</span>
          </span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex gap-1">
            {links.map((l) => {
              const active = pathname === l.href
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
