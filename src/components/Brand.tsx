import { Link } from 'react-router-dom'
import styles from './Brand.module.css'

/**
 * The product lockup: an OPENLANE-style ring mark, the OPENLANE eyebrow, and the
 * "The Block" wordmark — so the app reads as a genuine OPENLANE product.
 */
export default function Brand() {
  return (
    <Link to="/" className={styles.brand} aria-label="The Block by OPENLANE — home">
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle cx="16" cy="16" r="9" fill="none" stroke="var(--brand)" strokeWidth="4" />
        <circle cx="16" cy="16" r="2.6" fill="var(--brand)" />
      </svg>
      <span className={styles.lockup}>
        <span className={styles.eyebrow}>OPENLANE</span>
        <span className={styles.wordmark}>The Block</span>
      </span>
    </Link>
  )
}
