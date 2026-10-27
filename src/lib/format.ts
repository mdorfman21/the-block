// Canadian dataset → format money and distances in en-CA. Locale is pinned
// (not the user's system locale) so the UI renders identically everywhere.

const CAD = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

const NUM = new Intl.NumberFormat('en-CA')

/** `14500` → `$14,500` (CAD, no cents — bids are whole dollars). */
export function formatCurrency(amount: number): string {
  return CAD.format(amount)
}

export function formatNumber(n: number): string {
  return NUM.format(n)
}

/** `47731` → `47,731 km`. */
export function formatOdometer(km: number): string {
  return `${NUM.format(km)} km`
}

/*
 * Timezones: the dataset's `auction_start` values are "floating" timestamps —
 * no offset, no `Z` (e.g. "2026-04-05T14:00:00"). `new Date()` would interpret
 * those in the VIEWER's local zone, so the same lot could read 2:00 PM in
 * Toronto and 11:00 AM in Vancouver. The data spans multiple Canadian zones and
 * declares none, so the only honest rendering is the wall-clock time as written.
 * We get that by parsing the components as UTC and formatting in UTC — the
 * displayed value then equals the encoded value for every viewer.
 *
 * (When Phase 3 adds live countdowns, auction times get re-anchored relative to
 * "now" per the README, so real-zone semantics won't matter there either.)
 */
function parseFloating(iso: string): Date {
  const hasZone = /([zZ])|([+-]\d{2}:?\d{2})$/.test(iso)
  return new Date(hasZone ? iso : `${iso}Z`)
}

const DATE_FMT = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

const DATETIME_FMT = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

export function formatDate(iso: string): string {
  const d = parseFloating(iso)
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d)
}

export function formatDateTime(iso: string): string {
  const d = parseFloating(iso)
  return Number.isNaN(d.getTime()) ? iso : DATETIME_FMT.format(d)
}

/** Local wall-clock time for an epoch (e.g. a bid you just placed). */
export function formatClock(epochMs: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(epochMs)
}

/** `Fri, Oct 31, 3:45 p.m.` — an auction-end timestamp (relative to now, so local). */
export function formatEndsAt(epochMs: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(epochMs)
}
