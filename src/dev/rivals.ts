import { getVehicle } from '../data/vehicles'
import { auctionService } from '../services/auctionService'
import { deriveAuction, ME } from '../lib/bids'

/*
 * Demo helpers exposed on `window.theBlock` for the walkthrough.
 *
 * The prototype is single-user, so you're always the high bidder. Rather than
 * build automatic simulated rivals (nondeterministic, noisy in a demo), these
 * let you trigger a rival bid on demand through the same `placeBid` service seam
 * a real rival/backend would use — which flips you to the visible "Outbid"
 * state so the bid → outbid → re-bid loop can be shown. See ROADMAP.md.
 */

const RIVAL = 'Another buyer'

/** Have a rival outbid you (one increment) on a specific lot. */
async function outbid(vehicleId: string): Promise<void> {
  const vehicle = getVehicle(vehicleId)
  if (!vehicle) {
    console.warn(`[the-block] No vehicle with id "${vehicleId}".`)
    return
  }
  const view = deriveAuction(vehicle, [...(auctionService.getSnapshot()[vehicleId] ?? [])], ME)
  if (view.purchased) {
    console.warn(`[the-block] ${vehicle.name} was bought via Buy Now — can't outbid.`)
    return
  }
  await auctionService.placeBid(vehicleId, view.minNextBid, RIVAL)
  console.log(`[the-block] ${RIVAL} bid ${view.minNextBid} on ${vehicle.name}.`)
}

/** Have a rival outbid you on every lot you're currently winning. */
async function outbidMe(): Promise<number> {
  const snapshot = auctionService.getSnapshot()
  let count = 0
  for (const id of Object.keys(snapshot)) {
    const vehicle = getVehicle(id)
    if (!vehicle) continue
    const view = deriveAuction(vehicle, [...snapshot[id]], ME)
    if (view.isHighBidder && !view.purchased) {
      await auctionService.placeBid(id, view.minNextBid, RIVAL)
      count += 1
    }
  }
  console.log(
    count > 0
      ? `[the-block] ${RIVAL} outbid you on ${count} lot(s) — check "active bids".`
      : '[the-block] You are not the high bidder on anything yet — place a bid first.',
  )
  return count
}

declare global {
  interface Window {
    theBlock?: {
      outbid: (vehicleId: string) => Promise<void>
      outbidMe: () => Promise<number>
      reset: () => Promise<void>
    }
  }
}

/** Attach the demo helpers to `window` and print how to use them. */
export function installDemoTools(): void {
  window.theBlock = { outbid, outbidMe, reset: () => auctionService.reset() }
  console.log(
    '%c[the-block] Demo tools: theBlock.outbidMe() · theBlock.outbid("<vehicleId>") · theBlock.reset()',
    'color:#0061ff;font-weight:600',
  )
}
