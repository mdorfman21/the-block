import { getVehicle } from '../data/vehicles'
import { deriveAuction, validateBid, ME } from '../lib/bids'
import type { BidEvent } from '../types'

/*
 * The auction "service seam".
 *
 * This is the single source of truth for locally-placed bids. It behaves like a
 * tiny async API: `placeBid` validates and returns a promise, and the store
 * notifies subscribers on change. The React UI never touches localStorage
 * directly — it goes through here. That seam is deliberate: swapping this file's
 * internals for `fetch()` calls to a real backend (Phase 6) would not touch a
 * single component, and adding rival bidders (Phase 3) is just more callers of
 * `placeBid` with a different `bidder`.
 *
 * State shape: a map of vehicleId → append-only list of bid events.
 */

const STORAGE_KEY = 'theblock.bids.v1'

type BidsMap = Record<string, BidEvent[]>

function load(): BidsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BidsMap) : {}
  } catch {
    // Unavailable (private mode / SSR / tests) or corrupt — start empty.
    return {}
  }
}

function persist(map: BidsMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Ignore quota / unavailable storage; bids simply won't survive reload.
  }
}

let state: BidsMap = load()

// Stable empty reference so `eventsFor` doesn't churn referential identity.
const NO_EVENTS: readonly BidEvent[] = Object.freeze([])

const listeners = new Set<() => void>()
function emit(): void {
  listeners.forEach((l) => l())
}

/** Error carrying a user-facing message (e.g. "bid too low"). */
export class BidError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const auctionService = {
  /** Subscribe to any change in bid state. Returns an unsubscribe fn. */
  subscribe(callback: () => void): () => void {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  },

  /** Current snapshot of all local bids (stable reference between changes). */
  getSnapshot(): BidsMap {
    return state
  },

  eventsFor(vehicleId: string): readonly BidEvent[] {
    return state[vehicleId] ?? NO_EVENTS
  },

  /**
   * Place a bid. Validates against the authoritative minimum (like a server
   * would), simulates a short network round-trip, then appends the event.
   */
  async placeBid(
    vehicleId: string,
    amount: number,
    bidder: string = ME,
  ): Promise<BidEvent> {
    const vehicle = getVehicle(vehicleId)
    if (!vehicle) throw new BidError('That vehicle could not be found.')

    const view = deriveAuction(vehicle, [...(state[vehicleId] ?? [])], ME)
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
    state = { ...state, [vehicleId]: [...(state[vehicleId] ?? []), event] }
    persist(state)
    emit()
    return event
  },

  /** Clear all locally-placed bids, returning every lot to its seeded state. */
  async reset(): Promise<void> {
    await delay(120)
    state = {}
    persist(state)
    emit()
  },
}
