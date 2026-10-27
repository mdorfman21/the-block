import { describe, it, expect } from 'vitest'
import { searchVehicles } from './search'
import { makeVehicle } from '../test/fixtures'

const list = [
  makeVehicle({ make: 'Ford', model: 'Explorer', city: 'Toronto', year: 2020, lot: 'A-1' }),
  makeVehicle({ make: 'Toyota', model: 'Camry', city: 'Toronto', year: 2022, lot: 'B-2' }),
  makeVehicle({ make: 'Ford', model: 'Escape', city: 'Calgary', year: 2019, lot: 'C-3' }),
]

describe('searchVehicles', () => {
  it('returns everything for an empty or whitespace query', () => {
    expect(searchVehicles(list, '')).toHaveLength(3)
    expect(searchVehicles(list, '   ')).toHaveLength(3)
  })

  it('matches make and model case-insensitively', () => {
    expect(searchVehicles(list, 'ford')).toHaveLength(2)
    expect(searchVehicles(list, 'CAMRY')).toHaveLength(1)
  })

  it('requires every term to match (AND semantics)', () => {
    expect(searchVehicles(list, 'ford toronto')).toHaveLength(1)
    expect(searchVehicles(list, 'toyota calgary')).toHaveLength(0)
  })

  it('matches by year and lot number', () => {
    expect(searchVehicles(list, '2022')).toHaveLength(1)
    expect(searchVehicles(list, 'c-3')).toHaveLength(1)
  })
})
