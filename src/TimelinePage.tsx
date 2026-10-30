import { Fragment, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Footer } from './components/Footer'
import { ArrowIcon } from './components/icons'
import { Nav } from './components/Nav'
import { MetaRow, WRAP } from './components/Section'
import { useRevealOnScroll } from './hooks/useRevealOnScroll'
import { useStackedLabels } from './hooks/useStackedLabels'
import {
  buildScaleMap,
  buildTimeline,
  monthName,
  timelineCategories,
  type Rail,
  type ScaleMap,
  type TimelineCategory,
  type TimelineEntry,
} from './lib/timeline'

type Filter = TimelineCategory | 'all'

const entries = buildTimeline()
const categories = Object.keys(timelineCategories) as TimelineCategory[]
const count = (filter: Filter) =>
  filter === 'all' ? entries.length : entries.filter((e) => e.category === filter).length
const firstYear = Math.floor(Math.min(...entries.map((e) => e.start ?? e.month)) / 12)
const keyOf = (e: TimelineEntry) => `${e.category}:${e.title}:${e.month}`

/** Custom properties for inline styles; grid placement reads them through Tailwind's `-(--var)` utilities. */
const vars = (values: Record<string, string | number>) => values as CSSProperties

/**
 * Everything on the map shares one grid row and sits `--at` months down it, at a constant `--p`
 * px per month, nudged by `--dy` (e.g. to centre a dot) and `--push` (set by useStackedLabels).
 */
const place = (at: number, dy?: number, more: Record<string, string | number> = {}) => ({
  ...vars({ '--at': at, ...(dy === undefined ? {} : { '--dy': `${dy}px` }), ...more }),
  marginTop: 'calc(var(--at) * var(--p) + var(--dy, 0px) + var(--push, 0px))',
})

type RailKind = 'work' | 'education'
const RAIL: Record<RailKind, { bg: string; border: string; edge: string }> = {
  work: { bg: 'bg-accent', border: 'border-accent', edge: 'border-l-accent' },
  education: { bg: 'bg-edu', border: 'border-edu', edge: 'border-l-edu' },
}

// Stations are centred on their month: --dy pulls them up by half their size.
const STATION =
  'relative z-20 row-start-1 size-[11px] self-start justify-self-center rounded-full border-2 [--dy:-5.5px] lg:size-[13px] lg:[--dy:-6.5px]'
// A label's leader line meets it this far below its top.
const LEADER = 22

/**
 * Grid columns: month names, then the rails. On phones every rail sits on the left of the main
 * line; from lg up, work rails sit left of it and education rails right, each with its labels
 * on the outside and the most recent rail next to the main line.
 */
function gridColumns(map: ScaleMap) {
  const work = map.rails.filter((r) => r.entry.category === 'work').length
  const edu = map.rails.length - work
  const lanes = (n: number, width: string) => Array<string>(n).fill(width)
  const phone = ['3.5rem', ...lanes(map.rails.length, '0.75rem'), '1rem', 'minmax(0,1fr)']
  // The three label columns keep their widths when a filter empties them, so nothing jumps sideways.
  const wide = [
    '5rem',
    'minmax(0,1fr)',
    ...lanes(work, '1.25rem'),
    '1.5rem',
    'minmax(0,1.15fr)',
    ...lanes(edu, '1.25rem'),
    'minmax(0,1fr)',
  ]
  const eduLabels = 5 + work + edu
  return {
    style: vars({
      '--cols': phone.join(' '),
      '--cols-lg': wide.join(' '),
      '--center': 2 + map.rails.length,
      '--cards': 3 + map.rails.length,
      '--center-lg': 3 + work,
      '--cards-lg': 4 + work,
      '--edu-lg': eduLabels,
    }),
    /** Desktop placement of a rail's lane, and of the connector from it to its label. */
    lane(rail: Rail) {
      if (rail.entry.category === 'work') {
        const col = 2 + work - rail.lane
        return { '--c-lg': col, '--k0': 3, '--k1': col + 1, '--kl': '0px', '--kr': '0.625rem' }
      }
      const col = 5 + work + rail.lane
      return { '--c-lg': col, '--k0': col, '--k1': eduLabels, '--kl': '0.625rem', '--kr': '0px' }
    },
  }
}

