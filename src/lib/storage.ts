/*
 * Tiny localStorage helpers shared by the auction and watchlist stores. Both
 * tolerate storage being unavailable (private mode, SSR, tests) or corrupt.
 */

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore — storage may be unavailable or full; data just won't persist.
  }
}
