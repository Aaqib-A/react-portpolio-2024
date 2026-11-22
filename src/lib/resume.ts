// The portfolio as a JSON Resume (https://jsonresume.org/schema, v1.0.0), derived from portfolio.ts.
// Served at /resume.json (vite.config.ts), printed by the terminal's `cat resume.json` / `resume --json`
// and by `npm run -s resume`. All three call buildResume(), so they always agree.

import {
  certifications,
  education,
  experience,
  fullName,
  isShown,
  personal,
  personalProjects,
  projects,
  publications,
  skills,
  socials,
} from '../data/portfolio.ts'
import { months, parseMonth } from './timeline.ts'

export const RESUME_PATH = '/resume.json'
export const RESUME_URL = `${personal.website}${RESUME_PATH}`
const SCHEMA = 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json'

/** Months since year 0 as an ISO 8601 "YYYY-MM" date. */
const isoMonth = (month: number) => `${Math.floor(month / 12)}-${String((month % 12) + 1).padStart(2, '0')}`

/** "Apr 2022 — Jun 2024" → both dates; "Oct 2024 — Present" → no endDate, which JSON Resume reads as ongoing. */
function dates(period: string): { startDate: string; endDate?: string } {
  const [start, end = start] = months(period)
  return /present/i.test(period)
    ? { startDate: isoMonth(start) }
    : { startDate: isoMonth(start), endDate: isoMonth(end) }
}

/** The last path segment of a profile URL: the GitHub user, LinkedIn slug or ORCID iD. */
const username = (url: string) => new URL(url).pathname.split('/').filter(Boolean).at(-1)

/** "Master of Engineering in Information Technology" → study type and area. */
function degreeParts(degree: string): { studyType: string; area?: string } {
  const match = /^(.+?) in (.+)$/.exec(degree)
  return match ? { studyType: match[1], area: match[2] } : { studyType: degree }
}

/**
 * Optional fields are left `undefined` rather than omitted; JSON.stringify drops them,
 * and every consumer serialises the result.
 */
export function buildResume() {
  return {
    $schema: SCHEMA,
    basics: {
      name: fullName,
      label: personal.title,
      email: personal.email,
      url: personal.website,
      summary: personal.bio,
      location: { city: personal.location.split(',')[0].trim(), countryCode: personal.countryCode },
      profiles: socials
        .filter((s) => !s.url.startsWith('mailto:'))
        .map((s) => ({ network: s.label, username: username(s.url), url: s.url })),
    },
    work: experience.map((e) => ({
      name: e.company,
      position: e.role,
      location: e.location,
      description: e.about,
      url: e.companyUrl,
      ...dates(e.period),
      highlights: e.points,
    })),
    education: education.map((e) => ({
      institution: e.college ? `${e.college}, ${e.institution}` : e.institution,
      ...degreeParts(e.degree),
      ...dates(e.period),
      score: e.grade,
    })),
    skills: Object.entries(skills).map(([name, keywords]) => ({ name, keywords })),
    projects: [
      ...(isShown('projects')
        ? projects.map((p) => ({
            name: p.name,
            description: p.tagline,
            ...dates(p.period),
            highlights: p.points,
            keywords: p.tech,
          }))
        : []),
      ...personalProjects.map((p) => ({
        name: p.name,
        description: p.tagline,
        highlights: p.points,
        keywords: p.tech,
        url: p.url,
      })),
    ],
    publications: publications.map((p) => ({
      name: p.title,
      publisher: p.publisher ?? p.venue,
      releaseDate: isoMonth(parseMonth(p.date)),
      url: p.url,
      summary: [p.publisher && p.venue, p.doi && `DOI ${p.doi}`].filter(Boolean).join('. ') || undefined,
    })),
    certificates: certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      date: isoMonth(parseMonth(c.date)),
      url: c.url,
    })),
    meta: { canonical: RESUME_URL },
  }
}

export type Resume = ReturnType<typeof buildResume>

/** Pretty-printed, for people: the terminal and `npm run -s resume`. */
export const resumeJson = () => JSON.stringify(buildResume(), null, 2)

/** Minified, for /resume.json: fewer bytes and tokens for crawlers and AI tools. */
export const resumeJsonMin = () => JSON.stringify(buildResume())
