import type { Metadata } from 'next'
import { AdvisorDesk } from '@/components/advisor/advisor-desk'

export const metadata: Metadata = { title: 'Advisor desk — Mlangizi' }

export default function AdvisorPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <AdvisorDesk />
    </main>
  )
}
