import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

// The `dark` class on <html> is the source of truth. index.html sets it
// before first paint, so there's no flash of the wrong theme.
const listeners = new Set<() => void>()

export function getTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0d0a14' : '#ffffff')
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
  listeners.forEach((notify) => notify())
}

function subscribe(notify: () => void) {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme)
}
