# Aaqib Ansari · Portfolio

Personal portfolio of Aaqib Ansari, Senior Software Engineer. The design extends the resume (Roboto, the resume's `#492c89` purple, its contact band, section headings, ticks and skill pills) into a single page with:

- **An interactive terminal** in the hero. Type `help`, `whoami`, `projects`, `goto contact`, `github`, `cat resume.json`, `theme light` or `sudo hire-aaqib`. It supports Tab completion and ↑/↓ history, and you can press `/` anywhere to focus it.
- **Live GitHub data.** A Netlify Function (`/api/github`) feeds the project cards and the "Live from GitHub" strip. It is cached on Netlify's CDN for an hour and rate-limited per IP.
- **A contact form** handled by Netlify Forms, plus a direct email link.
- **An achievements timeline** at `/timeline`: every role, degree, research paper and certification on one vertical timeline, filterable by category. It is drawn to scale like a rail map: each role and degree runs on its own rail, as long as it lasted, with papers and certifications as stops on the main line (certifications earned close together share one card). It is built from the same data as the main page, so there is nothing extra to update. The terminal's `timeline [category]` command prints it too.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Netlify Functions · Vitest

## Editing content

All content lives in one file, [`src/data/portfolio.ts`](src/data/portfolio.ts). That includes the bio, skills, experience, projects, research papers, education, certifications and links. The main page, the `/timeline` page, the terminal commands and the generated `llms.txt` and `resume.json` all read from it.

## Resume as JSON

The site renders with JavaScript, so tools that only read raw HTML (AI assistants, recruiter and ATS scrapers, link previews) can't see its content. For them, the whole portfolio is also published as a [JSON Resume](https://jsonresume.org/schema), built from `portfolio.ts` by [`src/lib/resume.ts`](src/lib/resume.ts). Every page links to it, in the `<head>` and in a short plain-HTML summary inside `#root` that React replaces on load.

| Where | How |
| --- | --- |
| On the web | [`https://aaqib-ansari.dev/resume.json`](https://aaqib-ansari.dev/resume.json) (minified, CORS-enabled) |
| In the site's terminal | `cat resume.json`, or `resume --json` |
| In this repo | `npm run -s resume`, or `npm run -s resume > resume.json` to save it |

All three return the same object. In the repo command, `-s` keeps npm's banner out of the output, so it can be piped straight into `jq` or a file.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173; /api/github is emulated by @netlify/vite-plugin
npm test           # unit tests (terminal commands, GitHub summary, timeline, resume.json)
npm run lint
npm run build      # type-check + production build into dist/
npm run -s resume  # print the resume as JSON (JSON Resume format)
```

Without a token, GitHub allows 60 API requests per hour per IP. If the live data disappears locally, add `GITHUB_TOKEN=...` to a `.env` file (see below).

## Deploying to Netlify

1. In Netlify, choose **Add new site → Import an existing project** and pick this repository. The build command, publish directory, Node version and functions directory all come from `netlify.toml`.
2. Optional but recommended: add an environment variable **`GITHUB_TOKEN`**. Use a GitHub fine-grained personal access token with **no** permissions; public read access is enough. Netlify's servers share IP addresses, so the anonymous GitHub limit can run out.
3. Open **Forms** in the project's left sidebar (not under Project configuration), click **Enable form detection**, then redeploy. Then go to **Forms → Submission notifications → Add notification → Email notification** so contact messages reach your inbox.

After deploying, check that:
- The deploy log lists the `github` function and its rate-limit rule.
- The Forms tab shows a form named `contact`.
- A second request to `/api/github` returns a `cache-status` header showing a Netlify cache hit.

If the contact form shows "Something went wrong" and a POST to `/` returns the 404 page, Netlify hasn't registered the form: form detection is off, or the site hasn't been redeployed since it was turned on. You can tell from the live HTML. Once detection has run, the hidden `<form name="contact">` no longer has `data-netlify="true"` and gains a hidden `form-name` input. Netlify Forms doesn't run under `npm run dev`, so the form always shows the error locally.

## Design tokens

Colours live as CSS variables at the top of [`src/index.css`](src/index.css) (`--accent`, `--brand`, `--ink`, …) with a dark-mode set under `html.dark`. Components only use the semantic Tailwind names (`text-accent`, `bg-brand`, `border-line`, …), so a palette change is a one-file edit.
