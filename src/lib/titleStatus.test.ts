import { describe, it, expect } from 'vitest'
import { titleStatusMeta } from './titleStatus'

describe('titleStatusMeta', () => {
  it('maps known statuses to a tone and label', () => {
    expect(titleStatusMeta('clean')).toEqual({ tone: 'ok', label: 'Clean title' })
    expect(titleStatusMeta('salvage')).toEqual({ tone: 'bad', label: 'Salvage title' })
    expect(titleStatusMeta('rebuilt')).toEqual({ tone: 'warn', label: 'Rebuilt title' })
  })

  it('falls back for an unknown status', () => {
    expect(titleStatusMeta('mystery')).toEqual({ tone: 'neutral', label: 'Title status' })
  })
})
