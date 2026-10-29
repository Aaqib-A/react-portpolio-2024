import type { MouseEvent } from 'react'
import { fullName, personal } from '../data/portfolio'
import { scrollToSection } from '../lib/page'
import { WRAP } from './Section'
import { Terminal } from './terminal/Terminal'

function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault()
  scrollToSection(id)
}

// The bio stays a plain string (the terminal and llms.txt use it too); the hero bolds one phrase.
const [lead, ...rest] = personal.bio.split(personal.bioHighlight)

export function Hero() {
  return (
    <section id="about" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Soft purple glow behind the terminal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -right-40 size-[44rem] rounded-full bg-brand/10 blur-3xl dark:bg-brand/25"
      />

      <div className={`${WRAP} relative grid items-center gap-12 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-14`}>
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-soft">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {personal.status}
          </p>

          <h1 className="mt-6 text-5xl tracking-tight text-ink sm:text-6xl">{fullName}</h1>
          <p className="mt-3 text-2xl text-accent sm:text-[1.75rem]">{personal.title}</p>

          <p className="mt-6 max-w-xl leading-relaxed text-soft md:text-[1.0625rem]">
            {lead}
            {rest.length > 0 && <strong className="font-bold text-ink">{personal.bioHighlight}</strong>}
            {rest.join(personal.bioHighlight)} {personal.currentWork.text}{' '}
            <span className="font-medium text-ink">{personal.currentWork.company}</span>.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact"
              onClick={(e) => jump(e, 'contact')}
              className="rounded-md bg-brand px-6 py-3 text-center text-[15px] font-medium text-white shadow-lg shadow-brand/25 transition-colors hover:bg-brand-strong"
            >
              Contact me
            </a>
            <a
              href="#experience"
              onClick={(e) => jump(e, 'experience')}
              className="rounded-md border border-line bg-surface px-6 py-3 text-center text-[15px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              My work
            </a>
          </div>
        </div>

        <Terminal />
      </div>
    </section>
  )
}
