import type { Vehicle } from '../types'
import { vehiclePrice } from './filters'
import { auctionEndMs } from './auction'

export type SortKey =
  | 'featured'
  | 'ending-soon'
  | 'price-asc'
  | 'price-desc'
  | 'year-desc'
  | 'year-asc'
  | 'odometer-asc'
  | 'bids-desc'
  | 'condition-desc'
  | 'condition-asc'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'ending-soon', label: 'Ending soonest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'year-desc', label: 'Year: newest' },
  { value: 'year-asc', label: 'Year: oldest' },
  { value: 'odometer-asc', label: 'Mileage: lowest' },
  { value: 'bids-desc', label: 'Most bids' },
  { value: 'condition-desc', label: 'Condition: best' },
  { value: 'condition-asc', label: 'Condition: worst' },
]

const comparators: Record<
  Exclude<SortKey, 'featured'>,
  (a: Vehicle, b: Vehicle) => number
> = {
  'ending-soon': (a, b) => auctionEndMs(a.id) - auctionEndMs(b.id),
  'price-asc': (a, b) => vehiclePrice(a) - vehiclePrice(b),
  'price-desc': (a, b) => vehiclePrice(b) - vehiclePrice(a),
  'year-desc': (a, b) => b.year - a.year,
  'year-asc': (a, b) => a.year - b.year,
  'odometer-asc': (a, b) => a.odometerKm - b.odometerKm,
  'bids-desc': (a, b) => b.seedBidCount - a.seedBidCount,
  'condition-desc': (a, b) => b.conditionGrade - a.conditionGrade,
  'condition-asc': (a, b) => a.conditionGrade - b.conditionGrade,
}

/** Sort a copy of the list. "featured" preserves the dataset's own order. */
export function sortVehicles(list: Vehicle[], sort: SortKey): Vehicle[] {
  if (sort === 'featured') return list
  return [...list].sort(comparators[sort])
}
