import type { Vehicle } from '../types'

export interface FilterState {
  makes: string[]
  models: string[]
  bodyStyles: string[]
  titleStatuses: string[]
  yearMin: number | null
  yearMax: number | null
  priceMin: number | null
  priceMax: number | null
}

export const emptyFilters: FilterState = {
  makes: [],
  models: [],
  bodyStyles: [],
  titleStatuses: [],
  yearMin: null,
  yearMax: null,
  priceMin: null,
  priceMax: null,
}

/** The price a buyer filters on: the leading bid if any, else the starting bid. */
export function vehiclePrice(v: Vehicle): number {
  return v.seedCurrentBid ?? v.startingBid
}

export function applyFilters(list: Vehicle[], f: FilterState): Vehicle[] {
  return list.filter((v) => {
    if (f.makes.length && !f.makes.includes(v.make)) return false
    if (f.models.length && !f.models.includes(v.model)) return false
    if (f.bodyStyles.length && !f.bodyStyles.includes(v.bodyStyle)) return false
    if (f.titleStatuses.length && !f.titleStatuses.includes(v.titleStatus)) return false
    if (f.yearMin != null && v.year < f.yearMin) return false
    if (f.yearMax != null && v.year > f.yearMax) return false
    const price = vehiclePrice(v)
    if (f.priceMin != null && price < f.priceMin) return false
    if (f.priceMax != null && price > f.priceMax) return false
    return true
  })
}

export type FilterDimension =
  | 'makes'
  | 'models'
  | 'bodyStyles'
  | 'titleStatuses'
  | 'year'
  | 'price'

/**
 * Apply every active filter EXCEPT one dimension. Used to compute faceted counts
 * that reflect the other selections — e.g. once a make is chosen, the body-style
 * and title-status counts recount to that make — while still letting you add more
 * values within the excluded dimension.
 */
export function applyFiltersExcept(
  list: Vehicle[],
  f: FilterState,
  except: FilterDimension | FilterDimension[],
): Vehicle[] {
  const skip = Array.isArray(except) ? except : [except]
  return list.filter((v) => {
    if (!skip.includes('makes') && f.makes.length && !f.makes.includes(v.make)) return false
    if (!skip.includes('models') && f.models.length && !f.models.includes(v.model)) return false
    if (!skip.includes('bodyStyles') && f.bodyStyles.length && !f.bodyStyles.includes(v.bodyStyle))
      return false
    if (
      !skip.includes('titleStatuses') &&
      f.titleStatuses.length &&
      !f.titleStatuses.includes(v.titleStatus)
    )
      return false
    if (!skip.includes('year')) {
      if (f.yearMin != null && v.year < f.yearMin) return false
      if (f.yearMax != null && v.year > f.yearMax) return false
    }
    if (!skip.includes('price')) {
      const price = vehiclePrice(v)
      if (f.priceMin != null && price < f.priceMin) return false
      if (f.priceMax != null && price > f.priceMax) return false
    }
    return true
  })
}

export function countActiveFilters(f: FilterState): number {
  return (
    f.makes.length +
    f.models.length +
    f.bodyStyles.length +
    f.titleStatuses.length +
    (f.yearMin != null ? 1 : 0) +
    (f.yearMax != null ? 1 : 0) +
    (f.priceMin != null ? 1 : 0) +
    (f.priceMax != null ? 1 : 0)
  )
}

export interface Facet {
  value: string
  count: number
}

/** Count occurrences of a key across the list, sorted alphabetically. */
export function facetCounts(list: Vehicle[], key: (v: Vehicle) => string): Facet[] {
  const counts = new Map<string, number>()
  for (const v of list) {
    const k = key(v)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

export interface Bounds {
  yearMin: number
  yearMax: number
  priceMin: number
  priceMax: number
}

export function deriveBounds(list: Vehicle[]): Bounds {
  let yearMin = Infinity
  let yearMax = -Infinity
  let priceMin = Infinity
  let priceMax = -Infinity
  for (const v of list) {
    yearMin = Math.min(yearMin, v.year)
    yearMax = Math.max(yearMax, v.year)
    const p = vehiclePrice(v)
    priceMin = Math.min(priceMin, p)
    priceMax = Math.max(priceMax, p)
  }
  return { yearMin, yearMax, priceMin, priceMax }
}
