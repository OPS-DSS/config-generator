import { describe, expect, it } from 'vitest'
import {
  MIN_STRATIFIER_VALUES,
  assignStratifierColors,
  createStratifier,
  slugify,
} from '@/lib/stratifiers'

describe('slugify', () => {
  it('lowercases and strips accents', () => {
    expect(slugify('Régimen')).toBe('regimen')
    expect(slugify('Sexo')).toBe('sexo')
  })

  it('collapses spaces and punctuation into underscores', () => {
    expect(slugify('Zona rural / urbana')).toBe('zona_rural_urbana')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('  Etnia!! ')).toBe('etnia')
  })
})

describe('createStratifier', () => {
  it('starts with an empty label and the minimum number of empty values', () => {
    const stratifier = createStratifier()

    expect(stratifier.label).toBe('')
    expect(stratifier.values).toHaveLength(MIN_STRATIFIER_VALUES)
    expect(stratifier.values.every((entry) => entry.value === '')).toBe(true)
  })

  it('gives every stratifier and value a unique id', () => {
    const a = createStratifier()
    const b = createStratifier()

    expect(a.id).not.toBe(b.id)
    expect(a.values[0].id).not.toBe(a.values[1].id)
  })
})

describe('assignStratifierColors', () => {
  it('assigns one valid hex color per value', () => {
    const colors = assignStratifierColors(['Hombres', 'Mujeres', 'Otro'])

    expect(Object.keys(colors)).toEqual(['Hombres', 'Mujeres', 'Otro'])
    for (const color of Object.values(colors)) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('gives every value a distinct color', () => {
    const colors = assignStratifierColors(['A', 'B', 'C', 'D', 'E'])
    const unique = new Set(Object.values(colors))

    expect(unique.size).toBe(5)
  })

  it('returns an empty map for an empty list', () => {
    expect(assignStratifierColors([])).toEqual({})
  })
})
