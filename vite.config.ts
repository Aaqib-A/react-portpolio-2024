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
 * machine-readable resume. STATIC_SUMMARY_CSS hides it from everyone else.
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
 * Inlined in <head> rather than kept in index.css: the stylesheet can arrive after the first paint
 * (always under `vite dev`, which injects CSS from JavaScript), and the summary must never flash.
 * The head script adds `.js` before <body> is parsed, so JavaScript visitors never see it; without
 * JavaScript it gets a tidy layout in the site's light colours. Extractors ignore styles, so they
 * still read it.
 */
const STATIC_SUMMARY_CSS = [
  '.js .static-summary{display:none}',
  '.static-summary{max-width:42rem;margin:0 auto;padding:3rem 1.25rem;line-height:1.6;color:#3b3845;' +
    "font-family:Roboto,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}",
  '.static-summary h1{margin:0;font-size:1.75rem;line-height:1.25;color:#492c89}',
  '.static-summary p{margin:1rem 0 0;text-align:left}',
  '.static-summary a{color:#492c89;text-decoration:underline;text-underline-offset:3px}',
].join('')

/**
 * Injects the site URL and the static summary (with its styles) into every HTML page, and emits
 * llms.txt, resume.json, sitemap.xml and robots.txt.
 */
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) => ({
      html: html.replace('<!--static-summary-->', staticSummary()).replaceAll('__SITE_URL__', siteUrl),
      tags: [{ tag: 'style', children: STATIC_SUMMARY_CSS, injectTo: 'head' }],
    }),
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
