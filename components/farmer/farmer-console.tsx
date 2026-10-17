'use client'

import { useState } from 'react'
import useSWR from 'swr'
import type { Channel, Farmer, Language, Message } from '@/lib/store'
import { FeaturePhone } from './feature-phone'
import { TracePanel } from './trace-panel'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const samples: Record<Language, { label: string; text: string }[]> = {
  ny: [
    { label: 'Armyworm', text: 'Mbozi zikudya chimanga changa. Ndichite chiyani?' },
    { label: 'Chickens dying', text: 'Nkhuku zanga zikufa, makosi akupotoka. Ndichite chiyani?' },
    { label: 'Dosage (escalates)', text: 'Ndisakanize mankhwala a cypermethrin ml zingati mu knapsack?' },
    { label: 'Off-topic (refuses)', text: 'Ndi liti ndingabzale fodya?' },
  ],
  en: [
    { label: 'Armyworm', text: 'Worms are eating my maize leaves, what do I do?' },
    { label: 'Groundnut', text: 'My groundnut plants are small and yellow, bunched leaves. Why?' },
    { label: 'Vet drug (escalates)', text: 'How much oxytetracycline injection for my goat?' },
    { label: 'Off-topic (refuses)', text: 'What is the best price for tobacco this year?' },
  ],
}

export function FarmerConsole({ farmers }: { farmers: Farmer[] }) {
  const [phone, setPhone] = useState(farmers[0].phone)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pending, setPending] = useState<Channel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const farmer = farmers.find((f) => f.phone === phone)!
  const [language, setLanguage] = useState<Language>(farmer.language)

  const { data, mutate } = useSWR<{ messages: Message[] }>(
    `/api/conversations?phone=${encodeURIComponent(phone)}`,
    fetcher,
    { refreshInterval: 4000 },
  )
  const messages = data?.messages ?? []
  const agentMessages = messages.filter((m) => m.trace)
  const selected =
    agentMessages.find((m) => m.id === selectedId) ?? agentMessages[agentMessages.length - 1] ?? null

  async function send(channel: Channel, init: RequestInit & { path: string }) {
    setPending(channel)
    setError(null)
    try {
      const res = await fetch(init.path, init)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Request failed')
      setSelectedId(null)
      await mutate()
      return json as { reply: string }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
      return null
    } finally {
      setPending(null)
    }
  }

  const sendSms = (text: string) =>
    send('sms', {
      path: '/api/channels/sms',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, text, language }),
    })

  const sendVoice = (transcript: string) =>
    send('voice', {
      path: '/api/channels/voice',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, transcript, language }),
    })

  const sendPhoto = (file: File, caption: string) => {
    const form = new FormData()
    form.set('phone', phone)
    form.set('image', file)
    form.set('caption', caption)
    form.set('language', language)
    return send('photo', { path: '/api/channels/photo', method: 'POST', body: form })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
      <section aria-labelledby="farmer-heading" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-pretty text-2xl font-semibold leading-tight">
            Farm advice that reaches a shared feature phone.
          </h1>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Every answer is retrieved from expert-validated local sources and cited. No source, no answer.
            Dosage and drug questions go to a human advisor.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend id="farmer-heading" className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Simulate a farmer
          </legend>
          {farmers.map((f) => (
            <label
              key={f.phone}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 transition-colors',
                f.phone === phone && 'border-primary ring-1 ring-primary',
              )}
            >
              <input
                type="radio"
                name="farmer"
                value={f.phone}
                checked={f.phone === phone}
                onChange={() => {
                  setPhone(f.phone)
                  setLanguage(f.language)
                  setSelectedId(null)
                }}
                className="mt-1 accent-primary"
              />
              <span className="flex flex-col">
                <span className="font-medium">{f.name}</span>
                <span className="text-sm text-muted-foreground">
                  {f.district} · {f.device} · {f.language === 'ny' ? 'Chichewa' : 'English'}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{f.phone}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Reply language</span>
          <div className="flex rounded-md border bg-card p-0.5" role="group" aria-label="Reply language">
            {(['ny', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={language === l}
                onClick={() => setLanguage(l)}
                className={cn(
                  'rounded px-3 py-1 text-sm',
                  language === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                {l === 'ny' ? 'Chichewa' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Try a question</span>
          <div className="flex flex-wrap gap-2">
            {samples[language].map((s) => (
              <button
                key={s.label}
                type="button"
                disabled={pending !== null}
                onClick={() => sendSms(s.text)}
                className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary disabled:opacity-50"
                title={s.text}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <FeaturePhone
        messages={messages}
        pending={pending}
        error={error}
        language={language}
        selectedId={selected?.id ?? null}
        onSelect={setSelectedId}
        onSms={sendSms}
        onVoice={sendVoice}
        onPhoto={sendPhoto}
      />

      <TracePanel message={selected} />
    </div>
  )
}
