import { useState } from 'react'
import type { Vehicle } from '../types'
import VehiclePhoto from './VehiclePhoto'
import styles from './Gallery.module.css'

/** Photo gallery: a main image with a selectable thumbnail strip. */
export default function Gallery({ vehicle }: { vehicle: Vehicle }) {
  const [active, setActive] = useState(0)
  const count = vehicle.images.length

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <VehiclePhoto vehicle={vehicle} index={active} showLabel />
      </div>
      {count > 1 && (
        <div className={styles.thumbs}>
          {vehicle.images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.thumb} ${i === active ? styles.active : ''}`}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active}
            >
              <VehiclePhoto vehicle={vehicle} index={i} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
