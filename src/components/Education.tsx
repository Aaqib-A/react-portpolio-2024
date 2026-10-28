import { education, sectionTitles } from '../data/portfolio'
import { PinIcon } from './icons'
import { MetaRow, Section, Tick, Timeline } from './Section'

export function Education() {
  return (
    <Section id="education" title={sectionTitles.education}>
      <Timeline>
        {education.map((edu) => (
          <article key={edu.degree}>
            <h3 className="relative text-xl font-bold leading-snug text-ink">
              <Tick />
              {edu.degree}
            </h3>
            {/* The degree-awarding body gets the emphasis; the college sits beneath it. */}
            <p className="text-xl leading-snug text-ink">{edu.institution}</p>
            <MetaRow left={edu.period} right={edu.grade} />
            {edu.college && <p className="mt-2 text-sm italic text-muted">{edu.college}</p>}
            <p className={`${edu.college ? 'mt-1' : 'mt-2'} flex items-center gap-1.5 text-sm italic text-muted`}>
              <PinIcon className="size-3.5 shrink-0" />
              {edu.location}
            </p>
          </article>
        ))}
      </Timeline>
    </Section>
  )
}