/**
 * A label hanging off the map. If it had to be pushed down to clear the one above, a leader
 * line drops from its station's height to it.
 */
function Label({
  at,
  stack,
  line,
  className,
  children,
}: {
  at: number
  stack: 'work' | 'stops' | 'edu'
  line: string
  className: string
  children: ReactNode
}) {
  // Work labels sit left of their rails from lg up, so their leader comes in from the right.
  const side = stack === 'work' ? 'left-0 lg:right-0 lg:left-auto' : 'left-0'
  return (
    <div
      data-stack={stack}
      data-at={at}
      data-dy={-LEADER}
      className={`reveal relative z-30 row-start-1 self-start pl-3 ${className}`}
      style={place(at, -LEADER)}
    >
      <span
        aria-hidden="true"
        className={`absolute w-0.5 ${side} ${line}`}
        style={{ top: `calc(${LEADER}px - var(--push, 0px))`, height: 'calc(var(--push, 0px) + 1px)' }}
      />
      <span aria-hidden="true" className={`absolute h-0.5 w-3 ${side} ${line}`} style={{ top: LEADER - 1 }} />
      {children}
    </div>
  )
}

function RailCard({ entry, kind }: { entry: TimelineEntry; kind: RailKind }) {
  return (
    <div className={`rounded-lg border border-l-[3px] border-line bg-surface px-3.5 py-2.5 ${RAIL[kind].edge}`}>
      <h3 className="font-bold leading-snug text-ink">{entry.title}</h3>
      <p className="text-sm leading-snug text-soft">{entry.subtitle}</p>
      <MetaRow left={entry.metaLeft} right={entry.metaRight} />
    </div>
  )
}

function StopCard({ entry }: { entry: TimelineEntry }) {
  const body = (
    <>
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
        {entry.title}
      </h3>
      <p className="mt-0.5 truncate text-xs text-muted">
        <span className="text-accent italic">{entry.metaLeft}</span> · {timelineCategories[entry.category]} ·{' '}
        {entry.subtitle}
      </p>
    </>
  )
  const card = 'block rounded-lg border border-line bg-surface px-3 py-2'
  return entry.url ? (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      title={entry.title}
      className={`group relative pr-8 ${card} transition-colors hover:border-accent/50`}
    >
      {body}
      <ArrowIcon className="absolute top-2.5 right-2.5 size-3.5 text-muted transition-colors group-hover:text-accent" />
    </a>
  ) : (
    <div className={card}>{body}</div>
  )
}

