import { useLayoutEffect, type RefObject } from 'react'
import { stackLabels } from '../lib/timeline'

const GAP = 8

/**
 * Stops the labels inside `root` (elements with `data-stack`) from overlapping. Each label sits
 * `data-at` months × the root's `--p` + `data-dy` px down; any that would overlap the label above
 * it in the same column are pushed down via a `--push` custom property. From lg up each
 * `data-stack` value is its own column; on phones every label shares one.
 * Re-runs when a label resizes or `key` changes.
 */
export function useStackedLabels(root: RefObject<HTMLElement | null>, key: unknown) {
  useLayoutEffect(() => {
    const container = root.current
    if (!container) return
    const labels = [...container.querySelectorAll<HTMLElement>('[data-stack]')]
    const wide = window.matchMedia('(min-width: 64rem)')

    // Writing --push only moves labels, it never resizes them, so this can't re-trigger itself.
    const observer = new ResizeObserver(() => {
      const perMonth = parseFloat(getComputedStyle(container).getPropertyValue('--p'))
      const placed = labels
        .map((el) => ({
          el,
          y: Number(el.dataset.at) * perMonth + Number(el.dataset.dy),
          height: el.offsetHeight,
          column: wide.matches ? el.dataset.stack! : 'all',
        }))
        .sort((a, b) => a.y - b.y)
      stackLabels(placed, GAP).forEach((push, i) => placed[i].el.style.setProperty('--push', `${push}px`))
    })
    labels.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [root, key])
}
