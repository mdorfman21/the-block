/*
 * Maps the dataset's paint-color names to representative hex values. The images
 * in the dataset are flat placeholder URLs, so instead of gray boxes we render
 * our own photo placeholders tinted by each vehicle's actual exterior/interior
 * color (see VehiclePhoto). This keeps the grid attractive and fully offline.
 */
const COLOR_MAP: Record<string, string> = {
  // blacks
  black: '#1c1f26',
  'crystal black': '#15171c',
  'shadow black': '#191b20',
  // whites (kept off-white so they read against the light UI)
  white: '#e9edf2',
  'glacier white': '#e8eef4',
  'oxford white': '#eef1f5',
  'pearl white': '#eceff4',
  'platinum white': '#e9edf3',
  // silvers
  silver: '#bfc6ce',
  'celestial silver': '#c6ccd3',
  'iconic silver': '#c0c6cf',
  'lunar silver': '#bcc3cc',
  // greys
  grey: '#868d97',
  gray: '#868d97',
  'magnetic grey': '#666d76',
  // blues
  blue: '#2f6bd6',
  'dark blue': '#1e3a8a',
  'midnight blue': '#16224e',
  // reds
  red: '#c42b2b',
  'rapid red': '#c21b26',
  // greens
  green: '#2f7d4f',
  'dark green': '#1e4e36',
  // warm tones
  orange: '#d9641e',
  bronze: '#8a6a40',
  burgundy: '#6a1f2b',
  champagne: '#d6c49e',
  beige: '#d7cab2',
  tan: '#c6a87d',
  brown: '#6a4e37',
}

// Longest keys first so "dark blue" wins over "blue" on a substring match.
const KEYS_BY_LENGTH = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length)

const NEUTRAL = '#9aa3af'

export function colorToHex(name: string): string {
  const key = name.trim().toLowerCase()
  if (COLOR_MAP[key]) return COLOR_MAP[key]
  const hit = KEYS_BY_LENGTH.find((k) => key.includes(k))
  return hit ? COLOR_MAP[hit] : NEUTRAL
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function toHex(n: number): string {
  return Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0')
}

/** Perceived brightness (0–1); used to pick legible text over a paint color. */
export function perceivedBrightness(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function isLight(hex: string): boolean {
  return perceivedBrightness(hex) > 0.6
}

/** Lighten (amount > 0) or darken (amount < 0) a hex color; amount in [-1, 1]. */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const target = amount < 0 ? 0 : 255
  const p = Math.abs(amount)
  return `#${toHex(r + (target - r) * p)}${toHex(g + (target - g) * p)}${toHex(
    b + (target - b) * p,
  )}`
}
