import { Link } from 'react-router-dom'
import type { Vehicle } from '../types'
import VehiclePhoto from './VehiclePhoto'
import Badge from './Badge'
import ConditionGrade from './ConditionGrade'
import { useAuction } from '../hooks/useAuction'
import { formatCurrency, formatOdometer } from '../lib/format'
import styles from './VehicleCard.module.css'

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const auction = useAuction(vehicle)

  return (
    <Link to={`/vehicle/${vehicle.id}`} className={styles.card}>
      <div className={styles.photoWrap}>
        <VehiclePhoto vehicle={vehicle} />
        <div className={styles.photoTags}>
          {vehicle.titleStatus !== 'clean' && (
            <Badge tone={vehicle.titleStatus === 'salvage' ? 'bad' : 'warn'}>
              {vehicle.titleStatus === 'salvage' ? 'Salvage title' : 'Rebuilt title'}
            </Badge>
          )}
        </div>
        {auction.isHighBidder && (
          <div className={styles.highTag}>
            <Badge tone="ok" dot>
              You&rsquo;re the high bidder
            </Badge>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{vehicle.name}</h3>
        <p className={styles.trim}>
          {vehicle.trim} · <span className={styles.cap}>{vehicle.bodyStyle}</span>
        </p>

        <ul className={styles.specs}>
          <li className="tnum">{formatOdometer(vehicle.odometerKm)}</li>
          <li>{vehicle.drivetrain}</li>
          <li className={styles.cap}>{vehicle.fuelType}</li>
        </ul>

        <ConditionGrade grade={vehicle.conditionGrade} />

        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>
              {auction.currentBid != null ? 'Current bid' : 'Starting bid'}
            </span>
            <span className={`${styles.price} tnum`}>
              {formatCurrency(auction.displayPrice)}
            </span>
          </div>
          <div className={styles.bidmeta}>
            <span className="tnum">{auction.bidCount}</span>{' '}
            {auction.bidCount === 1 ? 'bid' : 'bids'}
          </div>
        </div>

        <div className={styles.loc}>
          {vehicle.city}, {vehicle.province} · {vehicle.sellingDealership}
        </div>
      </div>
    </Link>
  )
}
