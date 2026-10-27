import { useEffect, useState } from 'react'

/**
 * Milliseconds remaining until `targetMs`, clamped at 0, re-evaluated every
 * `tickMs`. Cards tick per minute; the bid panel ticks per second. The interval
 * stops once the countdown reaches zero.
 */
export function useCountdown(targetMs: number, tickMs = 1000): number {
  const [left, setLeft] = useState(() => Math.max(0, targetMs - Date.now()))

  useEffect(() => {
    setLeft(Math.max(0, targetMs - Date.now()))
    if (targetMs - Date.now() <= 0) return

    const id = window.setInterval(() => {
      const remaining = Math.max(0, targetMs - Date.now())
      setLeft(remaining)
      if (remaining <= 0) window.clearInterval(id)
    }, tickMs)

    return () => window.clearInterval(id)
  }, [targetMs, tickMs])

  return left
}
