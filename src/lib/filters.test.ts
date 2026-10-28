import { describe, it, expect } from 'vitest'
import {
  applyFilters,
  applyFiltersExcept,
  countActiveFilters,
  deriveBounds,
  emptyFilters,
  facetCounts,
  vehiclePrice,
  type FilterState,
} from './filters'
import { makeVehicle } from '../test/fixtures'

const list = [
  makeVehicle({ make: 'Ford', model: 'Explorer', bodyStyle: 'SUV', year: 2020, titleStatus: 'clean', seedCurrentBid: 20000, startingBid: 18000, odometerKm: 50000 }),
  makeVehicle({ make: 'Ford', model: 'F-150', bodyStyle: 'truck', year: 2018, titleStatus: 'salvage', seedCurrentBid: null, startingBid: 15000, odometerKm: 80000 }),
  makeVehicle({ make: 'Toyota', model: 'Camry', bodyStyle: 'sedan', year: 2022, titleStatus: 'clean', seedCurrentBid: 25000, startingBid: 20000, odometerKm: 30000 }),
]

describe('applyFilters', () => {
  it('returns everything when no filters are set', () => {
    expect(applyFilters(list, emptyFilters)).toHaveLength(3)
  })

  it('filters by make', () => {
    expect(applyFilters(list, { ...emptyFilters, makes: ['Ford'] })).toHaveLength(2)
  })

  it('filters by body style and title status', () => {
    expect(applyFilters(list, { ...emptyFilters, bodyStyles: ['SUV'] })).toHaveLength(1)
    expect(applyFilters(list, { ...emptyFilters, titleStatuses: ['clean'] })).toHaveLength(2)
  })

  it('filters by year range', () => {
    expect(applyFilters(list, { ...emptyFilters, yearMin: 2020 })).toHaveLength(2)
    expect(applyFilters(list, { ...emptyFilters, yearMin: 2019, yearMax: 2021 })).toHaveLength(1)
  })

  it('filters by price using the current-or-starting bid', () => {
    // effective prices: 20000, 15000 (starting), 25000
    expect(applyFilters(list, { ...emptyFilters, priceMin: 20000 })).toHaveLength(2)
    expect(applyFilters(list, { ...emptyFilters, priceMax: 16000 })).toHaveLength(1)
  })

  it('filters by odometer range', () => {
    // odometers: 50000, 80000, 30000
    expect(applyFilters(list, { ...emptyFilters, odometerMax: 60000 })).toHaveLength(2)
    expect(applyFilters(list, { ...emptyFilters, odometerMin: 60000 })).toHaveLength(1)
  })

  it('filters to Buy It Now lots', () => {
    const lots = [
      makeVehicle({ buyNowPrice: 30000 }),
      makeVehicle({ buyNowPrice: null }),
      makeVehicle({ buyNowPrice: 25000 }),
    ]
    expect(applyFilters(lots, { ...emptyFilters, buyNowOnly: true })).toHaveLength(2)
    expect(applyFilters(lots, { ...emptyFilters, buyNowOnly: false })).toHaveLength(3)
  })

  it('combines filters with AND', () => {
    expect(
      applyFilters(list, { ...emptyFilters, makes: ['Ford'], titleStatuses: ['clean'] }),
    ).toHaveLength(1)
  })
})

describe('vehiclePrice', () => {
  it('uses the current bid when present, else the starting bid', () => {
    expect(vehiclePrice(list[0])).toBe(20000)
    expect(vehiclePrice(list[1])).toBe(15000)
  })
})

describe('applyFiltersExcept', () => {
  it('ignores the excluded dimension so facet counts can recount', () => {
    const f: FilterState = { ...emptyFilters, makes: ['Ford'], bodyStyles: ['SUV'] }
    expect(applyFiltersExcept(list, f, 'bodyStyles')).toHaveLength(2) // only make applies
    expect(applyFiltersExcept(list, f, 'makes')).toHaveLength(1) // only body style applies
  })

  it('accepts multiple excluded dimensions (make ignores model)', () => {
    const f: FilterState = { ...emptyFilters, makes: ['Ford'], models: ['Explorer'] }
    expect(applyFiltersExcept(list, f, ['makes', 'models'])).toHaveLength(3)
  })
})

describe('facetCounts', () => {
  it('counts occurrences and sorts alphabetically', () => {
    expect(facetCounts(list, (v) => v.make)).toEqual([
      { value: 'Ford', count: 2 },
      { value: 'Toyota', count: 1 },
    ])
  })
})

describe('deriveBounds', () => {
  it('finds the year and price extents', () => {
    const b = deriveBounds(list)
    expect(b).toEqual({
      yearMin: 2018,
      yearMax: 2022,
      priceMin: 15000,
      priceMax: 25000,
      odometerMin: 30000,
      odometerMax: 80000,
    })
  })
})

describe('countActiveFilters', () => {
  it('counts selections and set ranges', () => {
    expect(countActiveFilters(emptyFilters)).toBe(0)
    expect(countActiveFilters({ ...emptyFilters, makes: ['Ford', 'Toyota'], yearMin: 2019 })).toBe(3)
  })
})
