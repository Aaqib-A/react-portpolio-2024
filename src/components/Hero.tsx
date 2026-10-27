import type { MouseEvent } from 'react'
import { personal, socials } from '../data/portfolio'
import { scrollToSection } from '../lib/page'
import { Terminal } from './terminal/Terminal'

export function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-3 md:gap-6">
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.url}
          target={s.url.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors text-xs uppercase tracking-widest py-1"
        >
          {s.label}
        </a>
      ))}
    </div>
  )
}

function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault()
  scrollToSection(id)
}

export function Hero() {
  return (
    <section id="about" className="pt-2 sm:pt-8 md:pt-24 pb-8 relative">
      <div className="grid-bg" />
      <div className="relative z-10">
        <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.3em] mb-8">
          {personal.title}
        </p>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight shimmer-text">
          {personal.firstName}
          <br />
          {personal.lastName}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-8 max-w-lg leading-[1.8] text-sm">
          {personal.bio} {personal.currentWork.text}{' '}
          <span className="text-black dark:text-white">{personal.currentWork.company}</span>.
        </p>

        <div className="mt-8">
          <SocialLinks />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 text-xs">
          <a
            href="#contact"
            onClick={(e) => jump(e, 'contact')}
            className="text-white dark:text-black bg-black dark:bg-white px-5 py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors uppercase tracking-widest text-center"
          >
            Contact
          </a>
          <a
            href="#experience"
            onClick={(e) => jump(e, 'experience')}
            className="text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 px-5 py-3 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors uppercase tracking-widest text-center"
          >
            My Work
          </a>
        </div>

        <div className="mt-14">
          <Terminal />
        </div>
      </div>
    </section>
  )
}
