import { type MouseEvent } from 'react'
import { useIsWatched } from '../hooks/useWatchlist'
import { watchlistService } from '../services/watchlistService'
import styles from './WatchButton.module.css'

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M10 17.2S3.2 13 3.2 8.3A3.75 3.75 0 0 1 10 6.1a3.75 3.75 0 0 1 6.8 2.2c0 4.7-6.8 8.9-6.8 8.9z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Heart toggle for saving a vehicle to the watchlist. On cards it renders as a
 * round icon button and stops the click from following the card link.
 */
export default function WatchButton({
  vehicleId,
  variant = 'icon',
  stopNavigation = false,
}: {
  vehicleId: string
  variant?: 'icon' | 'labeled'
  stopNavigation?: boolean
}) {
  const watched = useIsWatched(vehicleId)

  function handleClick(e: MouseEvent) {
    if (stopNavigation) {
      e.preventDefault()
      e.stopPropagation()
    }
    watchlistService.toggle(vehicleId)
  }

  const variantClass = variant === 'icon' ? styles.iconBtn : styles.labeledBtn

  return (
    <button
      type="button"
      className={`${styles.btn} ${variantClass} ${watched ? styles.active : ''}`}
      onClick={handleClick}
      aria-pressed={watched}
      aria-label={watched ? 'Remove from watchlist' : 'Save to watchlist'}
      title={watched ? 'Saved' : 'Save'}
    >
      <HeartIcon filled={watched} className={styles.heart} />
      {variant === 'labeled' && <span>{watched ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
