import type { ReactNode } from 'react'
import type { Tone } from '../types'
import styles from './Badge.module.css'

/** Small status pill used for title status, condition grade, bid state, etc. */
export default function Badge({
  tone = 'neutral',
  dot = false,
  children,
  className = '',
}: {
  tone?: Tone
  dot?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${className}`}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  )
}
