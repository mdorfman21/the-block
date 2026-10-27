import { describe, it, expect } from 'vitest'
import { gradeLabel, gradePercent, gradeTone } from './condition'

describe('gradeTone', () => {
  it('maps grade bands to tones', () => {
    expect(gradeTone(4.5)).toBe('ok')
    expect(gradeTone(3.2)).toBe('brand')
    expect(gradeTone(2.0)).toBe('warn')
    expect(gradeTone(1.2)).toBe('bad')
  })
})

describe('gradeLabel', () => {
  it('labels each band', () => {
    expect(gradeLabel(4.8)).toBe('Excellent')
    expect(gradeLabel(3.6)).toBe('Good')
    expect(gradeLabel(2.6)).toBe('Average')
    expect(gradeLabel(1.6)).toBe('Rough')
    expect(gradeLabel(1.0)).toBe('Poor')
  })
})

describe('gradePercent', () => {
  it('scales a grade to 0–100 over a max of 5', () => {
    expect(gradePercent(5)).toBe(100)
    expect(gradePercent(2.5)).toBe(50)
    expect(gradePercent(0)).toBe(0)
  })
})
