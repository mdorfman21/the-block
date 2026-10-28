import type { FilterState } from '../lib/filters'
import { emptyFilters, withMakes } from '../lib/filters'
import { vehicles } from '../data/vehicles'
import { formatCurrency, formatNumber } from '../lib/format'
import { capitalize } from '../lib/text'
import styles from './FilterChips.module.css'

interface Chip {
  key: string
  label: string
  next: FilterState
}

function priceLabel(f: FilterState): string {
  if (f.priceMin != null && f.priceMax != null) {
    return `${formatCurrency(f.priceMin)} – ${formatCurrency(f.priceMax)}`
  }
  if (f.priceMin != null) return `Over ${formatCurrency(f.priceMin)}`
  return `Under ${formatCurrency(f.priceMax as number)}`
}

function yearLabel(f: FilterState): string {
  if (f.yearMin != null && f.yearMax != null) return `${f.yearMin} – ${f.yearMax}`
  if (f.yearMin != null) return `${f.yearMin} & newer`
  return `${f.yearMax} & older`
}

function odometerLabel(f: FilterState): string {
  const km = (n: number) => `${formatNumber(n)} km`
  if (f.odometerMin != null && f.odometerMax != null) {
    return `${formatNumber(f.odometerMin)} – ${km(f.odometerMax)}`
  }
  if (f.odometerMin != null) return `Over ${km(f.odometerMin)}`
  return `Under ${km(f.odometerMax as number)}`
}

/** Removable chips for each active filter + a clear-all. Renders nothing when no filter is set. */
export default function FilterChips({
  filters,
  onChange,
}: {
  filters: FilterState
  onChange: (next: FilterState) => void
}) {
  const chips: Chip[] = []
  for (const m of filters.makes) {
    chips.push({
      key: `make:${m}`,
      label: m,
      next: withMakes(filters, filters.makes.filter((x) => x !== m), vehicles),
    })
  }
  for (const m of filters.models) {
    chips.push({
      key: `model:${m}`,
      label: m,
      next: { ...filters, models: filters.models.filter((x) => x !== m) },
    })
  }
  for (const b of filters.bodyStyles) {
    chips.push({
      key: `body:${b}`,
      label: capitalize(b),
      next: { ...filters, bodyStyles: filters.bodyStyles.filter((x) => x !== b) },
    })
  }
  for (const t of filters.titleStatuses) {
    chips.push({
      key: `title:${t}`,
      label: `${capitalize(t)} title`,
      next: { ...filters, titleStatuses: filters.titleStatuses.filter((x) => x !== t) },
    })
  }
  if (filters.priceMin != null || filters.priceMax != null) {
    chips.push({ key: 'price', label: priceLabel(filters), next: { ...filters, priceMin: null, priceMax: null } })
  }
  if (filters.yearMin != null || filters.yearMax != null) {
    chips.push({ key: 'year', label: yearLabel(filters), next: { ...filters, yearMin: null, yearMax: null } })
  }
  if (filters.odometerMin != null || filters.odometerMax != null) {
    chips.push({
      key: 'odometer',
      label: odometerLabel(filters),
      next: { ...filters, odometerMin: null, odometerMax: null },
    })
  }
  if (filters.buyNowOnly) {
    chips.push({ key: 'buyNow', label: 'Buy It Now', next: { ...filters, buyNowOnly: false } })
  }

  if (chips.length === 0) return null

  return (
    <div className={styles.chips}>
      {chips.map((c) => (
        <button key={c.key} type="button" className={styles.chip} onClick={() => onChange(c.next)}>
          <span>{c.label}</span>
          <svg viewBox="0 0 16 16" className={styles.x} aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Remove {c.label} filter</span>
        </button>
      ))}
      <button type="button" className={styles.clearAll} onClick={() => onChange(emptyFilters)}>
        Clear all
      </button>
    </div>
  )
}
