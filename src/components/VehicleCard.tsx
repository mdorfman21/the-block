import { Link } from 'react-router-dom'
import type { Tone, Vehicle } from '../types'
import VehiclePhoto from './VehiclePhoto'
import Badge from './Badge'
import ConditionGrade from './ConditionGrade'
import Countdown from './Countdown'
import { useAuction } from '../hooks/useAuction'
import { formatCurrency, formatOdometer } from '../lib/format'
import { auctionEndMs } from '../lib/auction'
import { toneColorVar } from '../lib/condition'
import styles from './VehicleCard.module.css'

const TITLE_META: Record<string, { tone: Tone; label: string }> = {
  clean: { tone: 'ok', label: 'Clean title' },
  salvage: { tone: 'bad', label: 'Salvage title' },
  rebuilt: { tone: 'warn', label: 'Rebuilt title' },
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const auction = useAuction(vehicle)
  const title = TITLE_META[vehicle.titleStatus] ?? TITLE_META.clean

  return (
    <Link to={`/vehicle/${vehicle.id}`} className={styles.card}>
      <div className={styles.photoWrap}>
        <VehiclePhoto vehicle={vehicle} />
        <div className={styles.countdown}>
          <Countdown target={auctionEndMs(vehicle.id)} variant="badge" tickMs={60000} />
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
