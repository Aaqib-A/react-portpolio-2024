import { personal } from '../data/portfolio'
import type { GithubState } from '../hooks/useGithub'
import { timeAgo, type GithubSummary } from '../lib/github'
import { ArrowIcon, GithubIcon } from './icons'

// Purple ramp, most used first. Dark mode runs it from light to deep so it stays visible.
const SHADES = [
  'bg-[#492c89] dark:bg-[#c9b8f7]',
  'bg-[#6a4cad] dark:bg-[#a78ce8]',
  'bg-[#8d73c8] dark:bg-[#8668d4]',
  'bg-[#ae9cdc] dark:bg-[#6a4bb8]',
  'bg-[#cfc3ec] dark:bg-[#4f3591]',
  'bg-[#e6e0f5] dark:bg-[#35265e]',
]

const label = 'text-xs font-medium uppercase tracking-[0.15em] text-muted'

export function GithubStrip({ state }: { state: GithubState }) {
  // The live block is a bonus: if the API is down, the page simply omits it.
  if (state.status === 'error') return null

  const profileUrl = `https://github.com/${personal.githubUser}`

  return (
    <div className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="flex items-center gap-2.5 text-[15px] font-medium text-ink">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          Live from GitHub
        </h3>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent underline-offset-4 hover:underline"
        >
          <GithubIcon className="size-4" />
          github.com/{personal.githubUser}
          <ArrowIcon className="size-3.5" />
        </a>
      </div>

      {state.status === 'loading' ? (
        <p className="text-sm italic text-muted">fetching repositories…</p>
      ) : (
        <GithubData data={state.data} />
      )}
    </div>
  )
}

function GithubData({ data }: { data: GithubSummary }) {
  const top = data.languages.slice(0, SHADES.length - 1)
  const rest = data.languages.slice(SHADES.length - 1).reduce((sum, l) => sum + l.count, 0)
  const bars = rest > 0 ? [...top, { name: 'Other', count: rest }] : top
  const total = bars.reduce((sum, l) => sum + l.count, 0)

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <p className="mb-4 text-ink">
          <span className="text-2xl font-medium">{data.totalRepos}</span>{' '}
          <span className="text-sm text-muted">public repositories</span>
        </p>
        {total > 0 && (
          <>
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Primary language of each repository">
              {bars.map((l, i) => (
                <div key={l.name} className={SHADES[i]} style={{ width: `${(l.count / total) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {bars.map((l, i) => (
                <li key={l.name} className="flex items-center gap-2 text-sm text-soft">
                  <span className={`inline-block size-2.5 rounded-full ${SHADES[i]}`} aria-hidden="true" />
                  {l.name} <span className="text-muted">{l.count}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div>
        <h4 className={`${label} mb-3`}>Recently pushed</h4>
        <ul className="space-y-2.5">
          {data.repos.slice(0, 5).map((r) => (
            <li key={r.name} className="flex items-baseline justify-between gap-4 text-sm">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-medium text-ink transition-colors hover:text-accent"
              >
                {r.name}
              </a>
              <span className="shrink-0 text-xs italic text-muted">
                {r.language ?? '—'} · {timeAgo(r.pushedAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
