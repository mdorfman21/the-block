import { Link } from 'react-router-dom'
import Brand from './Brand'
import { useYourBidCount } from '../hooks/useAuction'
import { useWatchlistCount } from '../hooks/useWatchlist'
import { formatNumber } from '../lib/format'
import { vehicles } from '../data/vehicles'
import styles from './Header.module.css'

export default function Header() {
  const yourBids = useYourBidCount()
  const saved = useWatchlistCount()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Brand />
        <div className={styles.right}>
          <span className={styles.count}>
            <strong className="tnum">{formatNumber(vehicles.length)}</strong> vehicles
          </span>
          {saved > 0 && (
            <Link to="/?view=watchlist" className={styles.savedChip}>
              <svg className={styles.savedHeart} viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 17.2S3.2 13 3.2 8.3A3.75 3.75 0 0 1 10 6.1a3.75 3.75 0 0 1 6.8 2.2c0 4.7-6.8 8.9-6.8 8.9z" />
              </svg>
              <span className="tnum">{saved}</span> saved
            </Link>
          )}
          {yourBids > 0 && (
            <Link to="/?view=my-bids" className={styles.bidsChip}>
              <span className={styles.dot} aria-hidden="true" />
              <span className="tnum">{yourBids}</span>{' '}
              {yourBids === 1 ? 'active bid' : 'active bids'}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
