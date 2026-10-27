import { describe, it, expect } from 'vitest'
import { auctionEndMs, formatCountdown, timeLeftTone } from './auction'

describe('formatCountdown', () => {
  it('returns "Ended" for non-positive time', () => {
    expect(formatCountdown(0)).toBe('Ended')
    expect(formatCountdown(-5000)).toBe('Ended')
  })

  it('formats days + hours, then hours + minutes', () => {
    expect(formatCountdown((2 * 86400 + 4 * 3600) * 1000)).toBe('2d 4h')
    expect(formatCountdown((3 * 3600 + 12 * 60) * 1000)).toBe('3h 12m')
  })

  it('formats minutes, optionally with seconds, and bare seconds', () => {
    expect(formatCountdown(45 * 60 * 1000)).toBe('45m')
    expect(formatCountdown((45 * 60 + 30) * 1000, true)).toBe('45m 30s')
    expect(formatCountdown(30 * 1000)).toBe('30s')
  })
})

describe('timeLeftTone', () => {
  it('escalates as the clock runs down', () => {
    expect(timeLeftTone(0)).toBe('neutral')
    expect(timeLeftTone(30 * 60 * 1000)).toBe('bad')
    expect(timeLeftTone(5 * 60 * 60 * 1000)).toBe('warn')
    expect(timeLeftTone(2 * 24 * 60 * 60 * 1000)).toBe('neutral')
  })
})

describe('auctionEndMs', () => {
  it('is deterministic per vehicle and in the future', () => {
    expect(auctionEndMs('abc')).toBe(auctionEndMs('abc'))
    expect(auctionEndMs('abc')).toBeGreaterThan(Date.now())
  })
})
