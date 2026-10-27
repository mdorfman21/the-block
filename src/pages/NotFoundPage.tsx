import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Lot not found</h1>
      <p className={styles.sub}>That vehicle may have already rolled off the block.</p>
      <Link to="/" className={styles.link}>
        ← Back to inventory
      </Link>
    </div>
  )
}
