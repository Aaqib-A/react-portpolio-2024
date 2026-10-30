import { describe, expect, it } from 'vitest'
import { certifications, education, experience, publications } from '../data/portfolio'
import { buildScaleMap, buildTimeline, groupByYear, monthName, parseMonth, stackLabels } from './timeline'

const NOW = new Date('2026-10-28T12:00:00Z')

describe('parseMonth', () => {
  it('turns "Mon YYYY" into months since year 0 and back', () => {
    expect(parseMonth('Aug 2026')).toBe(2026 * 12 + 7)
    expect(monthName(parseMonth('Jan 2022'))).toBe('Jan')
  })

  it('throws on dates it cannot read', () => {
    expect(() => parseMonth('August 2026')).toThrow()
    expect(() => parseMonth('Present')).toThrow()
  })
})

describe('buildTimeline', () => {
  const entries = buildTimeline(NOW)
  const find = (title: string) => entries.find((e) => e.title === title)

  it('has one entry per role, degree, paper and certification', () => {
    const count = (category: string) => entries.filter((e) => e.category === category).length
    expect(count('work')).toBe(experience.length)
    expect(count('education')).toBe(education.length)
    expect(count('research')).toBe(publications.length)
    expect(count('certifications')).toBe(certifications.length)
  })

  it('sorts newest first', () => {
    const months = entries.map((e) => e.month)
    expect(months).toEqual([...months].sort((a, b) => b - a))
  })

  it('places roles and degrees at their end, keeping where they began', () => {
    expect(find('Master of Engineering in Information Technology')).toMatchObject({
      month: parseMonth('Jan 2022'),
      start: parseMonth('Aug 2019'),
      ongoing: false,
    })
    expect(find('Python Developer')).toMatchObject({ month: parseMonth('Oct 2024'), start: parseMonth('Jul 2024') })
  })

  it('runs a current role up to now', () => {
    expect(find('Software Engineer')).toMatchObject({ month: parseMonth('Oct 2026'), start: parseMonth('Oct 2024'), ongoing: true })
    expect(entries[0].title).toBe('Software Engineer')
  })

  it('gives papers and certifications a single date', () => {
    expect(find('MATLAB Onramp')).toMatchObject({ month: parseMonth('Apr 2021') })
    expect(find('MATLAB Onramp')?.start).toBeUndefined()
  })

  it('links papers and certifications only', () => {
    expect(entries.filter((e) => e.url).map((e) => e.category)).not.toContain('work')
    expect(find('A Space Shooter Game')?.url).toBe(publications.at(-1)?.url)
  })
})

describe('groupByYear', () => {
  it('keeps the order and starts a group at each new year', () => {
    const entries = buildTimeline(NOW)
    const groups = groupByYear(entries)
    expect(groups.map((g) => g.year)).toEqual([...new Set(entries.map((e) => e.year))])
    expect(groups.flatMap((g) => g.entries)).toEqual(entries)
  })
})

describe('buildScaleMap', () => {
  const map = buildScaleMap(buildTimeline(NOW))
  const rail = (title: string) => map.rails.find((r) => r.entry.title === title)!
  // Months from the top (Oct 2026) to the middle of a month.
  const at = (date: string) => parseMonth('Oct 2026') - parseMonth(date) + 0.5

  it('measures everything in months from the newest month down', () => {
    expect(map.span).toBe(parseMonth('Oct 2026') - parseMonth('Jul 2012') + 1)
    expect(map.months[0]).toEqual({ month: parseMonth('Oct 2026'), at: 0.5, now: true })
    expect(map.stops.find((s) => s.entries[0].title === 'MATLAB Onramp')?.ats).toEqual([at('Apr 2021')])
  })

  it('makes each rail as long as the role or degree lasted', () => {
    expect(rail('Software Engineer')).toMatchObject({ at: 0.5, length: 24 })
    expect(rail('Python Developer')).toMatchObject({ at: at('Oct 2024'), length: 3 })
    expect(rail('Master of Engineering in Information Technology')).toMatchObject({ at: at('Jan 2022'), length: 29 })
  })

  it('marks every year, including quiet ones', () => {
    expect(map.years.map((y) => y.year)).toEqual([2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012])
    expect(map.years[0].at).toBe(0)
    expect(map.years[1].at).toBe(parseMonth('Oct 2026') - parseMonth('Dec 2025'))
  })

  it('gives every rail its own lane, the most recent first', () => {
    expect(map.rails.filter((r) => r.entry.category === 'work').map((r) => [r.entry.title, r.lane])).toEqual([
      ['Software Engineer', 0],
      ['Python Developer', 1],
      ['Senior Backend Developer', 2],
      ['Research Intern', 3],
      ['Associate Analyst', 4],
    ])
    expect(map.rails.filter((r) => r.entry.category === 'education').map((r) => r.lane)).toEqual([0, 1, 2])
    expect(map.rails.map((r) => r.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('keeps papers and certifications as one-time stops', () => {
    expect(map.stops.flatMap((s) => s.entries)).toHaveLength(publications.length + certifications.length)
    expect(buildScaleMap([])).toEqual({ span: 0, years: [], months: [], rails: [], stops: [] })
  })

  it('groups certifications at most two months apart into one stop', () => {
    const busy = map.stops.find((s) => s.entries.length > 1)!
    expect(busy.entries.map((e) => e.metaLeft)).toEqual([
      'Aug 2020', 'Jul 2020', 'Jul 2020', 'Jun 2020', 'Jun 2020', 'May 2020', 'Apr 2020',
    ])
    expect(busy.ats).toEqual(busy.entries.map((e) => at(e.metaLeft)))
    // Dec 2019 is four months on, and papers never join a group.
    expect(map.stops.filter((s) => s.entries.length > 1)).toHaveLength(1)
    expect(map.stops.find((s) => s.entries[0].category === 'research')?.entries).toHaveLength(1)
  })
})

describe('stackLabels', () => {
  it('pushes a label down only as far as it overlaps the one above in its column', () => {
    const pushes = stackLabels(
      [
        { y: 0, height: 50, column: 'a' },
        { y: 20, height: 30, column: 'b' }, // another column: stays put
        { y: 40, height: 30, column: 'a' }, // overlaps the first by 10, plus the gap
        { y: 60, height: 30, column: 'a' }, // pushed after the one above it moved
        { y: 200, height: 30, column: 'a' }, // clear of everything
      ],
      8,
    )
    expect(pushes).toEqual([0, 0, 18, 36, 0])
  })
})
