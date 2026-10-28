// Command registry for the hero terminal. Pure logic: no DOM or React here.
// Side effects (scrolling, theme, clipboard, network) go through TerminalContext,
// which keeps every command unit-testable.

import {
  education,
  experience,
  fullName,
  personal,
  projects,
  publications,
  skills,
  socials,
  terminalIntro,
  type SectionId,
} from '../../data/portfolio'
import { timeAgo, type GithubSummary } from '../../lib/github'

export type Segment = string | { text: string; href?: string; tone?: 'strong' | 'muted' }
export type OutputLine = Segment | Segment[]

export interface CommandResult {
  lines: OutputLine[]
  error?: boolean
  clear?: boolean
}

export interface TerminalContext {
  scrollTo(id: SectionId): void
  getTheme(): 'light' | 'dark'
  setTheme(theme: 'light' | 'dark'): void
  openUrl(url: string): void
  copy(text: string): Promise<boolean>
  fetchGithub(): Promise<GithubSummary>
  prefillContact(message: string): void
  readonly history: readonly string[]
  now(): Date
}

interface Command {
  name: string
  aliases?: string[]
  usage?: string
  description: string
  hidden?: boolean
  /** Argument candidates for Tab completion. */
  args?: () => string[]
  run(args: string[], ctx: TerminalContext): CommandResult | Promise<CommandResult>
}

export const SECTIONS: SectionId[] = [
  'about',
  'skills',
  'experience',
  'projects',
  'research',
  'education',
  'contact',
]

const GITHUB_URL = `https://github.com/${personal.githubUser}`
const HIRE_MESSAGE = `Hi Aaqib,

I came across your portfolio and would like to talk to you about a backend role.

`

// $VARS available to `echo`: the intro lines plus a few shell classics.
const ENV: Record<string, string> = {
  ...Object.fromEntries(terminalIntro.map((t) => [t.prompt.replace('echo $', ''), t.output])),
  USER: 'visitor',
  HOME: '/home/aaqib',
  SHELL: '/bin/portfolio-sh',
  EDITOR: 'vim',
}

const ok = (...lines: OutputLine[]): CommandResult => ({ lines })
const fail = (...lines: OutputLine[]): CommandResult => ({ lines, error: true })
const muted = (text: string): Segment => ({ text, tone: 'muted' })
const strong = (text: string): Segment => ({ text, tone: 'strong' })

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const skillCategories = () => Object.keys(skills).map(slug)

const openTargets = (): Record<string, string> => ({
  github: GITHUB_URL,
  linkedin: socials.find((s) => s.label === 'LinkedIn')?.url ?? GITHUB_URL,
  orcid: socials.find((s) => s.label === 'ORCID')?.url ?? GITHUB_URL,
  resume: personal.resumeUrl,
  email: `mailto:${personal.email}`,
  ...Object.fromEntries(projects.map((p) => [p.repo.toLowerCase(), p.url])),
})

