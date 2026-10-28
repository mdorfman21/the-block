import { getVehicle } from '../data/vehicles'
import { deriveAuction, validateBid, ME } from '../lib/bids'
import { loadJSON, saveJSON } from '../lib/storage'
import { createStore } from '../lib/store'
import type { BidEvent } from '../types'

/*
 * The auction "service seam" — the single source of truth for locally-placed
 * bids. It behaves like a tiny async API: `placeBid`/`buyNow` validate and
 * return promises; the UI subscribes via the store. The React layer never
 * touches localStorage directly, so swapping these internals for `fetch()`
 * calls to a real backend (Phase 6) wouldn't touch a single component, and
 * adding rival bidders (Phase 3) is just more callers of `placeBid` with a
 * different `bidder`.
 *
 * State: a map of vehicleId → append-only list of bid events.
 */

const STORAGE_KEY = 'theblock.bids.v1'

type BidsMap = Record<string, BidEvent[]>

const store = createStore<BidsMap>(loadJSON<BidsMap>(STORAGE_KEY, {}), (s) =>
  saveJSON(STORAGE_KEY, s),
)

/** Error carrying a user-facing message (e.g. "bid too low"). */
export class BidError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function eventsFor(vehicleId: string): BidEvent[] {
  return store.getSnapshot()[vehicleId] ?? []
}

function append(vehicleId: string, event: BidEvent): void {
  store.set({ ...store.getSnapshot(), [vehicleId]: [...eventsFor(vehicleId), event] })
}

export const auctionService = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,

  /**
   * Place a bid. Validates against the authoritative minimum (like a server
   * would), simulates a short network round-trip, then appends the event.
   */
  async placeBid(vehicleId: string, amount: number, bidder: string = ME): Promise<BidEvent> {
    const vehicle = getVehicle(vehicleId)
    if (!vehicle) throw new BidError('That vehicle could not be found.')
    if (eventsFor(vehicleId).some((e) => e.kind === 'buy-now')) {
      throw new BidError('This lot has already been purchased.')
    }

    const view = deriveAuction(vehicle, eventsFor(vehicleId), ME)
    const result = validateBid(amount, view.minNextBid)
    if (!result.ok) throw new BidError(result.message)

    await delay(320)
    const event: BidEvent = {
      id: crypto.randomUUID(),
      vehicleId,
      amount: Math.round(amount),
      bidder,
      at: Date.now(),
    }
    append(vehicleId, event)
    return event
  },

  /** Buy a lot outright at its Buy It Now price, closing the auction. */
  async buyNow(vehicleId: string): Promise<BidEvent> {
    const vehicle = getVehicle(vehicleId)
    if (!vehicle) throw new BidError('That vehicle could not be found.')
    if (vehicle.buyNowPrice == null) throw new BidError('This lot has no Buy It Now price.')
    if (eventsFor(vehicleId).some((e) => e.kind === 'buy-now')) {
      throw new BidError('This lot has already been purchased.')
    }

    await delay(320)
    const event: BidEvent = {
      id: crypto.randomUUID(),
      vehicleId,
      amount: vehicle.buyNowPrice,
      bidder: ME,
      at: Date.now(),
      kind: 'buy-now',
    }
    append(vehicleId, event)
    return event
  },

  /** Clear all locally-placed bids, returning every lot to its seeded state. */
  async reset(): Promise<void> {
    await delay(120)
    store.set({})
  },
}
