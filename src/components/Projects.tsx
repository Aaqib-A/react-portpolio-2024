import { projects, sectionTitles } from '../data/portfolio'
import { useGithub } from '../hooks/useGithub'
import type { RepoSummary } from '../lib/github'
import { GithubStrip } from './GithubStrip'
import { ArrowIcon } from './icons'
import { RingList, Section, TechList } from './Section'

function Stars({ repo }: { repo?: RepoSummary }) {
  if (!repo?.stars) return null
  return (
    <span className="shrink-0 text-xs italic text-muted" title="Live from the GitHub API">
      ★ {repo.stars}
    </span>
  )
}

export function Projects() {
  const github = useGithub()
  const live = new Map(
    github.status === 'ready' ? github.data.repos.map((r) => [r.name.toLowerCase(), r]) : [],
  )

  return (
    <Section id="projects" title={sectionTitles.projects}>
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((proj) => (
          <a
            key={proj.repo}
            href={proj.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-brand/10 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                {proj.name}
              </h3>
              <ArrowIcon className="mt-1 size-4 shrink-0 text-muted transition-colors group-hover:text-accent" />
            </div>
            <p className="mt-1 mb-4 text-sm italic leading-relaxed text-muted">{proj.tagline}</p>
            <RingList items={proj.points} small />
            <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-6">
              <TechList items={proj.tech} />
              <Stars repo={live.get(proj.repo.toLowerCase())} />
            </div>
          </a>
        ))}
      </div>
      <GithubStrip state={github} />
    </Section>
  )
}
