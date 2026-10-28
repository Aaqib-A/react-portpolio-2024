import { publications, sectionTitles } from '../data/portfolio'
import { ArrowIcon } from './icons'
import { MetaRow, Section, Tick, Timeline } from './Section'

const linkClass =
  'inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-brand-soft'

export function Research() {
  return (
    <Section id="research" title={sectionTitles.research}>
      <Timeline>
        {publications.map((paper) => (
          <article key={paper.title}>
            <h3 className="relative text-lg font-bold leading-snug text-ink">
              <Tick />
              {paper.title}
            </h3>
            <MetaRow left={paper.date} />
            <p className="mt-1.5 text-sm italic leading-relaxed text-muted">
              {paper.venue}
              {paper.publisher && <> &middot; {paper.publisher}</>}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={paper.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Read paper <ArrowIcon className="size-3.5" />
              </a>
              {paper.doi && (
                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  DOI {paper.doi}
                </a>
              )}
              {paper.codeUrl && (
                <a href={paper.codeUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Source code <ArrowIcon className="size-3.5" />
                </a>
              )}
            </div>
          </article>
        ))}
      </Timeline>
    </Section>
  )
}
