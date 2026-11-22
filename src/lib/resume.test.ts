import { describe, expect, it } from 'vitest'
import {
  certifications,
  education,
  experience,
  isShown,
  personal,
  personalProjects,
  projects,
  publications,
  skills,
} from '../data/portfolio'
import { buildResume, RESUME_URL, resumeJson, resumeJsonMin } from './resume'

// What consumers actually get: JSON.stringify drops the undefined optional fields.
const resume = JSON.parse(resumeJsonMin()) as ReturnType<typeof buildResume>
const ISO_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

describe('buildResume', () => {
  it('follows the JSON Resume v1.0.0 layout', () => {
    expect(resume.$schema).toContain('jsonresume/resume-schema/v1.0.0')
    expect(resume.basics).toMatchObject({ name: 'Aaqib Ansari', url: personal.website, email: personal.email })
    expect(resume.basics.location).toEqual({ city: 'Mumbai', countryCode: 'IN' })
    expect(resume.basics.profiles.map((p) => p.network)).toEqual(['GitHub', 'LinkedIn', 'ORCID'])
    expect(resume.basics.profiles.find((p) => p.network === 'GitHub')?.username).toBe(personal.githubUser)
    expect(resume.meta.canonical).toBe(RESUME_URL)
  })

  it('includes every role, degree, paper, certificate and personal project', () => {
    expect(resume.work.map((w) => [w.position, w.name])).toEqual(experience.map((e) => [e.role, e.company]))
    expect(resume.work.map((w) => w.highlights)).toEqual(experience.map((e) => e.points))
    expect(resume.education).toHaveLength(education.length)
    education.forEach((e, i) => expect(resume.education[i].institution).toContain(e.college ?? e.institution))
    expect(resume.publications.map((p) => p.name)).toEqual(publications.map((p) => p.title))
    expect(resume.certificates.map((c) => c.name)).toEqual(certifications.map((c) => c.name))
    for (const p of personalProjects) expect(resume.projects.map((r) => r.name)).toContain(p.name)
  })

  it('splits degrees into study type and area', () => {
    expect(resume.education[0]).toMatchObject({ studyType: 'Master of Engineering', area: 'Information Technology' })
  })

  it('keeps hidden sections out', () => {
    if (isShown('projects')) return
    for (const p of projects) expect(resume.projects.map((r) => r.name)).not.toContain(p.name)
  })

  it('uses ISO year-month dates, with no end date for ongoing roles', () => {
    const ranges = [...resume.work, ...resume.education]
    for (const r of ranges) {
      expect(r.startDate).toMatch(ISO_MONTH)
      if (r.endDate !== undefined) {
        expect(r.endDate).toMatch(ISO_MONTH)
        expect(r.endDate >= r.startDate).toBe(true)
      }
    }
    experience.forEach((e, i) => expect(resume.work[i].endDate === undefined).toBe(/present/i.test(e.period)))
    for (const p of resume.publications) expect(p.releaseDate).toMatch(ISO_MONTH)
    for (const c of resume.certificates) expect(c.date).toMatch(ISO_MONTH)
  })

  it('lists skills by category', () => {
    expect(resume.skills).toEqual(Object.entries(skills).map(([name, keywords]) => ({ name, keywords })))
  })

  it('serialises the same object pretty and minified, and stays small', () => {
    expect(JSON.parse(resumeJson())).toEqual(resume)
    // A guard against bloat: the minified file is ~12 KB today.
    expect(resumeJsonMin().length).toBeLessThan(16_000)
  })
})
