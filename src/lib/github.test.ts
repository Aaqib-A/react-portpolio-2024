import { describe, expect, it } from 'vitest'
import { summarizeRepos, timeAgo, type RawRepo } from './github'

const repo = (overrides: Partial<RawRepo>): RawRepo => ({
  name: 'repo',
  description: null,
  language: 'Python',
  stargazers_count: 0,
  pushed_at: '2026-01-01T00:00:00Z',
  html_url: 'https://github.com/Aaqib-A/repo',
  fork: false,
  ...overrides,
})

describe('summarizeRepos', () => {
  const summary = summarizeRepos(
    'Aaqib-A',
    [
      repo({ name: 'old', pushed_at: '2024-01-01T00:00:00Z' }),
      repo({ name: 'new', language: 'TypeScript', stargazers_count: 3, pushed_at: '2026-10-01T00:00:00Z' }),
      repo({ name: 'forked', fork: true }),
      repo({ name: 'Aaqib-A', language: null }), // profile README repo
      repo({ name: 'notes', language: null, pushed_at: '2025-01-01T00:00:00Z' }),
      repo({ name: 'script', pushed_at: '2025-06-01T00:00:00Z' }),
    ],
    new Date('2026-10-28T00:00:00Z'),
  )

  it('drops forks and the profile repo, newest push first', () => {
    expect(summary.repos.map((r) => r.name)).toEqual(['new', 'script', 'notes', 'old'])
    expect(summary.totalRepos).toBe(4)
  })

  it('maps GitHub fields to the summary shape', () => {
    expect(summary.repos[0]).toMatchObject({ name: 'new', stars: 3, language: 'TypeScript' })
    expect(summary.fetchedAt).toBe('2026-10-28T00:00:00.000Z')
  })

  it('counts primary languages, most used first, ignoring repos without one', () => {
    expect(summary.languages).toEqual([
      { name: 'Python', count: 2 },
      { name: 'TypeScript', count: 1 },
    ])
  })
})

describe('timeAgo', () => {
  const now = Date.parse('2026-10-28T12:00:00Z')

  it.each([
    ['2026-10-28T11:59:30Z', 'just now'],
    ['2026-10-28T11:15:00Z', '45m ago'],
    ['2026-10-28T07:00:00Z', '5h ago'],
    ['2026-10-25T12:00:00Z', '3d ago'],
    ['2026-07-28T12:00:00Z', '3mo ago'],
    ['2024-10-01T12:00:00Z', '2y ago'],
  ])('%s → %s', (iso, expected) => {
    expect(timeAgo(iso, now)).toBe(expected)
  })

  it('never goes negative for future timestamps', () => {
    expect(timeAgo('2026-10-29T00:00:00Z', now)).toBe('just now')
  })
})
