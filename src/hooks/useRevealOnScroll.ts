import { useEffect } from 'react'

/**
 * Adds `is-visible` to every `.reveal` element the first time it scrolls into view.
 * Pass a `key` that changes when new `.reveal` elements mount (e.g. a filter) to observe them too.
 */
export function useRevealOnScroll(key?: unknown) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key])
}
