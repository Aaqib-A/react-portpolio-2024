import { useState, type MouseEvent } from 'react'
import { fullName, navLinks, personal } from '../data/portfolio'
import { useActiveSection } from '../hooks/useActiveSection'
import { scrollToSection } from '../lib/page'
import { CrossLine } from './CrossLine'
import { ThemeToggle } from './ThemeToggle'

const sectionIds = navLinks.map((l) => l.id)

function go(e: MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault()
  scrollToSection(id)
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const active = useActiveSection(sectionIds)

  const resumeButton = (extra: string) => (
    <a
      href={personal.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-xs text-white dark:text-black bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-200 uppercase tracking-widest ${extra}`}
    >
      Resume
    </a>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-5 md:px-10 flex items-center justify-between h-14">
        <a
          href="#about"
          onClick={(e) => go(e, 'about')}
          className="text-black dark:text-white font-bold text-sm tracking-wider uppercase"
        >
          {fullName}
        </a>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => go(e, l.id)}
              aria-current={active === l.id ? 'true' : undefined}
              className={`text-xs uppercase tracking-widest transition-colors duration-200 ${
                active === l.id
                  ? 'text-black dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {l.label}
            </a>
          ))}
          <ThemeToggle />
          {resumeButton('px-4 py-1.5')}
        </div>

        <div className="flex lg:hidden items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? 'close' : 'menu'}
          </button>
        </div>
      </div>

      <div className="hidden lg:block max-w-4xl mx-auto">
        <CrossLine />
      </div>
      <div className="lg:hidden h-px bg-neutral-200 dark:bg-neutral-800" />

      {open && (
        <div className="lg:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 backdrop-blur-sm">
          <div className="px-5 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  setOpen(false)
                  go(e, l.id)
                }}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest py-3"
              >
                {l.label}
              </a>
            ))}
            {resumeButton('px-4 py-3 w-fit mt-2')}
          </div>
        </div>
      )}
    </nav>
  )
}
