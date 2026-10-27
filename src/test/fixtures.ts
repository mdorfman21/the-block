import type { Vehicle } from '../types'

let counter = 0

/** Build a Vehicle for tests; override only the fields a case cares about. */
export function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  counter += 1
  return {
    id: `v${counter}`,
    vin: `VIN${counter}`,
    year: 2020,
    make: 'Ford',
    model: 'Explorer',
    trim: 'XLT',
    name: '2020 Ford Explorer',
    bodyStyle: 'SUV',
    exteriorColor: 'Blue',
    interiorColor: 'Black',
    engine: '2.5L I4',
    transmission: 'automatic',
    drivetrain: 'AWD',
    odometerKm: 50000,
    fuelType: 'gasoline',
    conditionGrade: 3.5,
    conditionReport: 'Good condition.',
    damageNotes: [],
    titleStatus: 'clean',
    province: 'Ontario',
    city: 'Toronto',
    auctionStart: '2026-04-05T14:00:00',
    startingBid: 10000,
    reservePrice: 15000,
    buyNowPrice: null,
    images: [],
    sellingDealership: 'Test Motors',
    lot: 'A-1',
    seedCurrentBid: null,
    seedBidCount: 0,
    ...overrides,
  }
}
