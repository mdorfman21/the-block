import type { Vehicle } from '../types'
import { vehiclePrice } from './filters'

export type SortKey =
  | 'recommended'
  | 'price-asc'
  | 'price-desc'
  | 'year-desc'
  | 'year-asc'
  | 'odometer-asc'
  | 'bids-desc'
  | 'condition-desc'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'year-desc', label: 'Year: newest' },
  { value: 'year-asc', label: 'Year: oldest' },
  { value: 'odometer-asc', label: 'Mileage: lowest' },
  { value: 'bids-desc', label: 'Most bids' },
  { value: 'condition-desc', label: 'Condition: best' },
]

const comparators: Record<
  Exclude<SortKey, 'recommended'>,
  (a: Vehicle, b: Vehicle) => number
> = {
  'price-asc': (a, b) => vehiclePrice(a) - vehiclePrice(b),
  'price-desc': (a, b) => vehiclePrice(b) - vehiclePrice(a),
  'year-desc': (a, b) => b.year - a.year,
  'year-asc': (a, b) => a.year - b.year,
  'odometer-asc': (a, b) => a.odometerKm - b.odometerKm,
  'bids-desc': (a, b) => b.seedBidCount - a.seedBidCount,
  'condition-desc': (a, b) => b.conditionGrade - a.conditionGrade,
}

/** Sort a copy of the list. "recommended" preserves the dataset's own order. */
export function sortVehicles(list: Vehicle[], sort: SortKey): Vehicle[] {
  if (sort === 'recommended') return list
  return [...list].sort(comparators[sort])
}
