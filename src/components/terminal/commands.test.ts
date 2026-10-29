import { describe, expect, it, vi } from 'vitest'
import { personal } from '../../data/portfolio'
import type { GithubSummary } from '../../lib/github'
import { complete, execute, parse, suggest, type CommandResult, type TerminalContext } from './commands'

const NOW = new Date('2026-10-28T12:00:00Z')

const github: GithubSummary = {
  user: 'Aaqib-A',
  totalRepos: 2,
  languages: [
    { name: 'Python', count: 1 },
    { name: 'TypeScript', count: 1 },
  ],
  repos: [
    {
      name: 'subtitle-generator',
      description: null,
      language: 'Python',
      stars: 0,
      pushedAt: '2026-10-27T12:00:00Z',
      url: 'https://github.com/Aaqib-A/subtitle-generator',
    },
  ],
  fetchedAt: NOW.toISOString(),
}

function makeCtx(overrides: Partial<TerminalContext> = {}): TerminalContext {
  return {
    scrollTo: vi.fn(),
    getTheme: () => 'dark',
    setTheme: vi.fn(),
    openUrl: vi.fn(),
    copy: vi.fn(async () => true),
    fetchGithub: vi.fn(async () => github),
    prefillContact: vi.fn(),
    history: [],
    now: () => NOW,
    ...overrides,
  }
}

/** Flattens output segments to plain text for easy assertions. */
function text(result: CommandResult): string {
  return result.lines
    .map((line) =>
      (Array.isArray(line) ? line : [line]).map((s) => (typeof s === 'string' ? s : s.text)).join(''),
    )
    .join('\n')
}

describe('parse', () => {
  it('splits the command name and arguments, lowercasing the name', () => {
    expect(parse('  GOTO   Projects ')).toEqual({ name: 'goto', args: ['Projects'] })
  })
})

describe('execute', () => {
  it('lists commands in help', async () => {
    const out = text(await execute('help', makeCtx()))
    expect(out).toContain('whoami')
    expect(out).toContain('sudo hire-aaqib')
    expect(out).not.toContain('there is no escape') // hidden command
  })

  it('suggests the closest command for typos', async () => {
    const result = await execute('projcts', makeCtx())
    expect(result.error).toBe(true)
    expect(text(result)).toContain("did you mean 'projects'?")
    expect(suggest('xyzzy')).toBeUndefined()
  })

  it('scrolls to a section with goto and its cd alias', async () => {
    const ctx = makeCtx()
    await execute('goto projects/', ctx)
    await execute('cd ~', ctx)
    expect(ctx.scrollTo).toHaveBeenNthCalledWith(1, 'projects')
    expect(ctx.scrollTo).toHaveBeenNthCalledWith(2, 'about')
    expect((await execute('cd nowhere', ctx)).error).toBe(true)
  })

  it('prints sections with cat and filters skills by category', async () => {
    const exp = text(await execute('cat experience', makeCtx()))
    expect(exp).toContain('Software Engineer @ The Ninja Studio')
    expect(exp).toContain('Rentokil PCI')
    const skills = text(await execute('skills data', makeCtx()))
    expect(skills).toContain('PostgreSQL')
    expect(skills).not.toContain('Django REST Framework')
  })

  it('lists research papers, also via the papers alias', async () => {
    const out = text(await execute('papers', makeCtx()))
    expect(out).toContain('NLI-GSC: A Natural Language Interface for Generating SourceCode')
    expect(out).toContain('IJACSA')
    expect(text(await execute('ls', makeCtx()))).toContain('research/')
    expect(text(await execute('cat research', makeCtx()))).toContain('A Space Shooter Game')
  })

  it('lists certifications, also via the certs alias', async () => {
    const out = text(await execute('certs', makeCtx()))
    expect(out).toContain('MATLAB Onramp')
    expect(out).toContain('MathWorks · Apr 2021')
    expect(text(await execute('ls', makeCtx()))).toContain('certifications/')
    expect(text(await execute('cat certifications', makeCtx()))).toContain('TensorFlow in Practice')
  })

  it('switches theme, including toggle', async () => {
    const ctx = makeCtx()
    await execute('theme light', ctx)
    await execute('theme toggle', ctx)
    expect(ctx.setTheme).toHaveBeenNthCalledWith(1, 'light')
    expect(ctx.setTheme).toHaveBeenNthCalledWith(2, 'light') // current is dark → light
    expect((await execute('theme blue', ctx)).error).toBe(true)
  })

  it('expands environment variables in echo', async () => {
    expect(text(await execute('echo I am in $LOCATION', makeCtx()))).toBe(`I am in ${personal.location}`)
  })

  it('pre-fills the contact form with sudo hire-aaqib', async () => {
    const ctx = makeCtx()
    const result = await execute('sudo hire-aaqib', ctx)
    expect(result.error).toBeUndefined()
    expect(ctx.prefillContact).toHaveBeenCalledWith(expect.stringContaining('Hi Aaqib'))
    expect(ctx.scrollTo).toHaveBeenCalledWith('contact')
    expect((await execute('sudo rm -rf /', ctx)).error).toBe(true)
  })

  it('opens known targets only', async () => {
    const ctx = makeCtx()
    await execute('open mini-blockchain', ctx)
    expect(ctx.openUrl).toHaveBeenCalledWith('https://github.com/Aaqib-A/mini-blockchain')
    expect((await execute('open evil.com', ctx)).error).toBe(true)
  })

  it('formats live GitHub stats and handles failures', async () => {
    const out = text(await execute('github', makeCtx()))
    expect(out).toContain('2 public repos')
    expect(out).toContain('Python ×1')
    expect(out).toContain('subtitle-generator  Python · 1d ago')

    const failing = makeCtx({ fetchGithub: vi.fn(async () => Promise.reject(new Error('down'))) })
    expect((await execute('github', failing)).error).toBe(true)
  })

  it('falls back to printing the email when the clipboard is unavailable', async () => {
    const out = text(await execute('email', makeCtx({ copy: vi.fn(async () => false) })))
    expect(out).toContain(personal.email)
  })

  it('clears the screen and shows history', async () => {
    expect((await execute('clear', makeCtx())).clear).toBe(true)
    const out = text(await execute('history', makeCtx({ history: ['whoami', 'history'] })))
    expect(out).toContain('1  whoami')
  })
})

describe('complete', () => {
  it('completes a unique command name', () => {
    expect(complete('proj')).toEqual({ value: 'projects ', options: [] })
  })

  it('returns the common prefix and options when ambiguous', () => {
    const result = complete('e')
    expect(result.value).toBe('e')
    expect(result.options).toEqual(expect.arrayContaining(['experience', 'education', 'email', 'echo']))
  })

  it('completes arguments for commands that take them', () => {
    expect(complete('goto ex')).toEqual({ value: 'goto experience ', options: [] })
    expect(complete('sudo h')).toEqual({ value: 'sudo hire-aaqib ', options: [] })
    expect(complete('theme ').options).toEqual(['dark', 'light', 'toggle'])
  })

  it('leaves input alone when nothing matches', () => {
    expect(complete('zzz')).toEqual({ value: 'zzz', options: [] })
    expect(complete('whoami x')).toEqual({ value: 'whoami x', options: [] })
  })
})
