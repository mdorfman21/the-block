import { describe, it, expect } from 'vitest'
import { capitalize } from './text'

describe('capitalize', () => {
  it('uppercases only the first character', () => {
    expect(capitalize('clean')).toBe('Clean')
    expect(capitalize('single-speed')).toBe('Single-speed')
  })

  it('leaves already-capitalized text alone', () => {
    expect(capitalize('SUV')).toBe('SUV')
  })

  it('handles an empty string', () => {
    expect(capitalize('')).toBe('')
  })
})
