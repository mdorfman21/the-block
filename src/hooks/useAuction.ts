import { useMemo, useSyncExternalStore } from 'react'
import { auctionService } from '../services/auctionService'
import { deriveAuction, ME, type AuctionView } from '../lib/bids'
import type { Vehicle } from '../types'

/**
 * Subscribe to the auction store. `useSyncExternalStore` is the idiomatic React
 * way to read an external, mutable source — any writer (your bid, a rival bid in
 * Phase 3, or a server push in Phase 6) flows through here and re-renders the UI
 * with no component changes.
 */
function useBidsSnapshot() {
  return useSyncExternalStore(
    auctionService.subscribe,
    auctionService.getSnapshot,
    auctionService.getSnapshot,
  )
}

/** Live, derived auction state for a single vehicle. */
export function useAuction(vehicle: Vehicle): AuctionView {
  const map = useBidsSnapshot()
  const events = map[vehicle.id]
  return useMemo(() => deriveAuction(vehicle, events ?? [], ME), [vehicle, events])
}

/** How many distinct lots the current buyer has bid on (for the header badge). */
export function useYourBidCount(): number {
  const map = useBidsSnapshot()
  return useMemo(
    () => Object.values(map).filter((events) => events.some((e) => e.bidder === ME)).length,
    [map],
  )
}
