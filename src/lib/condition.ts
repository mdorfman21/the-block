import type { Tone } from '../types'

/*
 * Condition grades in the dataset run ~1.2–5.0. We map a grade to a color tone
 * and a plain-language label so the same scale reads consistently on the card
 * chip and the detail-page meter.
 */

export function gradeTone(grade: number): Tone {
  if (grade >= 4) return 'ok'
  if (grade >= 3) return 'brand'
  if (grade >= 2) return 'warn'
  return 'bad'
}

export function gradeLabel(grade: number): string {
  if (grade >= 4.5) return 'Excellent'
  if (grade >= 3.5) return 'Good'
  if (grade >= 2.5) return 'Average'
  if (grade >= 1.5) return 'Rough'
  return 'Poor'
}

/** Grade as a 0–100 fill for the meter (scale maxes at 5.0). */
export function gradePercent(grade: number): number {
  return Math.max(0, Math.min(100, (grade / 5) * 100))
}

/** Resolve a tone to its solid brand/semantic CSS color variable. */
export function toneColorVar(tone: Tone): string {
  switch (tone) {
    case 'ok':
      return 'var(--ok)'
    case 'warn':
      return 'var(--warn)'
    case 'bad':
      return 'var(--bad)'
    case 'brand':
      return 'var(--brand)'
    default:
      return 'var(--text-muted)'
  }
}
