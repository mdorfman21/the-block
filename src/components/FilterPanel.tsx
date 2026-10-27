import type { ReactNode } from 'react'
import type { Vehicle } from '../types'
import {
  type Bounds,
  type Facet,
  type FilterState,
  applyFiltersExcept,
  countActiveFilters,
  emptyFilters,
  facetCounts,
  withMakes,
} from '../lib/filters'
import { vehicles as allVehicles } from '../data/vehicles'
import styles from './FilterPanel.module.css'

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]
}

function parseNum(s: string): number | null {
  if (s.trim() === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export default function FilterPanel({
  source,
  filters,
  onChange,
  bounds,
  onClose,
}: {
  /** Search-filtered list, used to derive facet options and counts. */
  source: Vehicle[]
  filters: FilterState
  onChange: (next: FilterState) => void
  bounds: Bounds
  onClose?: () => void
}) {
  // Each facet counts the list filtered by every OTHER dimension, so counts
  // recount as you narrow (e.g. pick a make → body/title counts follow).
  // Make ignores Model too (they're hierarchical), so picking a model doesn't
  // collapse the make list to a single make.
  const makeFacets = facetCounts(
    applyFiltersExcept(source, filters, ['makes', 'models']),
    (v) => v.make,
  )
  const bodyFacets = facetCounts(applyFiltersExcept(source, filters, 'bodyStyles'), (v) => v.bodyStyle)
  const titleFacets = facetCounts(
    applyFiltersExcept(source, filters, 'titleStatuses'),
    (v) => v.titleStatus,
  )
  const modelFacets =
    filters.makes.length > 0
      ? facetCounts(applyFiltersExcept(source, filters, 'models'), (v) => v.model)
      : []
  const active = countActiveFilters(filters)

  // Changing makes prunes any selected models that no longer belong.
  function setMakes(next: string[]) {
    onChange(withMakes(filters, next, allVehicles))
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        <div className={styles.headerActions}>
          {active > 0 && (
            <button type="button" className={styles.clear} onClick={() => onChange(emptyFilters)}>
              Clear all
            </button>
          )}
          {onClose && (
            <button type="button" className={styles.done} onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>

      <Section title="Make">
        <CheckList
          facets={makeFacets}
          selected={filters.makes}
          onToggle={(v) => setMakes(toggle(filters.makes, v))}
        />
      </Section>

      {filters.makes.length > 0 && (
        <Section title="Model">
          {modelFacets.length ? (
            <CheckList
              facets={modelFacets}
              selected={filters.models}
              onToggle={(v) => onChange({ ...filters, models: toggle(filters.models, v) })}
            />
          ) : (
            <p className={styles.hint}>No matching models.</p>
          )}
        </Section>
      )}

      <Section title="Body style">
        <CheckList
          facets={bodyFacets}
          selected={filters.bodyStyles}
          onToggle={(v) => onChange({ ...filters, bodyStyles: toggle(filters.bodyStyles, v) })}
          capitalize
        />
      </Section>

      <Section title="Price">
        <RangeRow
          prefix="$"
          minValue={filters.priceMin}
          maxValue={filters.priceMax}
          minPlaceholder={bounds.priceMin}
          maxPlaceholder={bounds.priceMax}
          step={1000}
          onMin={(n) => onChange({ ...filters, priceMin: n })}
          onMax={(n) => onChange({ ...filters, priceMax: n })}
        />
      </Section>

      <Section title="Year">
        <RangeRow
          minValue={filters.yearMin}
          maxValue={filters.yearMax}
          minPlaceholder={bounds.yearMin}
          maxPlaceholder={bounds.yearMax}
          step={1}
          onMin={(n) => onChange({ ...filters, yearMin: n })}
          onMax={(n) => onChange({ ...filters, yearMax: n })}
        />
      </Section>

      <Section title="Title status">
        <CheckList
          facets={titleFacets}
          selected={filters.titleStatuses}
          onToggle={(v) => onChange({ ...filters, titleStatuses: toggle(filters.titleStatuses, v) })}
          capitalize
        />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  )
}

function CheckList({
  facets,
  selected,
  onToggle,
  capitalize = false,
}: {
  facets: Facet[]
  selected: string[]
  onToggle: (value: string) => void
  capitalize?: boolean
}) {
  return (
    <ul className={styles.checklist}>
      {facets.map((f) => (
        <li key={f.value}>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={selected.includes(f.value)}
              onChange={() => onToggle(f.value)}
            />
            <span className={`${styles.checkLabel} ${capitalize ? styles.cap : ''}`}>
              {f.value}
            </span>
            <span className={`${styles.count} tnum`}>{f.count}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

function RangeRow({
  prefix,
  minValue,
  maxValue,
  minPlaceholder,
  maxPlaceholder,
  step,
  onMin,
  onMax,
}: {
  prefix?: string
  minValue: number | null
  maxValue: number | null
  minPlaceholder: number
  maxPlaceholder: number
  step: number
  onMin: (n: number | null) => void
  onMax: (n: number | null) => void
}) {
  return (
    <div className={styles.range}>
      <div className={styles.field}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          type="number"
          className={`${styles.num} ${prefix ? styles.hasPrefix : ''}`}
          value={minValue ?? ''}
          placeholder={String(minPlaceholder)}
          step={step}
          onChange={(e) => onMin(parseNum(e.target.value))}
          aria-label="Minimum"
        />
      </div>
      <span className={styles.dash}>–</span>
      <div className={styles.field}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          type="number"
          className={`${styles.num} ${prefix ? styles.hasPrefix : ''}`}
          value={maxValue ?? ''}
          placeholder={String(maxPlaceholder)}
          step={step}
          onChange={(e) => onMax(parseNum(e.target.value))}
          aria-label="Maximum"
        />
      </div>
    </div>
  )
}
