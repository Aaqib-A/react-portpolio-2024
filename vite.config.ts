/// <reference types="vitest/config" />
import netlify from '@netlify/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
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
} from './src/data/portfolio.ts'
import { RESUME_PATH, resumeJsonMin } from './src/lib/resume.ts'

// Netlify sets URL to the site's primary address during builds.
const siteUrl = (process.env.URL ?? process.env.SITE_URL ?? 'http://localhost:4173').replace(/\/$/, '')

function llmsTxt(): string {
  const lines = [
    `# ${fullName}`,
    '',
    `> ${personal.title} based in ${personal.location}. ${personal.bio}`,
    '',
    '## Links',
    ...socials.map((s) => `- ${s.label}: ${s.url}`),
    `- Resume (PDF): ${personal.resumeUrl}`,
    `- Resume (JSON Resume): ${siteUrl}${RESUME_PATH}`,
    '',
    '## Skills',
    ...Object.entries(skills).map(([category, items]) => `- ${category}: ${items.join(', ')}`),
    '',
    '## Experience',
    ...experience.flatMap((e) => [
      `### ${e.role}, ${e.company} (${e.period})`,
      ...(e.about ? [e.about] : []),
      ...e.points.map((p) => `- ${p}`),
      '',
    ]),
    ...(isShown('projects')
      ? [
          '## Projects',
          ...projects.map((p) => `- ${p.name} (${p.period}): ${p.tagline}. ${p.points.join(' ')}`),
          '',
        ]
      : []),
    '## Personal projects',
    ...personalProjects.map((p) => `- [${p.name}](${p.url}): ${p.tagline}. ${p.points.join(' ')}`),
    '',
    '## Research papers',
    ...publications.map((p) => `- [${p.title}](${p.url}), ${p.venue} (${p.date})${p.doi ? `, DOI ${p.doi}` : ''}`),
    '',
    '## Education',
    ...education.map(
      (e) => `- ${e.degree}, ${e.institution}${e.college ? ` (${e.college})` : ''}, ${e.period}, ${e.grade}`,
    ),
    '',
    '## Certifications',
    ...certifications.map(
      (c) => `- [${c.name}](${c.url}), ${c.issuer} (${c.date})${c.credentialId ? `, credential ID ${c.credentialId}` : ''}`,
    ),
    '',
    '## Contact',
    `- Email: ${personal.email}`,
  ]
  return lines.join('\n') + '\n'
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/**
 * Plain HTML that sits in #root until React replaces it. Tools that read raw HTML without running
 * JavaScript (AI assistants, recruiter scrapers, link previews) get a summary and links to the
 * machine-readable resume. `.js #root > .static-summary` in index.css hides it from everyone else.
 */
function staticSummary(): string {
  const link = (href: string, text = href) => `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`
  return [
    '<div class="static-summary">',
    `<h1>${escapeHtml(`${fullName}, ${personal.title}`)}</h1>`,
    `<p>${escapeHtml(`${personal.location}. ${personal.bio}`)}</p>`,
    `<p>Resume as JSON (JSON Resume format): ${link(`${siteUrl}${RESUME_PATH}`)}. ` +
      `Full profile as text: ${link(`${siteUrl}/llms.txt`)}. ` +
      `Achievements timeline: ${link(`${siteUrl}/timeline`)}.</p>`,
    `<p>${socials.map((s) => link(s.url, s.url.startsWith('mailto:') ? personal.email : s.label)).join(' · ')}</p>`,
    '</div>',
  ].join('')
}

/**
 * Injects the site URL and the static summary into every HTML page, and emits llms.txt,
 * resume.json, sitemap.xml and robots.txt.
 */
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) =>
      html.replace('<!--static-summary-->', staticSummary()).replaceAll('__SITE_URL__', siteUrl),
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt() })
      this.emitFile({ type: 'asset', fileName: RESUME_PATH.slice(1), source: resumeJsonMin() })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod></url>
  <url><loc>${siteUrl}/timeline</loc><lastmod>${today}</lastmod></url>
</urlset>
`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    siteMeta(),
    // Emulates Netlify Functions (/api/github) during `vite dev`; not needed for builds or tests.
    // Edge functions are off: the site has none, and that emulator needs a matching Deno install.
    ...(command === 'serve' && !process.env.VITEST ? [netlify({ edgeFunctions: { enabled: false } })] : []),
  ],
  build: {
    // Two pages: the portfolio and the achievements timeline (served at /timeline).
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        timeline: resolve(import.meta.dirname, 'timeline.html'),
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
}))
