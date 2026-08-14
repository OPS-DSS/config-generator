import type { IndicatorStratifier, StratifierValueEntry } from './types'

export function createId(): string {
  return crypto.randomUUID()
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function hexToHue(hex: string): number {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  if (d === 0) return 0

  let hue: number
  switch (max) {
    case r:
      hue = ((g - b) / d) % 6
      break
    case g:
      hue = (b - r) / d + 2
      break
    default:
      hue = (r - g) / d + 4
  }

  hue *= 60
  return hue < 0 ? hue + 360 : hue
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100
  const l = lightness / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - c / 2

  let [r, g, b] = [0, 0, 0]

  if (hue < 60) [r, g, b] = [c, x, 0]
  else if (hue < 120) [r, g, b] = [x, c, 0]
  else if (hue < 180) [r, g, b] = [0, c, x]
  else if (hue < 240) [r, g, b] = [0, x, c]
  else if (hue < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

const SATURATION = 65
const LIGHTNESS = 48
const CANDIDATE_COUNT = 30

/**
 * Picks a random hue, then keeps re-rolling a batch of candidates and takes
 * whichever lands farthest (by hue distance) from colors already assigned
 * within the same stratifier. Colors stay genuinely random from run to run
 * while avoiding near-duplicates when a stratifier has several values.
 */
export function randomDistinctColor(existingColors: string[] = []): string {
  const existingHues = existingColors.map(hexToHue)

  let bestHue = Math.random() * 360
  let bestScore = -1

  for (let i = 0; i < CANDIDATE_COUNT; i++) {
    const candidate = Math.random() * 360
    const minDistance =
      existingHues.length === 0
        ? 360
        : Math.min(...existingHues.map((hue) => hueDistance(candidate, hue)))

    if (minDistance > bestScore) {
      bestScore = minDistance
      bestHue = candidate
    }
  }

  return hslToHex(bestHue, SATURATION, LIGHTNESS)
}

export function createStratifierValue(): StratifierValueEntry {
  return {
    id: createId(),
    value: '',
  }
}

export const MIN_STRATIFIER_VALUES = 2

export function createStratifier(): IndicatorStratifier {
  const values: StratifierValueEntry[] = []

  for (let i = 0; i < MIN_STRATIFIER_VALUES; i++) {
    values.push(createStratifierValue())
  }

  return {
    id: createId(),
    label: '',
    values,
  }
}

/**
 * Assigns a color to each value once the final list is known (at config
 * generation time), spreading hues as far apart as `randomDistinctColor`
 * can manage across the whole set.
 */
export function assignStratifierColors(values: string[]): Record<string, string> {
  const colors: Record<string, string> = {}
  const assigned: string[] = []

  for (const value of values) {
    const color = randomDistinctColor(assigned)
    assigned.push(color)
    colors[value] = color
  }

  return colors
}
