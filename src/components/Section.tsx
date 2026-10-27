import type { ReactNode } from 'react'
import { CrossLine } from './CrossLine'

interface SectionProps {
  id: string
  title: string
  children: ReactNode
}

export function Section({ id, title, children }: SectionProps) {
  return (
    // Negative margin + padding lets the jump "flash" span the full column.
    <section id={id} className="scroll-mt-20 -mx-5 md:-mx-10 px-5 md:px-10 pb-1">
      <div className="hidden lg:block relative -mx-5 md:-mx-10 mb-8">
        <CrossLine />
      </div>
      <h2 className="text-sm text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.3em] mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        {title}
      </h2>
      <div className="reveal">{children}</div>
    </section>
  )
}

/** Em-dash bullet list used across experience, projects and highlights. */
export function DashList({ items, small = false }: { items: string[]; small?: boolean }) {
  return (
    <ul className={small ? 'space-y-2' : 'space-y-2.5'}>
      {items.map((item) => (
        <li
          key={item}
          className={`${small ? 'text-xs gap-2' : 'text-sm gap-3'} text-neutral-500 dark:text-neutral-400 flex leading-[1.7]`}
        >
          <span className="text-neutral-300 dark:text-neutral-600 shrink-0">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
