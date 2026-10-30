import type { MouseEvent } from 'react'
import { fullName } from '../data/portfolio'
import { scrollToSection } from '../lib/page'
import type { Page } from './Nav'
import { WRAP } from './Section'

function toTop(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  // Pages without the hero have no #about to land on.
  if (!scrollToSection('about')) window.scrollTo({ top: 0 })
}

/** Closes the page with the same purple band that opens the resume. */
export function Footer({ page = 'home' }: { page?: Page }) {
  return (
    <footer className="bg-brand text-white">
      <div className={`${WRAP} flex flex-col gap-3 py-8 text-sm sm:flex-row sm:items-center sm:justify-between`}>
        <p>
          &copy; {new Date().getFullYear()} {fullName}
        </p>
        {/* The terminal lives in the home page's hero. */}
        {page === 'home' && (
          <p className="hidden text-white/70 md:block">
            Press{' '}
            <kbd className="rounded border border-white/30 px-1.5 py-px font-mono text-xs text-white">/</kbd> to
            open the terminal
          </p>
        )}
        <a href="#about" onClick={toTop} className="text-white/80 underline-offset-4 hover:text-white hover:underline">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
