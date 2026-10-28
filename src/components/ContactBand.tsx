import type { ReactNode } from 'react'
import { personal, socials } from '../data/portfolio'
import { PinIcon, SocialIcon } from './icons'
import { WRAP } from './Section'

interface Item {
  icon: ReactNode
  text: string
  href?: string
}

const iconClass = 'size-[18px] shrink-0'
const display = (url: string) => url.replace(/^(https:\/\/(www\.)?|mailto:)/, '').replace(/\/$/, '')

// Same order as the resume's band: email, location, then profiles.
const items: Item[] = [
  ...socials
    .filter((s) => s.label === 'Email')
    .map((s) => ({ icon: <SocialIcon label={s.label} className={iconClass} />, text: display(s.url), href: s.url })),
  { icon: <PinIcon className={iconClass} />, text: personal.location },
  ...socials
    .filter((s) => s.label !== 'Email')
    .map((s) => ({ icon: <SocialIcon label={s.label} className={iconClass} />, text: display(s.url), href: s.url })),
]

/** The purple contact strip from the top of the resume. */
export function ContactBand() {
  return (
    <div className="bg-brand text-white">
      <ul
        aria-label="Contact details"
        className={`${WRAP} grid gap-x-8 gap-y-4 py-6 text-[15px] sm:grid-cols-2 lg:grid-cols-3`}
      >
        {items.map((item) => (
          <li key={item.text} className="flex min-w-0 items-center gap-3">
            {item.icon}
            {item.href ? (
              <a
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="truncate underline-offset-4 hover:underline"
              >
                {item.text}
              </a>
            ) : (
              <span className="truncate">{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
