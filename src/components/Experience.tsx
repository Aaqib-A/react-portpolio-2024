import { experience, sectionTitles } from '../data/portfolio'
import { DashList, Section } from './Section'

export function Experience() {
  return (
    <Section id="experience" title={sectionTitles.experience}>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {experience.map((exp) => (
          <div key={exp.company} className="py-8 first:pt-0 last:pb-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-5">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-black dark:text-white text-base font-semibold">{exp.role}</h3>
                  {exp.tag && (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">
                      {exp.tag}
                    </span>
                  )}
                </div>
                <p className="text-neutral-400 dark:text-neutral-500 text-xs mt-1.5">
                  {exp.company}
                  {exp.location && <> &middot; {exp.location}</>}
                </p>
              </div>
              <span className="text-neutral-400 dark:text-neutral-600 text-xs shrink-0 md:mt-1">{exp.period}</span>
            </div>
            <DashList items={exp.points} />
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-5">
              {exp.tech.map((t) => (
                <span key={t} className="text-[10px] text-neutral-400 dark:text-neutral-600">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
