import { experience, sectionTitles } from '../data/portfolio'
import { Chip, MetaRow, RingList, Section, TechList, Tick, Timeline } from './Section'

export function Experience() {
  return (
    <Section id="experience" title={sectionTitles.experience}>
      <Timeline>
        {experience.map((exp) => (
          <article key={exp.company}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="relative text-xl font-bold leading-snug text-ink">
                <Tick />
                {exp.role}
              </h3>
              {exp.tag && <Chip>{exp.tag}</Chip>}
            </div>
            <p className="text-xl leading-snug text-ink">{exp.company}</p>
            <MetaRow left={exp.period} right={exp.location} />

            <p className="mt-4 mb-2 text-sm italic text-accent">Achievements/Tasks</p>
            <RingList items={exp.points} />
            <div className="mt-5">
              <TechList items={exp.tech} />
            </div>
          </article>
        ))}
      </Timeline>
    </Section>
  )
}
