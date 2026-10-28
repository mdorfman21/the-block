import { useEffect, useState } from 'react'
import type { Vehicle } from '../types'
import { useAuction } from '../hooks/useAuction'
import { useCountdown } from '../hooks/useCountdown'
import { auctionService, BidError } from '../services/auctionService'
import { validateBid } from '../lib/bids'
import { auctionEndMs, formatCountdown, timeLeftTone } from '../lib/auction'
import { useToast } from './Toast/ToastContext'
import { formatClock, formatCurrency, formatEndsAt } from '../lib/format'
import { ClockIcon } from './Countdown'
import styles from './BidPanel.module.css'

function CheckMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <path
        d="M5 10.5l3 3 7-7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function BidPanel({ vehicle }: { vehicle: Vehicle }) {
  const auction = useAuction(vehicle)
  const toast = useToast()
  const min = auction.minNextBid
  const inc = auction.increment
  const buyNowPrice = vehicle.buyNowPrice

  const endsAt = auctionEndMs(vehicle.id)
  const timeLeft = useCountdown(endsAt, 1000)
  const ended = timeLeft <= 0
  const urgency = timeLeftTone(timeLeft)

  const [amount, setAmount] = useState<number>(min)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAmount(min)
    setError(null)
  }, [min])

  async function placeBid(value: number) {
    const result = validateBid(value, min)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setError(null)
    setPending(true)
    try {
      await auctionService.placeBid(vehicle.id, value)
      toast.show(`Bid placed — ${formatCurrency(value)}. You're the high bidder.`, 'success')
    } catch (e) {
      const msg = e instanceof BidError ? e.message : 'Could not place your bid. Please try again.'
      setError(msg)
      toast.show(msg, 'error')
    } finally {
      setPending(false)
    }
  }

  async function buyNow() {
    if (buyNowPrice == null) return
    setError(null)
    setPending(true)
    try {
      await auctionService.buyNow(vehicle.id)
      toast.show(`You bought this ${vehicle.name} for ${formatCurrency(buyNowPrice)}.`, 'success')
    } catch (e) {
      const msg =
        e instanceof BidError ? e.message : 'Could not complete the purchase. Please try again.'
      setError(msg)
      toast.show(msg, 'error')
    } finally {
      setPending(false)
    }
  }

  const quicks = [min, min + inc, min + inc * 2]

  // Urgency styling for the countdown (red < 1h, amber < 24h).
  const countdownClass = ended
    ? styles.cdEnded
    : urgency === 'bad'
      ? styles.cdUrgent
      : urgency === 'warn'
        ? styles.cdSoon
        : ''

  // ---- Bought outright via Buy It Now ----
  if (auction.purchased) {
    return (
      <div className={styles.panel}>
        <div className={styles.purchasedBanner}>
          <CheckMark className={styles.check} />
          You bought this lot
        </div>
        <div className={styles.priceBlock}>
          <span className={styles.priceLabel}>Purchase price</span>
          <span className={`${styles.price} tnum`}>{formatCurrency(auction.displayPrice)}</span>
        </div>
        {auction.yourBids.length > 0 && (
          <div className={styles.history}>
            <h3 className={styles.historyTitle}>Your activity</h3>
            <ul className={styles.historyList}>
              {auction.yourBids.map((b) => (
                <li key={b.id} className={styles.historyItem}>
                  <span className="tnum">{formatCurrency(b.amount)}</span>
                  <span className={styles.histTime}>
                    {b.kind === 'buy-now' ? 'Bought · ' : ''}
                    {formatClock(b.at)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      {auction.isHighBidder && (
        <div className={styles.highBanner}>
          <CheckMark className={styles.check} />
          You&rsquo;re the high bidder
        </div>
      )}
      {auction.outbid && (
        <div className={styles.outbidBanner}>
          <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.alert}>
            <path
              d="M10 3.3l7.4 12.8H2.6L10 3.3z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M10 8.4v3.6M10 14.2v.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          You&rsquo;ve been outbid
        </div>
      )}

      <div className={styles.priceBlock}>
        <span className={styles.priceLabel}>
          {auction.currentBid != null ? 'Current bid' : 'Starting bid'}
        </span>
        <span className={`${styles.price} tnum`}>{formatCurrency(auction.displayPrice)}</span>
        <span className={styles.bidCount}>
          {auction.currentBid != null ? (
            <>
              <span className="tnum">{auction.bidCount}</span>{' '}
              {auction.bidCount === 1 ? 'bid' : 'bids'}
            </>
          ) : (
            'No bids yet'
          )}
        </span>
      </div>

      <div className={`${styles.countdown} ${countdownClass}`}>
        <ClockIcon className={styles.clockIcon} />
        {ended ? (
          <strong>Auction ended</strong>
        ) : (
          <span className={styles.countdownText}>
            <strong className="tnum">{formatCountdown(timeLeft, true)} left</strong>
            <span className={styles.endsAt}>Ends {formatEndsAt(endsAt)}</span>
          </span>
        )}
      </div>

      {ended ? (
        <p className={styles.endedNotice}>Bidding has closed for this lot.</p>
      ) : (
        <>
          <div className={styles.form}>
            <label className={styles.label} htmlFor="bid-amount">
              Your bid
            </label>
            <div className={styles.inputRow}>
              <button
                type="button"
                className={styles.stepper}
                onClick={() => setAmount((a) => Math.max(min, a - inc))}
                disabled={pending}
                aria-label={`Decrease by ${formatCurrency(inc)}`}
              >
                −
              </button>
              <div className={styles.inputWrap}>
                <span className={styles.dollar}>$</span>
                <input
                  id="bid-amount"
                  className={`${styles.input} tnum`}
                  type="number"
                  value={Number.isFinite(amount) ? amount : ''}
                  min={min}
                  step={inc}
                  disabled={pending}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <button
                type="button"
                className={styles.stepper}
                onClick={() => setAmount((a) => a + inc)}
                disabled={pending}
                aria-label={`Increase by ${formatCurrency(inc)}`}
              >
                +
              </button>
            </div>
            <p className={styles.hint}>
              Minimum {formatCurrency(min)} · bids rise by {formatCurrency(inc)}
            </p>

            <div className={styles.quicks}>
              {quicks.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`${styles.quick} ${amount === q ? styles.quickActive : ''}`}
                  onClick={() => setAmount(q)}
                  disabled={pending}
                >
                  {formatCurrency(q)}
                </button>
              ))}
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              className={styles.placeBtn}
              onClick={() => placeBid(amount)}
              disabled={pending}
            >
              {pending ? 'Working…' : 'Place bid'}
            </button>
          </div>

          {buyNowPrice != null && auction.displayPrice < buyNowPrice && (
            <>
              <div className={styles.or}>
                <span>or</span>
              </div>
              <button
                type="button"
                className={styles.buyNowBtn}
                onClick={buyNow}
                disabled={pending}
              >
                Buy it now · {formatCurrency(buyNowPrice)}
              </button>
            </>
          )}
        </>
      )}

      {auction.yourBids.length > 0 && (
        <div className={styles.history}>
          <h3 className={styles.historyTitle}>Your bids</h3>
          <ul className={styles.historyList}>
            {auction.yourBids.map((b) => (
              <li key={b.id} className={styles.historyItem}>
                <span className="tnum">{formatCurrency(b.amount)}</span>
                <span className={styles.histTime}>{formatClock(b.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
