/// <reference types="vitest/config" />
import netlify from '@netlify/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import {
  education,
  experience,
  fullName,
  personal,
  projects,
  publications,
  skills,
  socials,
} from './src/data/portfolio.ts'

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
    `- Resume: ${personal.resumeUrl}`,
    '',
    '## Skills',
    ...Object.entries(skills).map(([category, items]) => `- ${category}: ${items.join(', ')}`),
    '',
    '## Experience',
    ...experience.flatMap((e) => [
      `### ${e.role}, ${e.company} (${e.period})`,
      ...e.points.map((p) => `- ${p}`),
      '',
    ]),
    '## Projects',
    ...projects.map((p) => `- [${p.name}](${p.url}): ${p.tagline}. ${p.points.join(' ')}`),
    '',
    '## Research papers',
    ...publications.map((p) => `- [${p.title}](${p.url}), ${p.venue} (${p.date})${p.doi ? `, DOI ${p.doi}` : ''}`),
    '',
    '## Education',
    ...education.map(
      (e) => `- ${e.degree}, ${e.institution}${e.college ? ` (${e.college})` : ''}, ${e.period}, ${e.grade}`,
    ),
    '',
    '## Contact',
    `- Email: ${personal.email}`,
  ]
  return lines.join('\n') + '\n'
}

/** Injects the site URL into index.html and emits llms.txt, sitemap.xml and robots.txt. */
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt() })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod></url>
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
  test: {
    include: ['src/**/*.test.ts'],
  },
}))
