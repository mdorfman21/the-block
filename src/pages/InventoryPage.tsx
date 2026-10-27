import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vehicles } from '../data/vehicles'
import { searchVehicles } from '../lib/search'
import {
  applyFilters,
  countActiveFilters,
  deriveBounds,
  emptyFilters,
  type FilterState,
} from '../lib/filters'
import { SORT_OPTIONS, sortVehicles, type SortKey } from '../lib/sort'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useMyBidVehicleIds } from '../hooks/useAuction'
import VehicleCard from '../components/VehicleCard'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import FilterChips from '../components/FilterChips'
import { formatNumber } from '../lib/format'
import styles from './InventoryPage.module.css'

const PAGE_SIZE = 48

export default function InventoryPage() {
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 180)
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [sort, setSort] = useState<SortKey>('recommended')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const myBidsView = searchParams.get('view') === 'my-bids'
  const myBidIds = useMyBidVehicleIds()

  const bounds = useMemo(() => deriveBounds(vehicles), [])
  const baseInventory = useMemo(
    () => (myBidsView ? vehicles.filter((v) => myBidIds.has(v.id)) : vehicles),
    [myBidsView, myBidIds],
  )
  const searchBase = useMemo(
    () => searchVehicles(baseInventory, debounced),
    [baseInventory, debounced],
  )
  const filtered = useMemo(() => applyFilters(searchBase, filters), [searchBase, filters])
  const sorted = useMemo(() => sortVehicles(filtered, sort), [filtered, sort])
  const activeCount = countActiveFilters(filters)

  // Reset the "show more" window whenever what we're showing changes.
  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [debounced, filters, sort, myBidsView])

  const shown = sorted.slice(0, visible)
  const hasMore = visible < sorted.length

  function exitMyBids() {
    const next = new URLSearchParams(searchParams)
    next.delete('view')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Wholesale vehicle auction</p>
        <h1 className={styles.title}>Find your next vehicle on the block</h1>
        <p className={styles.sub}>
          Browse {formatNumber(vehicles.length)} inspected vehicles from dealers across
          Canada — inspect the condition, then place your bid.
        </p>
      </header>

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
          <div className={styles.searchRow}>
            <SearchBar value={query} onChange={setQuery} />
          </div>

          {myBidsView && (
            <div className={styles.myBidsBanner}>
              <span>
                Showing lots <strong>you&rsquo;ve bid on</strong>
              </span>
              <button type="button" className={styles.showAll} onClick={exitMyBids}>
                Show all inventory
              </button>
            </div>
          )}

          <div className={styles.resultsBar}>
            <span className={styles.count}>
              <strong className="tnum">{formatNumber(sorted.length)}</strong>
              {sorted.length === 1 ? ' vehicle' : ' vehicles'}
              {debounced && <span className={styles.for}> for “{debounced}”</span>}
            </span>
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.filterToggle}
                onClick={() => setFiltersOpen((o) => !o)}
              >
                Filters
                {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
              </button>
              <label className={styles.sort}>
                <span className={styles.sortLabel}>Sort</span>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <FilterChips filters={filters} onChange={setFilters} />

          {sorted.length > 0 ? (
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
                    <span className="tnum">{formatNumber(sorted.length)}</span>
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              {myBidsView ? (
                <>
                  <p className={styles.emptyTitle}>You haven&rsquo;t bid on anything yet.</p>
                  <p className={styles.emptySub}>
                    Place a bid on a vehicle and it&rsquo;ll show up here.
                  </p>
                  <button type="button" className={styles.emptyBtn} onClick={exitMyBids}>
                    Browse inventory
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