/** A run of certifications that came close together, listed newest first. */
function ClusterCard({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2">
      <h3 className="text-sm font-semibold leading-snug text-ink">{entries.length} certifications</h3>
      <p className="text-xs text-accent italic">
        {entries.at(-1)!.metaLeft} — {entries[0].metaLeft}
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {entries.map((e) => (
          <li key={keyOf(e)}>
            <a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${e.title} · ${e.subtitle} · ${e.metaLeft}`}
              className="group flex items-baseline gap-2 text-xs leading-5"
            >
              <span className="w-7 shrink-0 text-accent italic">{monthName(e.month)}</span>
              <span className="min-w-0 truncate text-soft transition-colors group-hover:text-accent">{e.title}</span>
              <span className="ml-auto hidden shrink-0 text-muted sm:inline">{e.subtitle}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A to-scale rail map of every role, degree, paper and certification, newest first. */
export default function TimelinePage() {
  const [filter, setFilter] = useState<Filter>('all')
  const visible = filter === 'all' ? entries : entries.filter((e) => e.category === filter)
  const map = buildScaleMap(visible)
  const grid = gridColumns(map)
  const stopAts = [...new Set(map.stops.flatMap((s) => s.ats))]
  const timeline = useRef<HTMLDivElement>(null)
  useRevealOnScroll(filter)
  useStackedLabels(timeline, filter)

  // Year headings and labels in reading order, newest first.
  const content: { at: number; node: ReactNode }[] = [
    ...map.years.map((y) => ({
      at: y.at,
      node: (
        <h2
          key={`year-${y.year}`}
          className="col-span-full row-start-1 self-start border-t border-line pt-0.5 text-xs font-bold leading-4 text-ink"
          style={place(y.at)}
        >
          {y.year}
        </h2>
      ),
    })),
    ...map.rails.map((rail) => {
      const kind = rail.entry.category as RailKind
      return {
        at: rail.at,
        node: (
          <Label
            key={keyOf(rail.entry)}
            at={rail.at}
            stack={kind === 'work' ? 'work' : 'edu'}
            line={`${RAIL[kind].bg} opacity-60`}
            className={
              kind === 'work'
                ? 'col-start-(--cards) lg:col-start-2 lg:pr-3 lg:pl-0'
                : 'col-start-(--cards) lg:col-start-(--edu-lg)'
            }
          >
            <RailCard entry={rail.entry} kind={kind} />
          </Label>
        ),
      }
    }),
    ...map.stops.map((stop) => ({
      at: stop.ats[0],
      node: (
        <Label
          key={keyOf(stop.entries[0])}
          at={stop.ats[0]}
          stack="stops"
          line="bg-accent/40"
          className="col-start-(--cards) lg:col-start-(--cards-lg)"
        >
          {stop.entries.length > 1 ? <ClusterCard entries={stop.entries} /> : <StopCard entry={stop.entries[0]} />}
        </Label>
      ),
    })),
  ].sort((a, b) => a.at - b.at)

  return (
    <>
      <Nav page="timeline" />
      <main className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Soft purple glow, as behind the hero terminal */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-48 -right-40 size-[44rem] rounded-full bg-brand/10 blur-3xl dark:bg-brand/25"
        />

        <div className={`${WRAP} relative`}>
          <header className="max-w-2xl">
            <h1 className="text-5xl tracking-tight text-ink sm:text-6xl">Achievements</h1>
            <p className="mt-3 text-2xl text-accent sm:text-[1.75rem]">
              {firstYear} — {entries[0]?.year}
            </p>
            <p className="mt-6 leading-relaxed text-soft md:text-[1.0625rem]">
              Drawn to scale: each role and degree runs on its own rail, as long as it lasted. Papers and
              certifications are stops on the main line.
            </p>
          </header>

          <div role="group" aria-label="Filter by category" className="mt-10 flex flex-wrap gap-2">
            {(['all', ...categories] as Filter[]).map((f) => {
              const pressed = filter === f
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    pressed
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-surface text-soft hover:border-accent/50 hover:text-accent'
                  }`}
                >
                  {f === 'all' ? 'All' : timelineCategories[f]}{' '}
                  <span className={pressed ? 'text-white/70' : 'text-muted'}>{count(f)}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
            <p aria-live="polite">
              Showing {visible.length} of {entries.length}
            </p>
            <p aria-hidden="true" className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-[3px] rounded-full bg-accent" /> Work rail
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-[3px] rounded-full bg-edu" /> Education rail
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-[11px] rounded-full border-2 border-accent" /> Paper or certification
              </span>
            </p>
          </div>

          {/* Column headings, from lg up, on the same columns as the map */}
          <div aria-hidden="true" className="mt-10 hidden lg:grid lg:grid-cols-(--cols-lg)" style={grid.style}>
            <p className="col-start-2 text-xs font-semibold tracking-wider text-muted uppercase">Work</p>
            <p className="col-start-(--cards-lg) text-xs font-semibold tracking-wider text-muted uppercase">
              Papers & certifications
            </p>
            <p className="col-start-(--edu-lg) text-xs font-semibold tracking-wider text-muted uppercase">Education</p>
          </div>

          <div
            ref={timeline}
            className="mt-8 grid grid-cols-(--cols) pt-4 [--p:26px] lg:mt-4 lg:grid-cols-(--cols-lg) lg:[--p:20px]"
            style={{ ...grid.style, minHeight: `calc(${map.span} * var(--p) + 2rem)` }}
          >
            {/* Month names, for every month in which something begins, ends or happens */}
            {map.months.map((m) => (
              <span
                key={m.month}
                aria-hidden="true"
                className={`col-start-1 row-start-1 self-start justify-self-end pr-1 text-xs leading-4 lg:pr-2 ${
                  m.now ? 'font-semibold text-accent' : 'text-muted'
                }`}
                style={place(m.at, -8)}
              >
                {m.now ? 'Now' : monthName(m.month)}
              </span>
            ))}

            {/* The main line, with a stop for each month that has a paper or certification */}
            {stopAts.length > 0 && (
              <span
                aria-hidden="true"
                className="relative z-10 col-start-(--center) row-start-1 lg:col-start-(--center-lg)"
              >
                <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-muted/40" />
              </span>
            )}
            {stopAts.map((at) => (
              <span
                key={at}
                aria-hidden="true"
                className={`${STATION} col-start-(--center) border-accent bg-canvas lg:col-start-(--center-lg)`}
                style={place(at)}
              />
            ))}
            {map.stops.map((stop) => (
              <Fragment key={stop.ats[0]}>
                <span
                  aria-hidden="true"
                  className="relative z-[5] col-start-(--center) row-start-1 h-0.5 self-start lg:col-start-(--center-lg)"
                  style={place(stop.ats[0], -1)}
                >
                  <span className="absolute inset-y-0 right-0 left-1/2 bg-accent/40" />
                </span>
                {/* A bracket beside the stations of a group, which shares one card */}
                {stop.ats.length > 1 && (
                  <span
                    aria-hidden="true"
                    className="relative z-[5] col-start-(--center) row-start-1 self-start lg:col-start-(--center-lg)"
                    style={{ ...place(stop.ats[0], -1), height: `calc(${stop.ats.at(-1)! - stop.ats[0]} * var(--p) + 2px)` }}
                  >
                    <span className="absolute inset-y-0 right-0 w-0.5 bg-accent/40" />
                  </span>
                )}
              </Fragment>
            ))}

            {/* A rail per role or degree, as long as it lasted: filled station where it ended, hollow where it began */}
            {map.rails.map((rail) => {
              const kind = rail.entry.category as RailKind
              const lane = { '--c': 2 + rail.order, ...grid.lane(rail) }
              return (
                <Fragment key={keyOf(rail.entry)}>
                  <span
                    aria-hidden="true"
                    className="relative z-10 col-start-(--c) row-start-1 self-start lg:col-start-(--c-lg)"
                    style={{ ...place(rail.at, 0, lane), height: `calc(${rail.length} * var(--p))` }}
                  >
                    <span
                      className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full lg:w-[3px] ${RAIL[kind].bg}`}
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className={`${STATION} col-start-(--c) lg:col-start-(--c-lg) ${RAIL[kind].border} ${RAIL[kind].bg}`}
                    style={place(rail.at, undefined, lane)}
                  >
                    {rail.entry.ongoing && (
                      <span className={`absolute -inset-0.5 animate-ping rounded-full opacity-60 ${RAIL[kind].bg}`} />
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`${STATION} col-start-(--c) bg-canvas lg:col-start-(--c-lg) ${RAIL[kind].border}`}
                    style={place(rail.at + rail.length, undefined, lane)}
                  />
                  {/* From the rail's top station across to its label */}
                  <span
                    aria-hidden="true"
                    className="relative z-[5] col-start-(--c) col-end-(--cards) row-start-1 h-0.5 self-start lg:col-start-(--k0) lg:col-end-(--k1)"
                    style={place(rail.at, -1, lane)}
                  >
                    <span
                      className={`absolute inset-y-0 right-0 left-1.5 opacity-60 lg:right-(--kr) lg:left-(--kl) ${RAIL[kind].bg}`}
                    />
                  </span>
                </Fragment>
              )
            })}

            {content.map((c) => c.node)}
          </div>
        </div>
      </main>
      <Footer page="timeline" />
    </>
  )
}
