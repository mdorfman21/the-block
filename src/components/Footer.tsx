import { auctionService } from '../services/auctionService'
import { useYourBidCount } from '../hooks/useAuction'
import { useToast } from './Toast/ToastProvider'
import styles from './Footer.module.css'

export default function Footer() {
  const toast = useToast()
  const yourBids = useYourBidCount()

  async function handleReset() {
    await auctionService.reset()
    toast.show('All bids reset to their starting state.', 'info')
  }

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.note}>
          <strong>The Block</strong> — a buyer-auction prototype for the OPENLANE
          challenge. Vehicle data is synthetic; bids are saved locally in your browser.
        </p>
        {yourBids > 0 && (
          <button type="button" className={styles.reset} onClick={handleReset}>
            Reset my bids
          </button>
        )}
      </div>
    </footer>
  )
}
