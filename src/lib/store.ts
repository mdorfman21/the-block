/**
 * Minimal reactive store: `getSnapshot` + `subscribe` (the shape
 * `useSyncExternalStore` wants) plus `set`. The snapshot reference changes only
 * when `set` is called, so React can diff it cheaply. An optional `onChange`
 * runs on every change — used here to persist to localStorage.
 *
 * Shared by the auction and watchlist services so the pub/sub boilerplate lives
 * in one place.
 */
export interface Store<T> {
  getSnapshot: () => T
  subscribe: (callback: () => void) => () => void
  set: (next: T) => void
}

export function createStore<T>(initial: T, onChange?: (state: T) => void): Store<T> {
  let state = initial
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => state,
    subscribe(callback) {
      listeners.add(callback)
      return () => {
        listeners.delete(callback)
      }
    },
    set(next) {
      state = next
      onChange?.(next)
      listeners.forEach((l) => l())
    },
  }
}
