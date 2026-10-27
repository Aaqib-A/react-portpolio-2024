import { publications, sectionTitles } from '../data/portfolio'
import { Section } from './Section'

const linkClass =
  'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700'

export function Research() {
  return (
    <Section id="research" title={sectionTitles.research}>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {publications.map((paper) => (
          <article key={paper.title} className="py-7 first:pt-0 last:pb-0">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-6">
              <h3 className="text-black dark:text-white text-base font-semibold leading-snug">{paper.title}</h3>
              <span className="text-neutral-400 dark:text-neutral-600 text-xs shrink-0">{paper.date}</span>
            </div>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs mt-2 leading-[1.7]">
              {paper.venue}
              {paper.publisher && <> &middot; {paper.publisher}</>}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs">
              <a href={paper.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Read paper ↗
              </a>
              {paper.doi && (
                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  DOI {paper.doi}
                </a>
              )}
              {paper.codeUrl && (
                <a href={paper.codeUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Source code ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
