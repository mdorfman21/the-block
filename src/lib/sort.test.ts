import { describe, it, expect } from 'vitest'
import { sortVehicles } from './sort'
import { auctionEndMs } from './auction'
import { makeVehicle } from '../test/fixtures'

const list = [
  makeVehicle({ year: 2020, odometerKm: 50000, seedCurrentBid: 20000, seedBidCount: 5, conditionGrade: 3.0 }),
  makeVehicle({ year: 2022, odometerKm: 10000, seedCurrentBid: null, startingBid: 15000, seedBidCount: 0, conditionGrade: 4.5 }),
  makeVehicle({ year: 2018, odometerKm: 90000, seedCurrentBid: 25000, seedBidCount: 12, conditionGrade: 2.0 }),
]

describe('sortVehicles', () => {
  it('preserves the original order (same reference) for "featured"', () => {
    expect(sortVehicles(list, 'featured')).toBe(list)
  })

  it('sorts by price (current-or-starting bid)', () => {
    // effective prices: 20000, 15000, 25000
    expect(sortVehicles(list, 'price-asc').map((v) => v.year)).toEqual([2022, 2020, 2018])
    expect(sortVehicles(list, 'price-desc').map((v) => v.year)).toEqual([2018, 2020, 2022])
  })

  it('sorts by year', () => {
    expect(sortVehicles(list, 'year-desc').map((v) => v.year)).toEqual([2022, 2020, 2018])
    expect(sortVehicles(list, 'year-asc').map((v) => v.year)).toEqual([2018, 2020, 2022])
  })

  it('sorts by lowest mileage, most bids, and best condition', () => {
    expect(sortVehicles(list, 'odometer-asc').map((v) => v.odometerKm)).toEqual([10000, 50000, 90000])
    expect(sortVehicles(list, 'bids-desc').map((v) => v.seedBidCount)).toEqual([12, 5, 0])
    expect(sortVehicles(list, 'condition-desc').map((v) => v.conditionGrade)).toEqual([4.5, 3.0, 2.0])
  })

  it('sorts by worst condition', () => {
    expect(sortVehicles(list, 'condition-asc').map((v) => v.conditionGrade)).toEqual([2.0, 3.0, 4.5])
  })

  it('sorts by soonest ending (ascending auction end)', () => {
    const ends = sortVehicles(list, 'ending-soon').map((v) => auctionEndMs(v.id))
    expect(ends).toEqual([...ends].sort((a, b) => a - b))
  })

  it('does not mutate the input list', () => {
    const copy = [...list]
    sortVehicles(list, 'price-asc')
    expect(list).toEqual(copy)
  })
})
