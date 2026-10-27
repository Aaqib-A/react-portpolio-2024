import type { Config } from '@netlify/functions'
import { personal } from '../../src/data/portfolio'
import { summarizeRepos, type RawRepo } from '../../src/lib/github'

// Netlify's durable CDN cache means GitHub is hit roughly once an hour,
// no matter how many visitors load the page.
const CACHE_OK = 'public, durable, s-maxage=3600, stale-while-revalidate=86400'
const CACHE_ERROR = 'public, s-maxage=60'

function json(body: unknown, status: number, cdnCache: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': cdnCache,
    },
  })
}

export default async () => {
  const user = personal.githubUser
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': `${user}-portfolio`,
  }
  // Optional: a token lifts GitHub's 60 req/hour anonymous limit, which is
  // shared by everyone on Netlify's egress IPs.
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, {
      headers,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      return json({ error: `GitHub responded with ${res.status}` }, 502, CACHE_ERROR)
    }
    const repos = (await res.json()) as RawRepo[]
    return json(summarizeRepos(user, repos), 200, CACHE_OK)
  } catch {
    return json({ error: 'GitHub is unreachable right now' }, 502, CACHE_ERROR)
  }
}

export const config: Config = {
  path: '/api/github',
  method: 'GET',
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}
