import { useSyncExternalStore } from 'react'
import { watchlistService } from '../services/watchlistService'

/** The set of saved vehicle ids (reactive). */
export function useWatchlistIds(): Set<string> {
  return useSyncExternalStore(
    watchlistService.subscribe,
    watchlistService.getSnapshot,
    watchlistService.getSnapshot,
  )
}

export function useIsWatched(vehicleId: string): boolean {
  return useWatchlistIds().has(vehicleId)
}

export function useWatchlistCount(): number {
  return useWatchlistIds().size
}
