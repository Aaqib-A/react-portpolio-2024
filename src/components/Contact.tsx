import { useEffect, useRef, useState, type FormEvent } from 'react'
import { contact, personal, sectionTitles, socials } from '../data/portfolio'
import { CONTACT_PREFILL_EVENT, copyText } from '../lib/page'
import { SocialIcon } from './icons'
import { Section } from './Section'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMPTY = { name: '', email: '', message: '' }

const labelClass = 'mb-1.5 block text-sm font-medium text-ink'
const fieldClass =
  'w-full rounded-md border border-line bg-canvas px-3 py-2.5 text-base text-ink placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-3 focus:ring-brand/15 sm:text-[15px]'

function SocialLinks() {
  return (
    <ul className="space-y-3">
      {socials.map((s) => (
        <li key={s.label}>
          <a
            href={s.url}
            target={s.url.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-[15px] text-soft transition-colors hover:text-accent"
          >
            <span className="grid size-9 place-items-center rounded-md bg-brand-soft text-accent">
              <SocialIcon label={s.label} className="size-4" />
            </span>
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  // The terminal's `sudo hire-aaqib` pre-fills the message.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const message = (e as CustomEvent<string>).detail
      setForm((f) => ({ ...f, message }))
      setStatus('idle')
      nameRef.current?.focus({ preventScroll: true })
    }
    window.addEventListener(CONTACT_PREFILL_EVENT, onPrefill)
    return () => window.removeEventListener(CONTACT_PREFILL_EVENT, onPrefill)
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    // Netlify Forms: the static copy of this form in index.html registers it at deploy time.
    const body = new URLSearchParams({
      'form-name': 'contact',
      'bot-field': (new FormData(e.currentTarget).get('bot-field') as string | null) ?? '',
      ...form,
    })
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      setForm(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  async function onCopy() {
    if (await copyText(personal.email)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const update = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <Section id="contact" title={sectionTitles.contact}>
      <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12">
        <div>
          <p className="text-lg leading-relaxed text-soft">{contact.message}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${personal.email}`}
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
            >
              {personal.email}
            </a>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
              aria-live="polite"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>

          <div className="mt-8 border-t border-line pt-8">
            <SocialLinks />
          </div>
        </div>

        <form
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={onSubmit}
          className="space-y-5 rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
        >
          <input type="hidden" name="form-name" value="contact" />
          <p className="hidden">
            <label>
              Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className={labelClass}>
                Name
              </label>
              <input
                ref={nameRef}
                id="contact-name"
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                className={fieldClass}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                className={fieldClass}
                placeholder="jane@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className={labelClass}>
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={6}
              value={form.message}
              onChange={update('message')}
              className={`${fieldClass} resize-y leading-relaxed`}
              placeholder="What would you like to build?"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="rounded-md bg-brand px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            <p role="status" className="text-sm text-muted">
              {status === 'sent' && "Thanks! Your message is on its way. I'll get back to you soon."}
              {status === 'error' && (
                <>
                  Something went wrong. Please email me at{' '}
                  <a href={`mailto:${personal.email}`} className="text-accent underline underline-offset-4">
                    {personal.email}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </Section>
  )
}
