import type { Tone } from '../types'

/*
 * The dataset's `auction_start` values are synthetic and clustered in the past,
 * so we derive each lot's auction END relative to when the app loaded. This
 * keeps the prototype full of live auctions counting down. End times are
 * deterministic per vehicle (stable within a session) and re-anchor on reload.
 *
 * This is the normalization the README explicitly allows ("normalize them
 * relative to 'now'"). A real system would store true end timestamps.
 */

const REFERENCE = Date.now()
const MIN_OFFSET = 20 * 60 * 1000 // 20 minutes
const MAX_OFFSET = 7 * 24 * 60 * 60 * 1000 // 7 days

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Deterministic auction-end timestamp (epoch ms) for a vehicle, relative to load. */
export function auctionEndMs(vehicleId: string): number {
  const fraction = (hashString(vehicleId) % 100000) / 100000 // [0, 1)
  return REFERENCE + MIN_OFFSET + Math.round(fraction * (MAX_OFFSET - MIN_OFFSET))
}

/** `ms` remaining → "2d 4h" / "3h 12m" / "45m" (or "45m 30s") / "30s" / "Ended". */
export function formatCountdown(ms: number, withSeconds = false): string {
  if (ms <= 0) return 'Ended'
  const totalSec = Math.floor(ms / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return withSeconds ? `${m}m ${s}s` : `${m}m`
  return `${s}s`
}

/** Urgency tone: red under an hour, amber under a day, neutral otherwise. */
export function timeLeftTone(ms: number): Tone {
  if (ms <= 0) return 'neutral'
  if (ms < 60 * 60 * 1000) return 'bad'
  if (ms < 24 * 60 * 60 * 1000) return 'warn'
  return 'neutral'
}
