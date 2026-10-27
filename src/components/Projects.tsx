import { projects, sectionTitles } from '../data/portfolio'
import { useGithub } from '../hooks/useGithub'
import { timeAgo, type RepoSummary } from '../lib/github'
import { GithubStrip } from './GithubStrip'
import { DashList, Section } from './Section'

function LiveMeta({ repo }: { repo?: RepoSummary }) {
  if (!repo) return null
  return (
    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0" title="Live from the GitHub API">
      {repo.stars > 0 && <>★ {repo.stars} · </>}updated {timeAgo(repo.pushedAt)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
        {projects.map((proj) => (
          <a
            key={proj.repo}
            href={proj.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-[#010001] p-4 sm:p-6 group hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors duration-200 flex flex-col"
          >
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h3 className="text-black dark:text-white font-semibold">{proj.name}</h3>
              <span className="text-neutral-300 dark:text-neutral-600 text-xs group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors">
                ↗
              </span>
            </div>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs mb-4">{proj.tagline}</p>
            <DashList items={proj.points} small />
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 mt-auto pt-6">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {proj.tech.map((t) => (
                  <span key={t} className="text-[10px] text-neutral-400 dark:text-neutral-600">
                    {t}
                  </span>
                ))}
              </div>
              <LiveMeta repo={live.get(proj.repo.toLowerCase())} />
            </div>
          </a>
        ))}
      </div>
      <GithubStrip state={github} />
    </Section>
  )
}
