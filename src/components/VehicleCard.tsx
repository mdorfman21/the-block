import { Link } from 'react-router-dom'
import type { Vehicle } from '../types'
import VehiclePhoto from './VehiclePhoto'
import Badge from './Badge'
import ConditionGrade from './ConditionGrade'
import Countdown from './Countdown'
import WatchButton from './WatchButton'
import { useAuction } from '../hooks/useAuction'
import { formatCurrency, formatOdometer } from '../lib/format'
import { auctionEndMs } from '../lib/auction'
import { toneColorVar } from '../lib/condition'
import { titleStatusMeta } from '../lib/titleStatus'
import styles from './VehicleCard.module.css'

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const auction = useAuction(vehicle)
  const title = titleStatusMeta(vehicle.titleStatus)

  return (
    <Link to={`/vehicle/${vehicle.id}`} className={styles.card}>
      <div className={styles.photoWrap}>
        <VehiclePhoto vehicle={vehicle} />
        {!auction.purchased && (
          <div className={styles.countdown}>
            <Countdown target={auctionEndMs(vehicle.id)} variant="badge" tickMs={60000} />
          </div>
        )}
        <div className={styles.watch}>
          <WatchButton vehicleId={vehicle.id} stopNavigation />
        </div>
        {auction.purchased ? (
          <div className={styles.statusTag}>
            <Badge tone="ok" dot>
              Purchased
            </Badge>
          </div>
        ) : auction.isHighBidder ? (
          <div className={styles.statusTag}>
            <Badge tone="ok" dot>
              You&rsquo;re the high bidder
            </Badge>
          </div>
        ) : auction.outbid ? (
          <div className={styles.statusTag}>
            <Badge tone="bad" dot>
              Outbid
            </Badge>
          </div>
        ) : null}
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

        <div className={styles.titleStatus}>
          <span className={styles.titleDot} style={{ background: toneColorVar(title.tone) }} />
          {title.label}
        </div>

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
