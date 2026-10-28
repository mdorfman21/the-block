import { loadJSON, saveJSON } from '../lib/storage'
import { createStore } from '../lib/store'

/*
 * Watchlist store — the set of vehicle ids the buyer has saved. Same reactive
 * shape as the auction service (shared `createStore`), persisted as an array.
 * Toggling is synchronous — saving is instant, so there's no async state here.
 */

const STORAGE_KEY = 'theblock.watchlist.v1'

const store = createStore<Set<string>>(new Set(loadJSON<string[]>(STORAGE_KEY, [])), (ids) =>
  saveJSON(STORAGE_KEY, [...ids]),
)

export const watchlistService = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,

  toggle(vehicleId: string): void {
    const next = new Set(store.getSnapshot())
    if (next.has(vehicleId)) next.delete(vehicleId)
    else next.add(vehicleId)
    store.set(next)
  },

  clear(): void {
    store.set(new Set())
  },
}
