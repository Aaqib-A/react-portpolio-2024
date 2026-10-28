import { education, sectionTitles } from '../data/portfolio'
import { Section } from './Section'

export function Education() {
  return (
    <Section id="education" title={sectionTitles.education}>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {education.map((edu) => (
          <div key={edu.degree} className="py-8 first:pt-0 last:pb-0">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-4">
              <div>
                <h3 className="text-black dark:text-white text-base font-semibold">{edu.degree}</h3>
                {/* The degree-awarding body gets the emphasis; the college sits beneath it. */}
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mt-2">{edu.institution}</p>
                <p className="text-neutral-400 dark:text-neutral-500 text-xs mt-1">
                  {edu.college && <>{edu.college} &middot; </>}
                  {edu.location}
                </p>
              </div>
              <span className="text-neutral-400 dark:text-neutral-600 text-xs shrink-0">{edu.period}</span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{edu.grade}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
