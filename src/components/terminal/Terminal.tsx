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
  const tone =
    seg.tone === 'strong'
      ? 'text-neutral-900 dark:text-neutral-100'
      : seg.tone === 'muted'
        ? 'text-neutral-400 dark:text-neutral-500'
        : ''
  if (seg.href) {
    const external = seg.href.startsWith('http')
    return (
      <a
        key={key}
        href={seg.href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`${tone} underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-current`}
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
      <span className="text-neutral-400 dark:text-neutral-500 shrink-0 select-none">$</span>
      <span className="text-neutral-800 dark:text-neutral-200 break-all">{children}</span>
    </div>
  )
}

function Output({ lines, error }: { lines: OutputLine[]; error?: boolean }) {
  return (
    <div
      className={`ml-4 mt-1 mb-3 whitespace-pre-wrap break-words ${
        error ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'
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
    <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-5 md:px-6 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
        <span>~/aaqib · interactive shell</span>
        <span className="hidden sm:inline">
          press <kbd className="font-mono normal-case">/</kbd> to focus
        </span>
      </div>

      <div
        ref={scrollRef}
        onClick={onClick}
        className="p-4 sm:p-5 md:p-6 text-sm leading-[1.9] max-h-[28rem] overflow-y-auto cursor-text"
      >
        <div role="log" aria-live="polite" aria-label="Terminal output">
          {terminalIntro.map((t) => (
            <div key={t.prompt}>
              <Prompt>{t.prompt}</Prompt>
              <Output lines={[t.output]} />
            </div>
          ))}

          <div className="ml-4 mb-3 text-neutral-400 dark:text-neutral-500">
            <span>type a command, or try: </span>
            <span className="inline-flex flex-wrap gap-x-2 gap-y-1 align-middle">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void run(s)}
                  disabled={busy}
                  className="border border-neutral-200 dark:border-neutral-800 px-2 leading-[1.7] text-xs text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
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
          <span className="text-neutral-400 dark:text-neutral-500 shrink-0 select-none">$</span>
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
            className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 caret-neutral-800 dark:caret-neutral-200"
          />
        </label>
      </div>
    </div>
  )
}
