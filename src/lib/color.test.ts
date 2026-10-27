import { describe, it, expect } from 'vitest'
import { colorToHex, isLight, shade } from './color'

describe('colorToHex', () => {
  it('matches exact dataset color names', () => {
    expect(colorToHex('Midnight Blue')).toBe('#16224e')
    expect(colorToHex('black')).toBe('#1c1f26')
  })

  it('falls back to a keyword substring for unknown multi-word names', () => {
    expect(colorToHex('Deep Ocean Blue')).toBe('#2f6bd6')
  })

  it('returns a neutral for colors it does not recognize', () => {
    expect(colorToHex('Chartreuse')).toBe('#9aa3af')
  })
})

describe('isLight', () => {
  it('distinguishes light from dark paint', () => {
    expect(isLight('#ffffff')).toBe(true)
    expect(isLight('#000000')).toBe(false)
  })
})

describe('shade', () => {
  it('darkens toward black and lightens toward white at the extremes', () => {
    expect(shade('#808080', -1)).toBe('#000000')
    expect(shade('#808080', 1)).toBe('#ffffff')
  })
})
