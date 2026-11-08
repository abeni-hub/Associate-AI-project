export const NEWS_EVENTS_STORAGE_KEY = 'civiclink.news-events.v1'
export const NEWS_EVENTS_UPDATED_EVENT = 'civiclink:news-events-updated'

export function readSharedNewsEvents(fallback = []) {
  if (typeof window === 'undefined') return fallback

  try {
    const stored = window.localStorage.getItem(NEWS_EVENTS_STORAGE_KEY)
    if (!stored) return fallback

    const items = JSON.parse(stored)
    return Array.isArray(items) ? items : fallback
  } catch {
    return fallback
  }
}

export function writeSharedNewsEvents(items) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(NEWS_EVENTS_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(NEWS_EVENTS_UPDATED_EVENT))
  } catch {
    // Keep the current page usable if browser storage is unavailable.
  }
}
