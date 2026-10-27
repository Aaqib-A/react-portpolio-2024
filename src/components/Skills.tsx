import { sectionTitles, skills, skillsFootnote } from '../data/portfolio'
import { Section } from './Section'

export function Skills() {
  return (
    <Section id="skills" title={sectionTitles.skills}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category} className="bg-white dark:bg-[#010001] p-4 sm:p-5">
            <h3 className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4">
              {category}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {items.map((skill) => (
                <span
                  key={skill}
                  className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
        {/* Spans the leftover cells so the hairline grid never shows an empty gap. */}
        <div className="bg-white dark:bg-[#010001] p-4 sm:p-5 flex items-center justify-center lg:col-span-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-600 italic">{skillsFootnote}</p>
        </div>
      </div>
    </Section>
  )
}
