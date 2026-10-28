import type { BidEvent, Vehicle } from '../types'
import { formatCurrency } from './format'

/** Identity of the current buyer. Single-user in v1; rivals get other ids later. */
export const ME = 'you'

/**
 * Minimum bid step, tiered by price — mirrors how real wholesale auctions scale
 * increments so a $3k lot doesn't jump by $1k but a $60k lot doesn't crawl by $100.
 */
export function bidIncrement(current: number): number {
  if (current < 1_000) return 25
  if (current < 5_000) return 100
  if (current < 10_000) return 250
  if (current < 25_000) return 500
  if (current < 50_000) return 1_000
  return 2_500
}

/**
 * The smallest acceptable next bid.
 * - No bids yet (`currentBid == null`): you can meet the opening bid exactly.
 * - Otherwise: current leading bid plus one increment.
 */
export function minNextBid(startingBid: number, currentBid: number | null): number {
  if (currentBid == null) return startingBid
  return currentBid + bidIncrement(currentBid)
}

export type BidValidation =
  | { ok: true }
  | { ok: false; code: 'empty' | 'below_min'; message: string }

export function validateBid(amount: number, min: number): BidValidation {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, code: 'empty', message: 'Enter a bid amount.' }
  }
  if (amount < min) {
    return {
      ok: false,
      code: 'below_min',
      message: `Your bid must be at least ${formatCurrency(min)}.`,
    }
  }
  return { ok: true }
}

/** The live auction state for one vehicle, derived from the seed + local bid log. */
export interface AuctionView {
  /** Leading bid, or `null` when a lot still has no bids at all. */
  currentBid: number | null
  /** What to show as the price: the leading bid, or the starting bid if none. */
  displayPrice: number
  bidCount: number
  highBidder: string | null
  isHighBidder: boolean
  /** You've bid, but a later bid (a rival) is now the high bid. */
  outbid: boolean
  /** Whether the current buyer has placed at least one bid on this lot. */
  hasLocalBids: boolean
  /** Whether this lot was bought outright via Buy It Now. */
  purchased: boolean
  /** `displayPrice >= reservePrice` (reserve amount itself stays hidden in the UI). */
  reserveMet: boolean
  increment: number
  minNextBid: number
  /** The current buyer's own bids, newest first. */
  yourBids: BidEvent[]
  /** All locally-placed bids, newest first. */
  localHistory: BidEvent[]
}

/**
 * Fold the dataset seed and the append-only bid log into the view the UI renders.
 * Pure and deterministic — this is the unit-tested core of the auction.
 */
export function deriveAuction(
  vehicle: Vehicle,
  events: BidEvent[],
  me: string = ME,
): AuctionView {
  const sorted = [...events].sort((a, b) => a.at - b.at)
  const top = sorted.length > 0 ? sorted[sorted.length - 1] : null

  const purchased = sorted.some((e) => e.kind === 'buy-now')
  const currentBid = top ? top.amount : vehicle.seedCurrentBid
  const displayPrice = currentBid ?? vehicle.startingBid
  const highBidder = top ? top.bidder : null
  const isHighBidder = highBidder === me
  const myBids = sorted.filter((e) => e.bidder === me)
  // Buy Now is a purchase, not a bid — it doesn't add to the bid count.
  const localBidCount = sorted.reduce((n, e) => (e.kind === 'buy-now' ? n : n + 1), 0)

  return {
    currentBid,
    displayPrice,
    bidCount: vehicle.seedBidCount + localBidCount,
    highBidder,
    isHighBidder,
    outbid: myBids.length > 0 && !isHighBidder && !purchased,
    hasLocalBids: sorted.length > 0,
    purchased,
    reserveMet: displayPrice >= vehicle.reservePrice,
    increment: bidIncrement(displayPrice),
    minNextBid: minNextBid(vehicle.startingBid, currentBid),
    yourBids: [...myBids].reverse(),
    localHistory: [...sorted].reverse(),
  }
}
