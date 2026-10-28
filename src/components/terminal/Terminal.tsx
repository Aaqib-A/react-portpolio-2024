import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { terminalIntro } from '../../data/portfolio'
import { loadGithub } from '../../hooks/useGithub'
import { getTheme, setTheme } from '../../hooks/useTheme'
import { copyText, openUrl, prefillContact, scrollToSection } from '../../lib/page'
import { complete, execute, type OutputLine, type Segment, type TerminalContext } from './commands'

type NewEntry = { kind: 'input'; text: string } | { kind: 'output'; lines: OutputLine[]; error?: boolean }
type Entry = NewEntry & { id: number }

const SUGGESTIONS = ['help', 'whoami', 'research', 'github', 'sudo hire-aaqib']

function renderSegment(seg: Segment, key: number): ReactNode {
  if (typeof seg === 'string') return <span key={key}>{seg}</span>
  const tone = seg.tone === 'strong' ? 'text-white' : seg.tone === 'muted' ? 'text-term-muted' : ''
  if (seg.href) {
    const external = seg.href.startsWith('http')
    return (
      <a
        key={key}
        href={seg.href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`${tone} underline underline-offset-4 decoration-term-accent/40 hover:decoration-current`}
      >
        {seg.text}
      </a>
    )
  }
  return (
    <span key={key} className={tone}>
      {seg.text}
    </span>
  )
}

function Prompt({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-term-accent shrink-0 select-none">$</span>
      <span className="text-white break-all">{children}</span>
    </div>
  )
}

function Output({ lines, error }: { lines: OutputLine[]; error?: boolean }) {
  return (
    <div
      className={`ml-4 mt-1 mb-3 whitespace-pre-wrap break-words ${
        error ? 'text-rose-300' : 'text-term-fg'
      }`}
    >
      {lines.map((line, i) => (
        <div key={i} className="min-h-[1.9em]">
          {(Array.isArray(line) ? line : [line]).map(renderSegment)}
        </div>
      ))}
    </div>
  )
}

export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const history = useRef<string[]>([])
  const historyIndex = useRef<number | null>(null)
  const nextId = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const ctx = useMemo<TerminalContext>(
    () => ({
      scrollTo: scrollToSection,
      getTheme,
      setTheme,
      openUrl,
      copy: copyText,
      fetchGithub: loadGithub,
      prefillContact,
      get history() {
        return history.current
      },
      now: () => new Date(),
    }),
    [],
  )

  const push = (...items: NewEntry[]) =>
    setEntries((prev) => [...prev, ...items.map((e) => ({ ...e, id: nextId.current++ }))])

  // Keep the newest output in view inside the terminal (without moving the page).
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries])

  // Press "/" anywhere on the page to jump into the terminal.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      inputRef.current?.focus({ preventScroll: true })
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function run(raw: string) {
    const input = raw.trim()
    push({ kind: 'input', text: input })
    if (!input) return
    history.current = [...history.current, input]
    historyIndex.current = null
    setBusy(true)
    try {
      const result = await execute(input, ctx)
      if (result.clear) setEntries([])
      else if (result.lines.length) push({ kind: 'output', lines: result.lines, error: result.error })
    } finally {
      setBusy(false)
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const list = history.current
    if (e.key === 'Enter') {
      e.preventDefault()
      if (busy) return
      const input = value
      setValue('')
      void run(input)
    } else if (e.key === 'ArrowUp') {
      if (!list.length) return
      e.preventDefault()
      const i = historyIndex.current === null ? list.length - 1 : Math.max(0, historyIndex.current - 1)
      historyIndex.current = i
      setValue(list[i])
    } else if (e.key === 'ArrowDown') {
      if (historyIndex.current === null) return
      e.preventDefault()
      const i = historyIndex.current + 1
      if (i < list.length) {
        historyIndex.current = i
        setValue(list[i])
      } else {
        historyIndex.current = null
        setValue('')
      }
    } else if (e.key === 'Tab') {
      // Leave Tab alone on an empty prompt so keyboard users can move on.
      if (!value.trim()) return
      e.preventDefault()
      const result = complete(value)
      setValue(result.value)
      if (result.options.length) {
        push({ kind: 'input', text: value }, { kind: 'output', lines: [result.options.join('  ')] })
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      setEntries([])
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) {
      e.preventDefault()
      push({ kind: 'input', text: `${value}^C` })
      setValue('')
    }
  }

  // Clicking anywhere in the terminal focuses the prompt, unless the visitor
  // is selecting text or clicking a link.
  function onClick(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('a, button')) return
    if (window.getSelection()?.toString()) return
    inputRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className="overflow-hidden rounded-xl bg-term font-mono shadow-2xl shadow-brand/25 ring-1 ring-term-line">
      <div className="flex items-center justify-between gap-4 bg-brand px-4 py-2.5 text-[11px] text-white/80 sm:px-5">
        <span className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/30" />
            <span className="size-2.5 rounded-full bg-white/30" />
            <span className="size-2.5 rounded-full bg-white/30" />
          </span>
          ~/aaqib · interactive shell
        </span>
        <span className="hidden sm:inline">
          press <kbd className="rounded border border-white/30 px-1">/</kbd> to focus
        </span>
      </div>

      <div
        ref={scrollRef}
        onClick={onClick}
        className="h-[25rem] cursor-text overflow-y-auto p-4 text-[13px] leading-[1.9] text-term-fg sm:p-5"
      >
        <div role="log" aria-live="polite" aria-label="Terminal output">
          {terminalIntro.map((t) => (
            <div key={t.prompt}>
              <Prompt>{t.prompt}</Prompt>
              <Output lines={[t.output]} />
            </div>
          ))}

          <div className="ml-4 mb-3 text-term-muted">
            <span>type a command, or try: </span>
            <span className="inline-flex flex-wrap gap-x-2 gap-y-1 align-middle">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void run(s)}
                  disabled={busy}
                  className="rounded border border-term-line px-2 text-xs leading-[1.7] text-term-fg transition-colors hover:border-term-accent hover:text-white"
                >
                  {s}
                </button>
              ))}
            </span>
          </div>

          {entries.map((entry) =>
            entry.kind === 'input' ? (
              <Prompt key={entry.id}>{entry.text}</Prompt>
            ) : (
              <Output key={entry.id} lines={entry.lines} error={entry.error} />
            ),
          )}
        </div>

        <label className="flex gap-2 items-center">
          <span className="text-term-accent shrink-0 select-none">$</span>
          <span className="sr-only">Terminal command</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              historyIndex.current = null
            }}
            onKeyDown={onKeyDown}
            placeholder={busy ? 'running…' : "type 'help' and press enter"}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-base text-white caret-term-accent outline-none placeholder:text-term-muted/70 sm:text-[13px]"
          />
        </label>
      </div>
    </div>
  )
}