/** Accepts `projects`, `projects/`, `./projects` and `#projects`. */
function toSection(arg: string | undefined): SectionId | undefined {
  const clean = arg?.toLowerCase().replace(/^[.#/]+|\/$/g, '')
  return SECTIONS.find((s) => s === clean)
}

// ── Section printers (shared by cat, ls and the shortcut commands) ──

function printWhoami(): OutputLine[] {
  return [[strong(fullName), ` · ${personal.title} · ${personal.location}`], personal.bio]
}

function printSkills(category?: string): CommandResult {
  const entries = Object.entries(skills)
  if (!category) {
    return ok(...entries.flatMap(([name, items]) => [strong(name), `  ${items.join(', ')}`]))
  }
  const match = entries.find(([name]) => slug(name).startsWith(slug(category)))
  if (!match) {
    return fail(`skills: unknown category '${category}'`, muted(`categories: ${skillCategories().join(', ')}`))
  }
  return ok(strong(match[0]), `  ${match[1].join(', ')}`)
}

function printExperience(): OutputLine[] {
  return experience.flatMap((e) => [
    [strong(e.role), ` @ ${e.company}`],
    muted(`  ${e.period}${e.location ? ` · ${e.location}` : ''}`),
  ])
}

function printProjects(): OutputLine[] {
  return [
    ...projects.map((p): OutputLine => [{ text: p.name, href: p.url, tone: 'strong' }, ` · ${p.tagline}`]),
    '',
    muted("tip: 'open <repo>' opens one on GitHub, e.g. 'open mini-blockchain'"),
  ]
}

function printResearch(): OutputLine[] {
  return publications.flatMap((p): OutputLine[] => [
    strong(p.title),
    muted(`  ${p.venue} · ${p.date}`),
    ['  ', { text: 'read paper', href: p.url }, ...(p.codeUrl ? [muted(' · '), { text: 'source code', href: p.codeUrl }] : [])],
  ])
}

function printEducation(): OutputLine[] {
  return education.flatMap((e) => [
    strong(e.degree),
    ['  ', e.institution, muted(e.college ? ` · ${e.college}` : '')],
    muted(`  ${e.period} · ${e.grade}`),
  ])
}

function printContact(): OutputLine[] {
  return [
    ['email     ', { text: personal.email, href: `mailto:${personal.email}` }],
    ...socials
      .filter((s) => s.label !== 'Email')
      .map((s): OutputLine => [`${s.label.toLowerCase().padEnd(10)}`, { text: s.url.replace(/^https:\/\//, ''), href: s.url }]),
  ]
}

function printSection(section: SectionId): OutputLine[] {
  switch (section) {
    case 'about':
      return printWhoami()
    case 'skills':
      return printSkills().lines
    case 'experience':
      return printExperience()
    case 'projects':
      return printProjects()
    case 'research':
      return printResearch()
    case 'education':
      return printEducation()
    case 'contact':
      return printContact()
  }
}

// ── The registry ──

const commands: Command[] = [
  {
    name: 'help',
    description: 'list available commands',
    run: () => {
      const visible = commands.filter((c) => !c.hidden)
      const width = Math.max(...visible.map((c) => (c.usage ?? c.name).length)) + 3
      return ok(
        'available commands:',
        ...visible.map((c): OutputLine => [strong((c.usage ?? c.name).padEnd(width)), c.description]),
        '',
        muted('Tab completes · ↑/↓ browse history · Ctrl+L clears'),
      )
    },
  },
  {
    name: 'whoami',
    description: 'who is Aaqib?',
    run: () => ok(...printWhoami()),
  },
  {
    name: 'ls',
    usage: 'ls [section]',
    description: 'list sections, or what is inside one',
    args: () => SECTIONS,
    run: ([arg]) => {
      if (!arg) return ok([...SECTIONS.map((s) => `${s}/`), 'resume.pdf'].join('  '))
      const section = toSection(arg)
      if (section === 'projects') return ok(projects.map((p) => p.repo).join('  '))
      if (section === 'skills') return ok(skillCategories().join('  '))
      if (section) return ok(...printSection(section))
      return fail(`ls: cannot access '${arg}': no such section`)
    },
  },
  {
    name: 'cat',
    usage: 'cat <section>',
    description: 'print a section',
    args: () => [...SECTIONS, 'resume.pdf'],
    run: ([arg]) => {
      if (!arg) return fail('usage: cat <section>', muted(`sections: ${SECTIONS.join(', ')}`))
      if (/^resume(\.pdf)?$/i.test(arg)) return fail("cat: resume.pdf: binary file. try 'resume' to open it")
      const section = toSection(arg)
      return section ? ok(...printSection(section)) : fail(`cat: ${arg}: no such section`)
    },
  },
  {
    name: 'goto',
    aliases: ['cd'],
    usage: 'goto <section>',
    description: 'scroll to a section (alias: cd)',
    args: () => SECTIONS,
    run: ([arg], ctx) => {
      const section = !arg || ['~', '..', '/'].includes(arg) ? 'about' : toSection(arg)
      if (!section) return fail(`goto: no such section: ${arg}`, muted(`sections: ${SECTIONS.join(', ')}`))
      ctx.scrollTo(section)
      return ok(muted(`→ #${section}`))
    },
  },
  {
    name: 'skills',
    usage: 'skills [category]',
    description: 'technical skills, optionally one category',
    args: skillCategories,
    run: ([category]) => printSkills(category),
  },
  {
    name: 'experience',
    description: 'work history',
    run: () => ok(...printExperience()),
  },
  {
    name: 'projects',
    description: 'selected projects',
    run: () => ok(...printProjects()),
  },
  {
    name: 'research',
    aliases: ['papers'],
    description: 'published research papers (alias: papers)',
    run: () => ok(...printResearch()),
  },
  {
    name: 'education',
    description: 'degrees and grades',
    run: () => ok(...printEducation()),
  },
  {
    name: 'github',
    description: 'live stats from the GitHub API',
    run: async (_args, ctx) => {
      let data: GithubSummary
      try {
        data = await ctx.fetchGithub()
      } catch {
        return fail('github: could not reach the GitHub API right now. try again in a minute')
      }
      const now = ctx.now().getTime()
      const langs = data.languages
        .slice(0, 5)
        .map((l) => `${l.name} ×${l.count}`)
        .join(' · ')
      return ok(
        [{ text: `github.com/${data.user}`, href: GITHUB_URL, tone: 'strong' }, `  ${data.totalRepos} public repos`],
        `languages  ${langs}`,
        'recently pushed:',
        ...data.repos
          .slice(0, 5)
          .map((r): OutputLine => [
            '  ',
            { text: r.name, href: r.url },
            muted(`  ${r.language ?? '—'} · ${timeAgo(r.pushedAt, now)}`),
          ]),
      )
    },
  },
  {
    name: 'contact',
    description: 'how to reach Aaqib',
    run: (_args, ctx) => {
      ctx.scrollTo('contact')
      return ok(...printContact(), muted('→ #contact'))
    },
  },
  {
    name: 'email',
    description: 'copy his email address',
    run: async (_args, ctx) => {
      const copied = await ctx.copy(personal.email)
      return copied
        ? ok(`copied ${personal.email} to the clipboard`)
        : ok(['email: ', { text: personal.email, href: `mailto:${personal.email}` }])
    },
  },
  {
    name: 'resume',
    description: 'open the resume in a new tab',
    run: (_args, ctx) => {
      ctx.openUrl(personal.resumeUrl)
      return ok(['opening resume… ', muted('('), { text: 'link', href: personal.resumeUrl }, muted(')')])
    },
  },
  {
    name: 'open',
    usage: 'open <target>',
    description: 'open github, linkedin, orcid, resume, email or a repo',
    args: () => Object.keys(openTargets()),
    run: ([target], ctx) => {
      const targets = openTargets()
      const url = target ? targets[target.toLowerCase()] : undefined
      if (!url) {
        return fail(
          target ? `open: unknown target '${target}'` : 'usage: open <target>',
          muted(`targets: ${Object.keys(targets).join(', ')}`),
        )
      }
      ctx.openUrl(url)
      return ok(['opening ', { text: url.replace(/^(https:\/\/|mailto:)/, ''), href: url }])
    },
  },
  {
    name: 'theme',
    usage: 'theme [dark|light]',
    description: 'show or switch the colour theme',
    args: () => ['dark', 'light', 'toggle'],
    run: ([arg], ctx) => {
      const current = ctx.getTheme()
      if (!arg) return ok(`current theme: ${current}`)
      const next = arg === 'toggle' ? (current === 'dark' ? 'light' : 'dark') : arg
      if (next !== 'dark' && next !== 'light') return fail('usage: theme [dark|light|toggle]')
      ctx.setTheme(next)
      return ok(`theme set to ${next}`)
    },
  },
  {
    name: 'echo',
    usage: 'echo <text>',
    description: 'print text ($STATUS, $LOCATION, $STACK work)',
    run: (args) => ok(args.join(' ').replace(/\$([A-Z_]+)/g, (_m, name: string) => ENV[name] ?? '')),
  },
  {
    name: 'history',
    description: 'commands you have run',
    run: (_args, ctx) =>
      ok(...ctx.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`)),
  },
  {
    name: 'date',
    description: 'print the current date',
    run: (_args, ctx) => ok(ctx.now().toString()),
  },
  {
    name: 'clear',
    description: 'clear the terminal',
    run: () => ({ lines: [], clear: true }),
  },
  {
    name: 'sudo',
    usage: 'sudo hire-aaqib',
    description: 'you know you want to',
    args: () => ['hire-aaqib'],
    run: ([arg], ctx) => {
      if (arg?.toLowerCase() !== 'hire-aaqib') {
        return arg
          ? fail('visitor is not in the sudoers file. This incident will be reported.')
          : fail('usage: sudo hire-aaqib')
      }
      ctx.prefillContact(HIRE_MESSAGE)
      ctx.scrollTo('contact')
      return ok(
        '[sudo] password for visitor: ********',
        'access granted. opening a secure channel to Aaqib…',
        muted('→ #contact (message pre-filled, just add your details)'),
      )
    },
  },
  {
    name: 'exit',
    hidden: true,
    description: 'there is no escape',
    run: () => ok("there's no escape. but there is a 'contact' command."),
  },
]

const byName = new Map<string, Command>()
for (const c of commands) {
  byName.set(c.name, c)
  c.aliases?.forEach((a) => byName.set(a, c))
}

export const commandNames = (): string[] =>
  commands.filter((c) => !c.hidden).flatMap((c) => [c.name, ...(c.aliases ?? [])])

export function parse(input: string): { name: string; args: string[] } {
  const [name = '', ...args] = input.trim().split(/\s+/)
  return { name: name.toLowerCase(), args }
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}

export function suggest(name: string): string | undefined {
  let best: { name: string; d: number } | undefined
  for (const candidate of commandNames()) {
    const d = distance(name, candidate)
    if (d <= 2 && (!best || d < best.d)) best = { name: candidate, d }
  }
  return best?.name
}

export async function execute(input: string, ctx: TerminalContext): Promise<CommandResult> {
  const { name, args } = parse(input)
  if (!name) return ok()
  const command = byName.get(name)
  if (!command) {
    const hint = suggest(name)
    return fail(
      `command not found: ${name}`,
      muted(hint ? `did you mean '${hint}'?` : "type 'help' to see what you can do"),
    )
  }
  try {
    return await command.run(args, ctx)
  } catch {
    return fail(`${name}: something went wrong`)
  }
}

function commonPrefix(words: string[]): string {
  return words.reduce((prefix, w) => {
    let i = 0
    while (i < prefix.length && prefix[i] === w[i]) i++
    return prefix.slice(0, i)
  })
}

/** Tab completion: returns the new input value and, when ambiguous, the options. */
export function complete(input: string): { value: string; options: string[] } {
  const endsWithSpace = /\s$/.test(input)
  const tokens = input.trim().split(/\s+/)

  let candidates: string[]
  let partial: string
  let head: string

  if (tokens.length === 1 && !endsWithSpace) {
    partial = tokens[0].toLowerCase()
    candidates = commandNames()
    head = ''
  } else {
    const command = byName.get(tokens[0].toLowerCase())
    if (!command?.args) return { value: input, options: [] }
    partial = endsWithSpace ? '' : tokens[tokens.length - 1].toLowerCase()
    candidates = command.args()
    head = (endsWithSpace ? tokens : tokens.slice(0, -1)).join(' ') + ' '
  }

  const matches = [...new Set(candidates.filter((c) => c.toLowerCase().startsWith(partial)))]
  if (matches.length === 0) return { value: input, options: [] }
  if (matches.length === 1) return { value: `${head}${matches[0]} `, options: [] }
  return { value: `${head}${commonPrefix(matches)}`, options: matches }
}
