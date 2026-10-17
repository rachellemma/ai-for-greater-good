'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, MessageSquare, Mic, Phone, Send } from 'lucide-react'
import type { Channel, Language, Message } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Props {
  messages: Message[]
  pending: Channel | null
  error: string | null
  language: Language
  selectedId: string | null
  onSelect: (id: string) => void
  onSms: (text: string) => Promise<{ reply: string } | null>
  onVoice: (transcript: string) => Promise<{ reply: string } | null>
  onPhoto: (file: File, caption: string) => Promise<{ reply: string } | null>
}

const modes: { id: Channel; label: string; icon: typeof Phone }[] = [
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'voice', label: 'Call', icon: Phone },
  { id: 'photo', label: 'Photo', icon: Camera },
]

const channelTag: Record<Channel, string> = { sms: 'SMS', voice: 'CALL', photo: 'PIC' }

function speak(text: string, language: Language) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = language === 'ny' ? 'ny-MW' : 'en-GB'
  u.rate = 0.92
  window.speechSynthesis.speak(u)
}

export function FeaturePhone(props: Props) {
  const { messages, pending, error, language, selectedId, onSelect } = props
  const [mode, setMode] = useState<Channel>('sms')
  const screenRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const el = screenRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, pending])

  return (
    <section aria-label="Feature phone simulator" className="mx-auto w-full max-w-xs">
      <div className="flex flex-col gap-4 rounded-4xl bg-handset p-4 pb-6 text-handset-foreground shadow-xl">
        <div className="flex items-center justify-between px-2 font-mono text-xs opacity-70">
          <span>AIRTEL MW</span>
          <span aria-hidden="true" className="flex h-2 w-10 rounded-full bg-handset-foreground/20" />
          <span>2G</span>
        </div>

        <div className="lcd-scanlines flex h-96 flex-col overflow-hidden rounded-md border-4 border-handset-foreground/10 bg-lcd font-mono text-lcd-foreground">
          <div className="flex items-center justify-between border-b border-lcd-foreground/30 px-2 py-1 text-xs">
            <span className="flex items-end gap-0.5" aria-label="Signal strength 3 of 4">
              {[1, 2, 3, 4].map((b) => (
                <span key={b} className={cn('w-1 bg-lcd-foreground', b === 4 && 'opacity-25')} style={{ height: b * 3 }} />
              ))}
            </span>
            <span className="font-semibold">MLANGIZI 2020</span>
            <span>{channelTag[mode]}</span>
          </div>

          <ol ref={screenRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 text-sm leading-snug" aria-live="polite">
            {messages.length === 0 && (
              <li className="m-auto text-center text-xs opacity-70">
                {'Send a question by SMS, call, or photo. Free to the farmer.'}
              </li>
            )}
            {messages.map((m) => (
              <li key={m.id} className={cn('flex flex-col', m.direction === 'in' ? 'items-end' : 'items-start')}>
                <span className="text-[11px] uppercase opacity-60">
                  {m.direction === 'in' ? `> ${channelTag[m.channel]}` : m.author === 'advisor' ? '< ADVISOR' : '< MLANGIZI'}
                </span>
                {m.trace ? (
                  <button
                    type="button"
                    onClick={() => onSelect(m.id)}
                    aria-pressed={selectedId === m.id}
                    className={cn(
                      'max-w-[92%] text-left',
                      m.trace.status === 'escalated' && 'border-l-2 border-lcd-foreground pl-1',
                      selectedId === m.id && 'bg-lcd-foreground text-lcd',
                    )}
                  >
                    {m.text}
                  </button>
                ) : (
                  <span className={cn('max-w-[92%]', m.direction === 'in' && 'text-right', m.author === 'advisor' && 'font-semibold')}>
                    {m.text}
                  </span>
                )}
              </li>
            ))}
            {pending && (
              <li className="animate-pulse text-xs">{pending === 'voice' ? 'Mlangizi is thinking...' : 'Receiving...'}</li>
            )}
          </ol>

          {error && <p className="border-t border-lcd-foreground/30 px-2 py-1 text-xs" role="alert">{`ERR: ${error}`}</p>}
        </div>

        <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Channel">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors',
                mode === m.id ? 'bg-primary text-primary-foreground' : 'bg-handset-foreground/10 hover:bg-handset-foreground/20',
              )}
            >
              <m.icon className="size-4" aria-hidden="true" />
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'sms' && <SmsComposer disabled={pending !== null} onSend={props.onSms} />}
        {mode === 'voice' && <VoiceComposer disabled={pending !== null} language={language} onSend={props.onVoice} />}
        {mode === 'photo' && <PhotoComposer disabled={pending !== null} onSend={props.onPhoto} />}
      </div>
    </section>
  )
}

