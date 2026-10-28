import type { TitleStatus, Tone } from '../types'

const META: Record<TitleStatus, { tone: Tone; label: string }> = {
  clean: { tone: 'ok', label: 'Clean title' },
  salvage: { tone: 'bad', label: 'Salvage title' },
  rebuilt: { tone: 'warn', label: 'Rebuilt title' },
}

const FALLBACK: { tone: Tone; label: string } = { tone: 'neutral', label: 'Title status' }

/** Color tone + label for a title status — shared by the card and detail views. */
export function titleStatusMeta(status: string): { tone: Tone; label: string } {
  return META[status as TitleStatus] ?? FALLBACK
}
