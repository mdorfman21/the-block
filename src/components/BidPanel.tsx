import { useEffect, useState } from 'react'
import type { Vehicle } from '../types'
import { useAuction } from '../hooks/useAuction'
import { useCountdown } from '../hooks/useCountdown'
import { auctionService, BidError } from '../services/auctionService'
import { validateBid } from '../lib/bids'
import { auctionEndMs, formatCountdown, timeLeftTone } from '../lib/auction'
import { useToast } from './Toast/ToastProvider'
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
    if (vehicle.buyNowPrice == null) return
    setError(null)
    setPending(true)
    try {
      await auctionService.buyNow(vehicle.id)
      toast.show(
        `You bought this ${vehicle.name} for ${formatCurrency(vehicle.buyNowPrice)}.`,
        'success',
      )
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

      <div
        className={`${styles.countdown} ${
          ended
            ? styles.cdEnded
            : urgency === 'bad'
              ? styles.cdUrgent
              : urgency === 'warn'
                ? styles.cdSoon
                : ''
        }`}
      >
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

          {vehicle.buyNowPrice != null && (
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
                Buy it now · {formatCurrency(vehicle.buyNowPrice)}
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
