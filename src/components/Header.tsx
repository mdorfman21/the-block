import { Link } from 'react-router-dom'
import Brand from './Brand'
import { useYourBidCount } from '../hooks/useAuction'
import { formatNumber } from '../lib/format'
import { vehicles } from '../data/vehicles'
import styles from './Header.module.css'

export default function Header() {
  const yourBids = useYourBidCount()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Brand />
        <div className={styles.right}>
          <span className={styles.count}>
            <strong className="tnum">{formatNumber(vehicles.length)}</strong> vehicles
          </span>
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
