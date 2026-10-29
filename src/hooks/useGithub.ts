import { useEffect, useState } from 'react'
import type { GithubSummary } from '../lib/github'

// One request per page load, shared by every component and the terminal.
let pending: Promise<GithubSummary> | null = null

export function loadGithub(): Promise<GithubSummary> {
  pending ??= fetch('/api/github')
    .then(async (res) => {
      if (!res.ok) throw new Error(`GitHub stats unavailable (${res.status})`)
      return (await res.json()) as GithubSummary
    })
    .catch((err: unknown) => {
      pending = null // allow a retry, e.g. from the terminal
      throw err
    })
  return pending
}

export type GithubState =
  | { status: 'loading' }
  | { status: 'ready'; data: GithubSummary }
  | { status: 'error' }

export function useGithub(): GithubState {
  const [state, setState] = useState<GithubState>({ status: 'loading' })

  useEffect(() => {
    let alive = true
    loadGithub().then(
      (data) => alive && setState({ status: 'ready', data }),
      () => alive && setState({ status: 'error' }),
    )
    return () => {
      alive = false
    }
  }, [])

  return state
}
