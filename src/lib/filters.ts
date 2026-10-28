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
  odometerMin: number | null
  odometerMax: number | null
  buyNowOnly: boolean
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
  odometerMin: null,
  odometerMax: null,
  buyNowOnly: false,
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
    if (f.odometerMin != null && v.odometerKm < f.odometerMin) return false
    if (f.odometerMax != null && v.odometerKm > f.odometerMax) return false
    if (f.buyNowOnly && v.buyNowPrice == null) return false
    return true
  })
}

/**
 * Set the selected makes, pruning any selected models that no longer belong to
 * a selected make (and clearing models entirely when no make is selected).
 * Shared by the filter panel and the removable filter chips.
 */
export function withMakes(
  filters: FilterState,
  nextMakes: string[],
  allVehicles: Vehicle[],
): FilterState {
  if (nextMakes.length === 0) return { ...filters, makes: [], models: [] }
  const allowed = new Set(
    allVehicles.filter((v) => nextMakes.includes(v.make)).map((v) => v.model),
  )
  return { ...filters, makes: nextMakes, models: filters.models.filter((m) => allowed.has(m)) }
}

export type FilterDimension =
  | 'makes'
  | 'models'
  | 'bodyStyles'
  | 'titleStatuses'
  | 'year'
  | 'price'
  | 'odometer'
  | 'buyNow'

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
    if (!skip.includes('odometer')) {
      if (f.odometerMin != null && v.odometerKm < f.odometerMin) return false
      if (f.odometerMax != null && v.odometerKm > f.odometerMax) return false
    }
    if (!skip.includes('buyNow') && f.buyNowOnly && v.buyNowPrice == null) return false
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
    (f.priceMax != null ? 1 : 0) +
    (f.odometerMin != null ? 1 : 0) +
    (f.odometerMax != null ? 1 : 0) +
    (f.buyNowOnly ? 1 : 0)
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
  odometerMin: number
  odometerMax: number
}

export function deriveBounds(list: Vehicle[]): Bounds {
  let yearMin = Infinity
  let yearMax = -Infinity
  let priceMin = Infinity
  let priceMax = -Infinity
  let odometerMin = Infinity
  let odometerMax = -Infinity
  for (const v of list) {
    yearMin = Math.min(yearMin, v.year)
    yearMax = Math.max(yearMax, v.year)
    const p = vehiclePrice(v)
    priceMin = Math.min(priceMin, p)
    priceMax = Math.max(priceMax, p)
    odometerMin = Math.min(odometerMin, v.odometerKm)
    odometerMax = Math.max(odometerMax, v.odometerKm)
  }
  return { yearMin, yearMax, priceMin, priceMax, odometerMin, odometerMax }
}
