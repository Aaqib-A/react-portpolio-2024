import { personal } from '../data/portfolio'
import type { GithubState } from '../hooks/useGithub'
import { timeAgo, type GithubSummary } from '../lib/github'

// Monochrome shades, darkest = most used. Dark mode inverts the ramp.
const SHADES = [
  'bg-neutral-900 dark:bg-neutral-100',
  'bg-neutral-700 dark:bg-neutral-300',
  'bg-neutral-500 dark:bg-neutral-500',
  'bg-neutral-400 dark:bg-neutral-600',
  'bg-neutral-300 dark:bg-neutral-700',
  'bg-neutral-200 dark:bg-neutral-800',
]

const label = 'text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]'

export function GithubStrip({ state }: { state: GithubState }) {
  // The live block is a bonus: if the API is down, the page simply omits it.
  if (state.status === 'error') return null

  const profileUrl = `https://github.com/${personal.githubUser}`

  return (
    <div className="mt-8 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <h3 className={label}>
          <span className="inline-block w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-100 mr-2 align-middle caret" aria-hidden="true" />
          Live from GitHub
        </h3>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          github.com/{personal.githubUser} ↗
        </a>
      </div>

      {state.status === 'loading' ? (
        <p className="text-xs text-neutral-400 dark:text-neutral-500">fetching repositories…</p>
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
        <p className="text-sm text-black dark:text-white mb-4">
          {data.totalRepos} <span className="text-neutral-500 dark:text-neutral-400">public repositories</span>
        </p>
        {total > 0 && (
          <>
            <div className="flex h-2 gap-px" role="img" aria-label="Primary language of each repository">
              {bars.map((l, i) => (
                <div key={l.name} className={SHADES[i]} style={{ width: `${(l.count / total) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {bars.map((l, i) => (
                <li key={l.name} className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className={`inline-block w-2 h-2 ${SHADES[i]}`} aria-hidden="true" />
                  {l.name} <span className="text-neutral-400 dark:text-neutral-600">{l.count}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div>
        <h4 className={`${label} mb-3`}>Recently pushed</h4>
        <ul className="space-y-2">
          {data.repos.slice(0, 5).map((r) => (
            <li key={r.name} className="flex items-baseline justify-between gap-4 text-xs">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors truncate"
              >
                {r.name}
              </a>
              <span className="text-neutral-400 dark:text-neutral-600 shrink-0">
                {r.language ?? '—'} · {timeAgo(r.pushedAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