const inputClass =
  'w-full rounded-md border-0 bg-handset-foreground/10 px-3 py-2 text-sm text-handset-foreground placeholder:text-handset-foreground/50 focus-visible:outline-2 focus-visible:outline-primary'

function isComposing(e: React.KeyboardEvent) {
  return e.nativeEvent.isComposing || e.keyCode === 229
}

function SmsComposer({ disabled, onSend }: { disabled: boolean; onSend: Props['onSms'] }) {
  const [text, setText] = useState('')
  const submit = async () => {
    const t = text.trim()
    if (!t || disabled) return
    setText('')
    await onSend(t)
  }
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <label htmlFor="sms-input" className="sr-only">SMS message</label>
      <input
        id="sms-input"
        value={text}
        maxLength={300}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isComposing(e)) e.preventDefault()
        }}
        placeholder="Type SMS to 2020"
        className={inputClass}
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-md bg-primary px-3 text-primary-foreground disabled:opacity-40"
        aria-label="Send SMS"
      >
        <Send className="size-4" aria-hidden="true" />
      </button>
    </form>
  )
}

type Recognition = {
  lang: string
  interimResults: boolean
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void
  onend: () => void
  start: () => void
  stop: () => void
}

function VoiceComposer({ disabled, language, onSend }: { disabled: boolean; language: Language; onSend: Props['onVoice'] }) {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const recRef = useRef<Recognition | null>(null)

  const [supported, setSupported] = useState(false)
  useEffect(() => {
    setSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }, [])

  const toggleListen = () => {
    if (listening) {
      recRef.current?.stop()
      return
    }
    const w = window as unknown as Record<string, new () => Recognition>
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    const rec = new Ctor()
    rec.lang = language === 'ny' ? 'ny-MW' : 'en-GB'
    rec.interimResults = true
    rec.onresult = (e) => setTranscript(Array.from(e.results).map((r) => r[0].transcript).join(' '))
    rec.onend = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  const submit = async () => {
    const t = transcript.trim()
    if (!t || disabled) return
    setTranscript('')
    const res = await onSend(t)
    if (res) speak(res.reply, language)
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="voice-input" className="sr-only">What the farmer says</label>
      <textarea
        id="voice-input"
        rows={2}
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="What the farmer says on the call"
        className={cn(inputClass, 'resize-none')}
      />
      <div className="flex gap-2">
        {supported && (
          <button
            type="button"
            onClick={toggleListen}
            aria-pressed={listening}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm',
              listening ? 'bg-accent text-accent-foreground' : 'bg-handset-foreground/10',
            )}
          >
            <Mic className="size-4" aria-hidden="true" />
            {listening ? 'Listening' : 'Speak'}
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !transcript.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm text-primary-foreground disabled:opacity-40"
        >
          <Phone className="size-4" aria-hidden="true" />
          Ask on call
        </button>
      </div>
      <p className="text-xs opacity-60">Reply is read aloud. Real calls use the Twilio-compatible IVR webhook.</p>
    </div>
  )
}

function PhotoComposer({ disabled, onSend }: { disabled: boolean; onSend: Props['onPhoto'] }) {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const submit = async () => {
    if (!file || disabled) return
    const res = await onSend(file, caption.trim())
    if (res) {
      setFile(null)
      setCaption('')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-center gap-3 rounded-md bg-handset-foreground/10 p-2 text-sm hover:bg-handset-foreground/20">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Selected crop photo" className="size-12 rounded object-cover" />
        ) : (
          <Camera className="size-5" aria-hidden="true" />
        )}
        <span>{file ? file.name : 'Choose leaf, plant or animal photo'}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <label htmlFor="photo-caption" className="sr-only">Photo caption</label>
      <input
        id="photo-caption"
        value={caption}
        maxLength={200}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Optional caption"
        className={inputClass}
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !file}
        className="flex items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm text-primary-foreground disabled:opacity-40"
      >
        <Send className="size-4" aria-hidden="true" />
        Send photo
      </button>
    </div>
  )
}
