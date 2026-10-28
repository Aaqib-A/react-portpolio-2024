import type { ReactNode } from 'react'

/** Page-width container shared by the nav, hero, contact band, sections and footer. */
export const WRAP = 'mx-auto max-w-6xl px-5 md:px-8'

interface SectionProps {
  id: string
  title: string
  children: ReactNode
}

/** A resume-style section: bold purple heading, sticky in its own column on wide screens. */
export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-line py-16 md:py-20">
      <div className={`${WRAP} lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12`}>
        <h2 className="mb-8 text-[1.375rem] font-bold uppercase leading-tight tracking-wide text-accent lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          {title}
        </h2>
        <div className="reveal">{children}</div>
      </div>
    </section>
  )
}

/** Vertical rail for entries that carry a <Tick />. */
export function Timeline({ children }: { children: ReactNode }) {
  return <div className="space-y-12 md:border-l md:border-line md:pl-8">{children}</div>
}

/** The resume's purple tick beside each entry title. Place it inside a `relative` heading. */
export function Tick() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-[calc(0.5lh_-_1px)] -left-5 h-0.5 w-3 bg-accent md:-left-[33px] md:w-5"
    />
  )
}

/** Italic purple row: dates on the left, place or grade on the right. */
export function MetaRow({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="mt-1.5 flex flex-wrap justify-between gap-x-6 gap-y-0.5 text-sm italic text-accent">
      <span>{left}</span>
      {right && <span>{right}</span>}
    </div>
  )
}

/** Bullet list with the resume's hollow-ring markers. */
export function RingList({ items, small = false }: { items: string[]; small?: boolean }) {
  return (
    <ul className={`ring-list leading-relaxed text-soft ${small ? 'space-y-1.5 text-sm' : 'space-y-2 text-[0.9375rem]'}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/** Small tinted chips for a tech stack. */
export function TechList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
      {items.map((t) => (
        <li key={t} className="rounded bg-brand-soft px-2 py-0.5 text-xs text-accent">
          {t}
        </li>
      ))}
    </ul>
  )
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-accent/40 px-2 py-px text-[11px] font-medium uppercase tracking-wider text-accent">
      {children}
    </span>
  )
}
