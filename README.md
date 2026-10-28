# Aaqib Ansari · Portfolio

Personal portfolio of Aaqib Ansari, Senior Backend Engineer. It is a minimal, monochrome single page with:

- **An interactive terminal** in the hero. Type `help`, `whoami`, `projects`, `goto contact`, `github`, `theme light` or `sudo hire-aaqib`. It supports Tab completion and ↑/↓ history, and you can press `/` anywhere to focus it.
- **Live GitHub data.** A Netlify Function (`/api/github`) feeds the project cards and the "Live from GitHub" strip. It is cached on Netlify's CDN for an hour and rate-limited per IP.
- **A contact form** handled by Netlify Forms, plus a direct email link.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Netlify Functions · Vitest

## Editing content

All content lives in one file, [`src/data/portfolio.ts`](src/data/portfolio.ts). That includes the bio, skills, experience, projects, research papers, education and links. The page, the terminal commands and the generated `llms.txt` all read from it.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173; /api/github is emulated by @netlify/vite-plugin
npm test           # unit tests (terminal commands, GitHub summary)
npm run lint
npm run build      # type-check + production build into dist/
```

Without a token, GitHub allows 60 API requests per hour per IP. If the live data disappears locally, add `GITHUB_TOKEN=...` to a `.env` file (see below).

## Deploying to Netlify

1. In Netlify, choose **Add new site → Import an existing project** and pick this repository. The build command, publish directory, Node version and functions directory all come from `netlify.toml`.
2. Optional but recommended: add an environment variable **`GITHUB_TOKEN`**. Use a GitHub fine-grained personal access token with **no** permissions; public read access is enough. Netlify's servers share IP addresses, so the anonymous GitHub limit can run out.
3. Under **Forms**, click **Enable form detection** and redeploy. Then go to **Forms → Form notifications → Add notification → Email notification** so contact messages reach your inbox.

After deploying, check that:
- The deploy log lists the `github` function and its rate-limit rule.
- The Forms tab shows a form named `contact`.
- A second request to `/api/github` returns a `cache-status` header showing a Netlify cache hit.

## Credits

The design is adapted from Ali Farhan's [backend-portfolio](https://github.com/OliFarhaan/backend-portfolio) (MIT License, © 2026 Ali Farhan). The grid background, cross markers and shimmer styles in `src/index.css` come from it.
