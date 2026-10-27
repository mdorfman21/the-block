import type { Vehicle } from '../types'

/**
 * Free-text inventory search. Splits the query into terms and requires every
 * term to match somewhere in the vehicle's searchable fields (AND semantics),
 * so "toyota toronto" narrows to Toyotas in Toronto. Case-insensitive.
 */
export function searchVehicles(list: Vehicle[], query: string): Vehicle[] {
  const q = query.trim().toLowerCase()
  if (!q) return list
  const terms = q.split(/\s+/)
  return list.filter((v) => {
    const haystack = [
      v.year,
      v.make,
      v.model,
      v.trim,
      v.bodyStyle,
      v.city,
      v.province,
      v.sellingDealership,
      v.lot,
      v.vin,
      v.exteriorColor,
      v.fuelType,
    ]
      .join(' ')
      .toLowerCase()
    return terms.every((t) => haystack.includes(t))
  })
}
