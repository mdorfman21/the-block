import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateTime, formatOdometer } from './format'

describe('formatCurrency', () => {
  it('formats whole-dollar amounts with grouping and no cents', () => {
    expect(formatCurrency(14500)).toContain('14,500')
    expect(formatCurrency(14500)).not.toContain('.')
  })
})

describe('formatOdometer', () => {
  it('groups thousands and appends km', () => {
    expect(formatOdometer(47731)).toBe('47,731 km')
  })
})

describe('date formatting is timezone-stable', () => {
  it('treats a zoneless timestamp identically to its UTC-pinned form', () => {
    // The whole point: the displayed value does not drift with the viewer's zone.
    expect(formatDate('2026-04-05T14:00:00')).toBe(formatDate('2026-04-05T14:00:00Z'))
    expect(formatDateTime('2026-04-05T14:00:00')).toBe(formatDateTime('2026-04-05T14:00:00Z'))
  })

  it('renders the encoded calendar date', () => {
    expect(formatDate('2026-04-05T14:00:00')).toContain('2026')
  })
})
