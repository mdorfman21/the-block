import { describe, it, expect } from 'vitest'
import { bidIncrement, minNextBid, validateBid, deriveAuction } from './bids'
import { makeVehicle } from '../test/fixtures'
import type { BidEvent } from '../types'

const ME = 'you'

describe('bidIncrement', () => {
  it('scales by price tier', () => {
    expect(bidIncrement(500)).toBe(25)
    expect(bidIncrement(3000)).toBe(100)
    expect(bidIncrement(8000)).toBe(250)
    expect(bidIncrement(20000)).toBe(500)
    expect(bidIncrement(40000)).toBe(1000)
    expect(bidIncrement(60000)).toBe(2500)
  })

  it('uses the higher tier at exact tier boundaries', () => {
    expect(bidIncrement(1000)).toBe(100)
    expect(bidIncrement(5000)).toBe(250)
    expect(bidIncrement(50000)).toBe(2500)
  })
})

describe('minNextBid', () => {
  it('equals the starting bid when a lot has no bids', () => {
    expect(minNextBid(10000, null)).toBe(10000)
  })

  it('adds one increment over the current bid', () => {
    expect(minNextBid(10000, 20000)).toBe(20500)
  })
})

describe('validateBid', () => {
  it('rejects empty or non-positive amounts', () => {
    expect(validateBid(0, 100).ok).toBe(false)
    expect(validateBid(Number.NaN, 100).ok).toBe(false)
  })

  it('rejects amounts below the minimum', () => {
    const result = validateBid(90, 100)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('below_min')
  })

  it('accepts amounts at or above the minimum', () => {
    expect(validateBid(100, 100).ok).toBe(true)
    expect(validateBid(150, 100).ok).toBe(true)
  })
})

describe('deriveAuction', () => {
  it('uses seed state when there are no local bids', () => {
    const v = makeVehicle({ seedCurrentBid: 20000, seedBidCount: 5 })
    const a = deriveAuction(v, [], ME)
    expect(a.currentBid).toBe(20000)
    expect(a.displayPrice).toBe(20000)
    expect(a.bidCount).toBe(5)
    expect(a.isHighBidder).toBe(false)
    expect(a.minNextBid).toBe(20500)
  })

  it('falls back to the starting bid when a lot has no bids at all', () => {
    const v = makeVehicle({ seedCurrentBid: null, seedBidCount: 0, startingBid: 8000 })
    const a = deriveAuction(v, [], ME)
    expect(a.currentBid).toBeNull()
    expect(a.displayPrice).toBe(8000)
    expect(a.minNextBid).toBe(8000)
  })

  it('derives current bid, count, and high bidder from the event log', () => {
    const v = makeVehicle({ seedCurrentBid: 20000, seedBidCount: 5 })
    const events: BidEvent[] = [
      { id: 'b1', vehicleId: v.id, amount: 20500, bidder: ME, at: 1 },
    ]
    const a = deriveAuction(v, events, ME)
    expect(a.currentBid).toBe(20500)
    expect(a.bidCount).toBe(6)
    expect(a.isHighBidder).toBe(true)
    expect(a.yourBids).toHaveLength(1)
  })

  // The multi-bidder path: proves a rival bid is just another event, and that
  // being outbid is derived (not stored) — this is what makes a "bidding war"
  // a later drop-in rather than a rewrite.
  it('marks you as outbid when a rival posts the latest bid', () => {
    const v = makeVehicle({ seedCurrentBid: 20000, seedBidCount: 5 })
    const events: BidEvent[] = [
      { id: 'b1', vehicleId: v.id, amount: 20500, bidder: ME, at: 1 },
      { id: 'b2', vehicleId: v.id, amount: 21000, bidder: 'rival-1', at: 2 },
    ]
    const a = deriveAuction(v, events, ME)
    expect(a.currentBid).toBe(21000)
    expect(a.highBidder).toBe('rival-1')
    expect(a.isHighBidder).toBe(false)
    expect(a.bidCount).toBe(7)
    expect(a.yourBids).toHaveLength(1)
  })

  it('orders events by time regardless of input order', () => {
    const v = makeVehicle({ seedCurrentBid: 20000 })
    const events: BidEvent[] = [
      { id: 'b2', vehicleId: v.id, amount: 21000, bidder: 'rival', at: 2 },
      { id: 'b1', vehicleId: v.id, amount: 20500, bidder: ME, at: 1 },
    ]
    expect(deriveAuction(v, events, ME).currentBid).toBe(21000)
  })

  it('computes reserve-met from the display price', () => {
    expect(deriveAuction(makeVehicle({ seedCurrentBid: 16000, reservePrice: 15000 }), [], ME).reserveMet).toBe(true)
    expect(deriveAuction(makeVehicle({ seedCurrentBid: 14000, reservePrice: 15000 }), [], ME).reserveMet).toBe(false)
  })
})
