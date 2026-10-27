import { useEffect, useState } from 'react'
import type { Vehicle } from '../types'
import { colorToHex, isLight, shade } from '../lib/color'
import styles from './VehiclePhoto.module.css'

/*
 * Vehicle thumbnail. Loads the dataset's own image URLs (placehold.co
 * placeholders) from the payload. If an image fails to load — e.g. offline
 * during a walkthrough — it falls back to a styled placeholder tinted by the
 * vehicle's real paint color, so the UI never shows a broken image.
 */
export default function VehiclePhoto({
  vehicle,
  index = 0,
  showLabel = false,
  className = '',
}: {
  vehicle: Vehicle
  index?: number
  showLabel?: boolean
  className?: string
}) {
  const src = vehicle.images[index]
  const [failed, setFailed] = useState(false)

  // Reset the error state if the source changes (e.g. gallery angle switch).
  useEffect(() => setFailed(false), [src])

  if (src && !failed) {
    return (
      <div className={`${styles.photo} ${className}`}>
        <img
          className={styles.img}
          src={src}
          alt={`${vehicle.name} — photo ${index + 1} of ${vehicle.images.length}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  // Fallback: placeholder tinted by the real paint color.
  const base = colorToHex(vehicle.exteriorColor)
  const light = isLight(base)
  const bg = `linear-gradient(145deg, ${shade(base, 0.14)} 0%, ${base} 46%, ${shade(base, -0.3)} 100%)`
  const glyphColor = light ? 'rgba(10, 27, 95, 0.16)' : 'rgba(255, 255, 255, 0.2)'
  const labelClass = light ? styles.labelDark : styles.labelLight

  return (
    <div
      className={`${styles.photo} ${className}`}
      style={{ background: bg }}
      role="img"
      aria-label={`${vehicle.name}, ${vehicle.exteriorColor}`}
    >
      <div className={styles.gloss} aria-hidden="true" />
      <CarGlyph color={glyphColor} />
      {showLabel && (
        <span className={`${styles.label} ${labelClass}`}>Photo {index + 1}</span>
      )}
    </div>
  )
}

function CarGlyph({ color }: { color: string }) {
  return (
    <svg className={styles.glyph} viewBox="0 0 480 300" aria-hidden="true">
      <g fill={color}>
        <path d="M150 150 q18 -58 70 -60 h40 q52 2 70 60 z" />
        <rect x="70" y="150" width="340" height="66" rx="30" />
      </g>
      <circle cx="158" cy="216" r="33" fill={color} />
      <circle cx="322" cy="216" r="33" fill={color} />
      <circle cx="158" cy="216" r="14" fill="rgba(255,255,255,0.28)" />
      <circle cx="322" cy="216" r="14" fill="rgba(255,255,255,0.28)" />
    </svg>
  )
}
