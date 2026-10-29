import { useState, type MouseEvent } from 'react'
import { fullName, navLinks, personal } from '../data/portfolio'
import { useActiveSection } from '../hooks/useActiveSection'
import { scrollToSection } from '../lib/page'
import { WRAP } from './Section'
import { ThemeToggle } from './ThemeToggle'

const sectionIds = navLinks.map((l) => l.id)
const initials = `${personal.firstName[0]}${personal.lastName[0]}`

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
      className={`rounded-md bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-strong ${extra}`}
    >
      Resume
    </a>
  )

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className={`${WRAP} flex h-16 items-center justify-between`}>
        <a href="#about" onClick={(e) => go(e, 'about')} className="flex items-center gap-2.5 text-ink">
          <span className="grid size-8 place-items-center rounded-md bg-brand text-[13px] font-bold tracking-tight text-white">
            {initials}
          </span>
          <span className="text-[15px] font-medium">{fullName}</span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => go(e, l.id)}
              aria-current={active === l.id ? 'true' : undefined}
              className={`relative text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-[22px] after:h-0.5 after:bg-brand after:transition-opacity ${
                active === l.id ? 'text-accent after:opacity-100' : 'text-soft after:opacity-0 hover:text-accent'
              }`}
            >
              {l.label}
            </a>
          ))}
          <ThemeToggle />
          {resumeButton('px-4 py-2')}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-sm font-medium text-soft hover:text-accent"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-canvas lg:hidden">
          <div className={`${WRAP} flex flex-col gap-1 py-4`}>
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  setOpen(false)
                  go(e, l.id)
                }}
                className="py-3 text-[15px] font-medium text-soft transition-colors hover:text-accent"
              >
                {l.label}
              </a>
            ))}
            {resumeButton('mt-2 w-fit px-4 py-2.5')}
          </div>
        </div>
      )}
    </nav>
  )
}
