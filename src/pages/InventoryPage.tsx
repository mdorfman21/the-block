import { useEffect, useMemo, useState } from 'react'
import { vehicles } from '../data/vehicles'
import { searchVehicles } from '../lib/search'
import {
  applyFilters,
  countActiveFilters,
  deriveBounds,
  emptyFilters,
  type FilterState,
} from '../lib/filters'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import VehicleCard from '../components/VehicleCard'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import { formatNumber } from '../lib/format'
import styles from './InventoryPage.module.css'

const PAGE_SIZE = 48

export default function InventoryPage() {
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 180)
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const bounds = useMemo(() => deriveBounds(vehicles), [])
  const searchBase = useMemo(() => searchVehicles(vehicles, debounced), [debounced])
  const filtered = useMemo(() => applyFilters(searchBase, filters), [searchBase, filters])
  const activeCount = countActiveFilters(filters)

  // Reset the "show more" window whenever the search or filters change.
  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [debounced, filters])

  const shown = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Wholesale vehicle auction</p>
        <h1 className={styles.title}>Find your next vehicle on the block</h1>
        <p className={styles.sub}>
          Browse {formatNumber(vehicles.length)} inspected vehicles from dealers across
          Canada. Dig into the condition, then place your bid.
        </p>
      </header>

      <div className={styles.toolbar}>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${filtersOpen ? styles.open : ''}`}>
          <FilterPanel
            source={searchBase}
            filters={filters}
            onChange={setFilters}
            bounds={bounds}
            onClose={() => setFiltersOpen(false)}
          />
        </aside>

        <section className={styles.results}>
          <div className={styles.resultsBar}>
            <span className={styles.count}>
              <strong className="tnum">{formatNumber(filtered.length)}</strong>
              {filtered.length === 1 ? ' vehicle' : ' vehicles'}
              {debounced && <span className={styles.for}> for “{debounced}”</span>}
            </span>
            <button
              type="button"
              className={styles.filterToggle}
              onClick={() => setFiltersOpen((o) => !o)}
            >
              Filters
              {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
            </button>
          </div>

          {filtered.length > 0 ? (
            <>
              <ul className={styles.grid}>
                {shown.map((v) => (
                  <li key={v.id} className={styles.cell}>
                    <VehicleCard vehicle={v} />
                  </li>
                ))}
              </ul>
              {hasMore && (
                <div className={styles.more}>
                  <button
                    type="button"
                    className={styles.moreBtn}
                    onClick={() => setVisible((n) => n + PAGE_SIZE)}
                  >
                    Show more
                  </button>
                  <span className={styles.moreCount}>
                    Showing <span className="tnum">{formatNumber(shown.length)}</span> of{' '}
                    <span className="tnum">{formatNumber(filtered.length)}</span>
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No vehicles match your search and filters.</p>
              <p className={styles.emptySub}>Try removing a filter or searching differently.</p>
              <button
                type="button"
                className={styles.emptyBtn}
                onClick={() => {
                  setQuery('')
                  setFilters(emptyFilters)
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
