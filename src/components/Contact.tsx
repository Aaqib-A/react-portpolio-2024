import { useEffect, useRef, useState, type FormEvent } from 'react'
import { contact, personal, sectionTitles } from '../data/portfolio'
import { CONTACT_PREFILL_EVENT, copyText } from '../lib/page'
import { SocialLinks } from './Hero'
import { Section } from './Section'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMPTY = { name: '', email: '', message: '' }

const labelClass = 'block text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-2'
const fieldClass =
  'w-full bg-transparent border border-neutral-200 dark:border-neutral-800 px-3 py-2.5 text-base sm:text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-400 transition-colors'
const linkClass =
  'text-black dark:text-white text-xs uppercase tracking-widest hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors underline underline-offset-4'

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
      <div className="max-w-xl">
        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-[1.8] mb-8">{contact.message}</p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-10">
          <a href={`mailto:${personal.email}`} className={linkClass}>
            {personal.email}
          </a>
          <button
            type="button"
            onClick={onCopy}
            className="text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white text-xs uppercase tracking-widest transition-colors"
            aria-live="polite"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        <form
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={onSubmit}
          className="space-y-5"
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
              className={`${fieldClass} resize-y leading-[1.7]`}
              placeholder="What would you like to build?"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="text-xs text-white dark:text-black bg-black dark:bg-white px-5 py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-60 transition-colors uppercase tracking-widest"
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            <p role="status" className="text-xs text-neutral-500 dark:text-neutral-400">
              {status === 'sent' && "Thanks! Your message is on its way. I'll get back to you soon."}
              {status === 'error' && (
                <>
                  Something went wrong. Please email me at{' '}
                  <a href={`mailto:${personal.email}`} className="underline underline-offset-4">
                    {personal.email}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <SocialLinks />
        </div>
      </div>
    </Section>
  )
}
