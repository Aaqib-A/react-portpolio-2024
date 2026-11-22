import type { ReactNode } from 'react'
import { personalProjects, projects, sectionTitles } from '../data/portfolio'
import { useGithub } from '../hooks/useGithub'
import type { RepoSummary } from '../lib/github'
import { GithubStrip } from './GithubStrip'
import { ArrowIcon } from './icons'
import { MetaRow, RingList, Section, TechList } from './Section'

const CARD = 'flex flex-col rounded-xl border border-line bg-surface p-5 sm:p-6'

function Stars({ repo }: { repo?: RepoSummary }) {
  if (!repo?.stars) return null
  return (
    <span className="shrink-0 text-xs italic text-muted" title="Live from the GitHub API">
      ★ {repo.stars}
    </span>
  )
}

interface CardBodyProps {
  name: string
  tagline: string
  period?: string
  points: string[]
  tech: string[]
  /** Linked cards show an arrow and react to hover. */
  linked?: boolean
  footer?: ReactNode
}

function CardBody({ name, tagline, period, points, tech, linked = false, footer }: CardBodyProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-left text-lg font-medium leading-snug text-ink transition-colors group-hover:text-accent">
          {name}
        </h3>
        {linked && <ArrowIcon className="mt-1 size-4 shrink-0 text-muted transition-colors group-hover:text-accent" />}
      </div>
      <div className="mt-1 mb-4">
        <p className="text-sm italic leading-relaxed text-muted">{tagline}</p>
        {period && <MetaRow left={period} />}
      </div>
      <RingList items={points} small />
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-6">
        <TechList items={tech} />
        {footer}
      </div>
    </>
  )
}

/** Client work from the resume. There is no public page, so the cards are not links. */
export function Projects() {
  return (
    <Section id="projects" title={sectionTitles.projects}>
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((proj) => (
          <article key={proj.name} className={CARD}>
            <CardBody {...proj} />
          </article>
        ))}
      </div>
    </Section>
  )
}

/** Projects on GitHub, with live stars and the GitHub activity strip. */
export function PersonalProjects() {
  const github = useGithub()
  const live = new Map(
    github.status === 'ready' ? github.data.repos.map((r) => [r.name.toLowerCase(), r]) : [],
  )

  return (
    <Section id="personal-projects" title={sectionTitles['personal-projects']}>
      <div className="grid gap-5 md:grid-cols-2">
        {personalProjects.map((proj) => (
          <a
            key={proj.repo}
            href={proj.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group ${CARD} transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-xl hover:shadow-brand/10`}
          >
            <CardBody {...proj} linked footer={<Stars repo={live.get(proj.repo.toLowerCase())} />} />
          </a>
        ))}
      </div>
      <GithubStrip state={github} />
    </Section>
  )
}
