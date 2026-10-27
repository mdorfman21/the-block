import { useCountdown } from '../hooks/useCountdown'
import { formatCountdown, timeLeftTone } from '../lib/auction'
import styles from './Countdown.module.css'

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 4.6V8l2.4 1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A self-contained ticking countdown. Used as a photo badge on cards. */
export default function Countdown({
  target,
  variant = 'inline',
  tickMs = 1000,
  withSeconds = false,
}: {
  target: number
  variant?: 'badge' | 'inline'
  tickMs?: number
  withSeconds?: boolean
}) {
  const left = useCountdown(target, tickMs)
  const tone = timeLeftTone(left)
  const ended = left <= 0
  const toneClass = tone === 'neutral' ? '' : styles[`tone_${tone}`]
  const text = ended
    ? 'Auction ended'
    : variant === 'inline'
      ? `Ends in ${formatCountdown(left, withSeconds)}`
      : formatCountdown(left, withSeconds)

  return (
    <span
      className={`${styles[variant]} ${toneClass} ${ended ? styles.ended : ''}`}
      title={ended ? 'Auction ended' : `Ends in ${formatCountdown(left, true)}`}
    >
      <ClockIcon className={styles.icon} />
      <span className="tnum">{text}</span>
    </span>
  )
}
