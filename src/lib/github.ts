// Shared between the Netlify function (server) and the UI (client).

export interface RepoSummary {
  name: string
  description: string | null
  language: string | null
  stars: number
  pushedAt: string
  url: string
}

export interface GithubSummary {
  user: string
  totalRepos: number
  languages: { name: string; count: number }[]
  repos: RepoSummary[]
  fetchedAt: string
}

/** Subset of the GitHub REST "repository" object that we read. */
export interface RawRepo {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
  html_url: string
  fork: boolean
  archived?: boolean
}

export function summarizeRepos(user: string, raw: RawRepo[], now = new Date()): GithubSummary {
  const own = raw
    // Forks aren't his work, and the profile README repo isn't a project.
    .filter((r) => !r.fork && r.name.toLowerCase() !== user.toLowerCase())
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))

  const counts = new Map<string, number>()
  for (const r of own) {
    if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1)
  }
  const languages = [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return {
    user,
    totalRepos: own.length,
    languages,
    repos: own.map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
      url: r.html_url,
    })),
    fetchedAt: now.toISOString(),
  }
}

const UNITS: [label: string, seconds: number][] = [
  ['y', 365 * 86400],
  ['mo', 30 * 86400],
  ['d', 86400],
  ['h', 3600],
  ['m', 60],
]

export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - Date.parse(iso)) / 1000))
  for (const [label, size] of UNITS) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`
  }
  return 'just now'
}
