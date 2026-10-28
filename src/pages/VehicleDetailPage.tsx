import { Link, useParams } from 'react-router-dom'
import { getVehicle } from '../data/vehicles'
import Gallery from '../components/Gallery'
import BidPanel from '../components/BidPanel'
import Badge from '../components/Badge'
import ConditionGrade from '../components/ConditionGrade'
import WatchButton from '../components/WatchButton'
import NotFoundPage from './NotFoundPage'
import { formatOdometer } from '../lib/format'
import { capitalize } from '../lib/text'
import { titleStatusMeta } from '../lib/titleStatus'
import styles from './VehicleDetailPage.module.css'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const vehicle = id ? getVehicle(id) : undefined
  if (!vehicle) return <NotFoundPage />

  const titleMeta = titleStatusMeta(vehicle.titleStatus)
  const specs: [string, string][] = [
    ['Odometer', formatOdometer(vehicle.odometerKm)],
    ['Engine', vehicle.engine],
    ['Transmission', capitalize(vehicle.transmission)],
    ['Drivetrain', vehicle.drivetrain],
    ['Fuel type', capitalize(vehicle.fuelType)],
    ['Body style', capitalize(vehicle.bodyStyle)],
    ['Exterior', vehicle.exteriorColor],
    ['Interior', vehicle.interiorColor],
    ['Year', String(vehicle.year)],
    ['VIN', vehicle.vin],
  ]

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        ← Back to inventory
      </Link>

      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>{vehicle.name}</h1>
          <p className={styles.subtitle}>
            {vehicle.trim} · <span className={styles.cap}>{vehicle.bodyStyle}</span> · Lot{' '}
            {vehicle.lot}
          </p>
        </div>
        <div className={styles.titleActions}>
          <Badge tone={titleMeta.tone} dot>
            {titleMeta.label}
          </Badge>
          <WatchButton vehicleId={vehicle.id} variant="labeled" />
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <Gallery vehicle={vehicle} />
        </div>

        <aside className={styles.bid}>
          <BidPanel vehicle={vehicle} />
        </aside>

        <div className={styles.details}>
          <section className={styles.section}>
            <h2 className={styles.h2}>Specifications</h2>
            <dl className={styles.specs}>
              {specs.map(([k, v]) => (
                <div key={k} className={styles.spec}>
                  <dt className={styles.dt}>{k}</dt>
                  <dd className={`${styles.dd} ${k === 'VIN' ? styles.mono : ''}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Condition</h2>
            <div className={styles.conditionGrade}>
              <ConditionGrade grade={vehicle.conditionGrade} variant="full" />
            </div>
            <p className={styles.report}>{vehicle.conditionReport}</p>
            <h3 className={styles.h3}>Damage notes</h3>
            {vehicle.damageNotes.length > 0 ? (
              <ul className={styles.damage}>
                {vehicle.damageNotes.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>No damage reported.</p>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Selling dealer</h2>
            <p className={styles.dealer}>{vehicle.sellingDealership}</p>
            <p className={styles.muted}>
              {vehicle.city}, {vehicle.province}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
