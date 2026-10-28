import { sectionTitles, skills, skillsFootnote } from '../data/portfolio'
import { Section } from './Section'

export function Skills() {
  return (
    <Section id="skills" title={sectionTitles.skills}>
      <div className="divide-y divide-line">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category} className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted sm:pt-2">{category}</h3>
            <ul className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <li key={skill} className="rounded-[5px] bg-brand px-2.5 py-1 text-sm text-white">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-8 text-lg italic text-accent">{skillsFootnote}</p>
    </Section>
  )
}
