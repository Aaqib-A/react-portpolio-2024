// Page-level side effects shared by the nav, the terminal and the contact form.

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return false
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', id === 'about' ? location.pathname : `#${id}`)
  // Make sure revealed-on-scroll content is visible even if we jump past it.
  el.querySelectorAll('.reveal').forEach((r) => r.classList.add('is-visible'))
  el.classList.remove('flash')
  void el.offsetWidth // restart the animation if it's already applied
  el.classList.add('flash')
  return true
}

export const CONTACT_PREFILL_EVENT = 'contact:prefill'

export function prefillContact(message: string) {
  window.dispatchEvent(new CustomEvent<string>(CONTACT_PREFILL_EVENT, { detail: message }))
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function openUrl(url: string) {
  if (url.startsWith('mailto:')) {
    location.href = url
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
