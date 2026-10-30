// The achievements timeline, derived from portfolio.ts so it never drifts from the
// sections it summarises. Used by the /timeline page and the terminal's `timeline` command.

import { certifications, education, experience, publications } from '../data/portfolio'

export const TIMELINE_PATH = '/timeline'

export type TimelineCategory = 'work' | 'education' | 'research' | 'certifications'

export const timelineCategories: Record<TimelineCategory, string> = {
  work: 'Work',
  education: 'Education',
  research: 'Research',
  certifications: 'Certifications',
}

export interface TimelineEntry {
  category: TimelineCategory
  /** Months since year 0; entries are sorted and grouped by it. A range sits at its end. */
  month: number
  year: number
  /** Where a role or degree began; only ranges have it. */
  start?: number
  /** A range that runs to the present; its `month` is the current one. */
  ongoing?: boolean
  title: string
  subtitle: string
  /** The italic meta row: dates on the left, place, grade or issuer on the right. */
  metaLeft: string
  metaRight?: string
  url?: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_YEAR = /\b([A-Z][a-z]{2}) (\d{4})\b/g

/** Every "Mon YYYY" in a string, as months since year 0. Throws if there are none. */
function months(text: string): number[] {
  const found = [...text.matchAll(MONTH_YEAR)]
    .map(([, mon, year]) => ({ index: MONTHS.indexOf(mon), year: Number(year) }))
    .filter((m) => m.index >= 0)
    .map((m) => m.year * 12 + m.index)
  if (found.length === 0) throw new Error(`timeline: no "Mon YYYY" date in '${text}'`)
  return found
}

/** Parses a single "Aug 2026" date. */
export const parseMonth = (date: string): number => months(date)[0]

/** The short month name ("Aug") for months since year 0. */
export const monthName = (month: number): string => MONTHS[month % 12]

const at = (month: number) => ({ month, year: Math.floor(month / 12) })

/** A "Mon YYYY — Mon YYYY" or "Mon YYYY — Present" period, placed at its end. */
function span(period: string, now: Date) {
  const [start, end = start] = months(period)
  const ongoing = /present/i.test(period)
  return { ...at(ongoing ? now.getFullYear() * 12 + now.getMonth() : end), start, ongoing }
}

/** All achievements, newest first. Roles and degrees are ranges, placed where they ended. */
export function buildTimeline(now = new Date()): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...experience.map(
      (e): TimelineEntry => ({
        category: 'work',
        ...span(e.period, now),
        title: e.role,
        subtitle: e.company,
        metaLeft: e.period,
        metaRight: e.location,
      }),
    ),
    ...education.map(
      (e): TimelineEntry => ({
        category: 'education',
        ...span(e.period, now),
        title: e.degree,
        subtitle: e.college ?? e.institution,
        metaLeft: e.period,
        metaRight: e.grade,
      }),
    ),
    ...publications.map(
      (p): TimelineEntry => ({
        category: 'research',
        ...at(parseMonth(p.date)),
        title: p.title,
        subtitle: p.venue,
        metaLeft: p.date,
        url: p.url,
      }),
    ),
    ...certifications.map(
      (c): TimelineEntry => ({
        category: 'certifications',
        ...at(parseMonth(c.date)),
        title: c.name,
        subtitle: c.issuer,
        metaLeft: c.date,
        url: c.url,
      }),
    ),
  ]
  // Array.prototype.sort is stable, so same-month entries keep their order above.
  return entries.sort((a, b) => b.month - a.month)
}

/** Groups already-sorted entries by year, keeping their order. */
export function groupByYear(entries: TimelineEntry[]): { year: number; entries: TimelineEntry[] }[] {
  const groups: { year: number; entries: TimelineEntry[] }[] = []
  for (const entry of entries) {
    const last = groups.at(-1)
    if (last?.year === entry.year) last.entries.push(entry)
    else groups.push({ year: entry.year, entries: [entry] })
  }
  return groups
}

export interface Rail {
  entry: TimelineEntry
  /** Months from the top of the map to the middle of the month it ended, where its label sits. */
  at: number
  /** Months it lasted: the rail runs this far down from `at`. */
  length: number
  /** Position among rails of the same category, 0 being the most recent. */
  lane: number
  /** Position among all rails, 0 being the most recent. */
  order: number
}

/** A stop on the main line: one paper or certification, or a run of certifications close together. */
export interface Stop {
  /** Newest first. */
  entries: TimelineEntry[]
  /** Where each entry sits on the main line, matching `entries`. */
  ats: number[]
}

/** Certifications at most this many months apart share one card. */
const CLUSTER_MONTHS = 2

export interface ScaleMap {
  /** Months from the top of the newest month to the bottom of the oldest. */
  span: number
  /** Where each year's newest month begins. */
  years: { year: number; at: number }[]
  /** The middle of every month in which something begins, ends or happens. */
  months: { month: number; at: number; now: boolean }[]
  /** One per role or degree. */
  rails: Rail[]
  /** One-time achievements: papers and certifications. */
  stops: Stop[]
}

/**
 * Lays sorted entries out to scale, newest month at the top. Every position is in months from
 * the top, so the page can turn them into a constant height per month.
 */
export function buildScaleMap(entries: TimelineEntry[]): ScaleMap {
  if (entries.length === 0) return { span: 0, years: [], months: [], rails: [], stops: [] }
  const top = Math.max(...entries.map((e) => e.month))
  const bottom = Math.min(...entries.map((e) => e.start ?? e.month))
  const at = (month: number) => top - month + 0.5

  const years: ScaleMap['years'] = []
  for (let year = Math.floor(top / 12); year >= Math.floor(bottom / 12); year--) {
    years.push({ year, at: Math.max(0, top - (year * 12 + 11)) })
  }
  const months = [...new Set(entries.flatMap((e) => (e.start === undefined ? [e.month] : [e.month, e.start])))]
    .sort((a, b) => b - a)
    .map((month) => ({ month, at: at(month), now: entries.some((e) => e.ongoing && e.month === month) }))

  const ranges = entries.filter((e) => e.start !== undefined)
  const rails = ranges.map(
    (entry, order): Rail => ({
      entry,
      at: at(entry.month),
      length: entry.month - entry.start!,
      lane: ranges.slice(0, order).filter((e) => e.category === entry.category).length,
      order,
    }),
  )
  // A busy spell of certifications shares one card instead of stretching the page.
  const stops: Stop[] = []
  for (const entry of entries.filter((e) => e.start === undefined)) {
    const last = stops.at(-1)
    const prev = last?.entries.at(-1)
    const joins =
      entry.category === 'certifications' &&
      prev?.category === 'certifications' &&
      prev.month - entry.month <= CLUSTER_MONTHS
    if (last && joins) {
      last.entries.push(entry)
      last.ats.push(at(entry.month))
    } else {
      stops.push({ entries: [entry], ats: [at(entry.month)] })
    }
  }
  return { span: top - bottom + 1, years, months, rails, stops }
}

/**
 * Pushes labels down just far enough that none overlap another in the same column. Takes the
 * labels top to bottom and returns how far each one moved.
 */
export function stackLabels(labels: { y: number; height: number; column: string }[], gap: number): number[] {
  const bottoms = new Map<string, number>()
  return labels.map(({ y, height, column }) => {
    const top = Math.max(y, bottoms.get(column) ?? -Infinity)
    bottoms.set(column, top + height + gap)
    return top - y
  })
}
