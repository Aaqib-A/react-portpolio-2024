import { footerCredit, fullName } from '../data/portfolio'

const text = 'text-neutral-400 dark:text-neutral-600 text-[11px] tracking-widest uppercase'

export function Footer() {
  return (
    <footer className="max-w-4xl mx-auto px-5 text-center py-8 space-y-2">
      <p className={text}>
        Built by {fullName} &copy; {new Date().getFullYear()}
      </p>
      <p className={text}>
        <a
          href={footerCredit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          {footerCredit.text}
        </a>
        <span className="hidden sm:inline"> · Press / to open the terminal</span>
      </p>
    </footer>
  )
}
