import rawData from '../../data/vehicles.json'
import type { RawVehicle, TitleStatus, Vehicle } from '../types'

function normalize(v: RawVehicle): Vehicle {
  return {
    id: v.id,
    vin: v.vin,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    name: `${v.year} ${v.make} ${v.model}`,
    bodyStyle: v.body_style,
    exteriorColor: v.exterior_color,
    interiorColor: v.interior_color,
    engine: v.engine,
    transmission: v.transmission,
    drivetrain: v.drivetrain,
    odometerKm: v.odometer_km,
    fuelType: v.fuel_type,
    conditionGrade: v.condition_grade,
    conditionReport: v.condition_report,
    damageNotes: v.damage_notes ?? [],
    titleStatus: v.title_status as TitleStatus,
    province: v.province,
    city: v.city,
    auctionStart: v.auction_start,
    startingBid: v.starting_bid,
    reservePrice: v.reserve_price,
    buyNowPrice: v.buy_now_price,
    images: v.images ?? [],
    sellingDealership: v.selling_dealership,
    lot: v.lot,
    seedCurrentBid: v.current_bid,
    seedBidCount: v.bid_count ?? 0,
  }
}

/**
 * The full inventory, normalized once at module load. The dataset is bundled at
 * build time (frontend-only prototype). We cast through `unknown` because
 * TypeScript infers an over-specific literal type for imported JSON.
 */
export const vehicles: Vehicle[] = (rawData as unknown as RawVehicle[]).map(normalize)

const byId = new Map<string, Vehicle>(vehicles.map((v) => [v.id, v]))

export function getVehicle(id: string): Vehicle | undefined {
  return byId.get(id)
}
