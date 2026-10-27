import { education, highlights, sectionTitles } from '../data/portfolio'
import { DashList, Section } from './Section'

export function Education() {
  return (
    <Section id="education" title={sectionTitles.education}>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {education.map((edu) => (
          <div key={edu.degree} className="py-8 first:pt-0 last:pb-0">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-4">
              <div>
                <h3 className="text-black dark:text-white text-base font-semibold">{edu.degree}</h3>
                <p className="text-neutral-400 dark:text-neutral-500 text-xs mt-1">
                  {edu.institution} &middot; {edu.location}
                </p>
              </div>
              <span className="text-neutral-400 dark:text-neutral-600 text-xs shrink-0">{edu.period}</span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{edu.grade}</p>
            {edu.notes && (
              <div className="mt-3">
                <DashList items={edu.notes} />
              </div>
            )}
            {edu.coursework && (
              <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <h4 className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-3">
                  Coursework
                </h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {edu.coursework.map((course) => (
                    <span key={course} className="text-xs text-neutral-500 dark:text-neutral-400">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}

export function Highlights() {
  return (
    <Section id="highlights" title={sectionTitles.highlights}>
      <DashList items={highlights} />
    </Section>
  )
}
