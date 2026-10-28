/** Shape of each record in `data/vehicles.json` — the dataset's raw schema. */
export interface RawVehicle {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  body_style: string
  exterior_color: string
  interior_color: string
  engine: string
  transmission: string
  drivetrain: string
  odometer_km: number
  fuel_type: string
  condition_grade: number
  condition_report: string
  damage_notes: string[]
  title_status: string
  province: string
  city: string
  auction_start: string
  starting_bid: number
  reserve_price: number
  buy_now_price: number | null
  images: string[]
  selling_dealership: string
  lot: string
  current_bid: number | null
  bid_count: number | null
}

export type TitleStatus = 'clean' | 'salvage' | 'rebuilt'

/** Semantic color tone shared by Badge and status helpers. */
export type Tone = 'neutral' | 'brand' | 'ok' | 'warn' | 'bad'

/**
 * Normalized vehicle used throughout the app. We convert the raw snake_case
 * records into a camelCase domain model so the UI is decoupled from the
 * dataset's wire shape: if the "source" ever became a real API, only the
 * normalizer (`src/data/vehicles.ts`) would need to change.
 */
export interface Vehicle {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  /** `${year} ${make} ${model}` — the common display name. */
  name: string
  bodyStyle: string
  exteriorColor: string
  interiorColor: string
  engine: string
  transmission: string
  drivetrain: string
  odometerKm: number
  fuelType: string
  conditionGrade: number
  conditionReport: string
  damageNotes: string[]
  titleStatus: TitleStatus
  province: string
  city: string
  auctionStart: string
  startingBid: number
  reservePrice: number
  buyNowPrice: number | null
  images: string[]
  sellingDealership: string
  lot: string
  /** Auction state as seeded by the dataset, before any locally placed bids. */
  seedCurrentBid: number | null
  seedBidCount: number
}

/**
 * A single bid, stored as an append-only event. Modeling bids as an event log
 * (rather than a single "current bid" number) is what makes a multi-bidder
 * "bidding war" a later drop-in: a rival bid is just another event with a
 * different `bidder`. The leading price and bid count are *derived* from the
 * log (see `deriveAuction`), never stored.
 */
export interface BidEvent {
  id: string
  vehicleId: string
  amount: number
  /** Who placed it. `"you"` for the current buyer; rival identities arrive later. */
  bidder: string
  /** Epoch milliseconds. */
  at: number
  /** `"buy-now"` marks an instant Buy It Now purchase; absent/`"bid"` is a normal bid. */
  kind?: 'bid' | 'buy-now'
}
