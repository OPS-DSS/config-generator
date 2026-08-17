import { describe, expect, it } from 'vitest'
import { cleanWizardState } from '@/lib/wizard-state'
import { baseState, stratifier } from './fixtures'

describe('cleanWizardState', () => {
  it('drops priorities that reference indicators no longer selected', () => {
    const state = baseState({
      selectedIndicators: ['mortalidad-suicidio'],
      priorityIndicators: ['mortalidad-suicidio', 'aprobacion'],
    })

    const cleaned = cleanWizardState(state)

    expect(cleaned.priorityIndicators).toEqual(['mortalidad-suicidio'])
  })

  it('drops relationships pointing at unselected or self indicators', () => {
    const state = baseState({
      selectedIndicators: ['mortalidad-suicidio', 'aprobacion'],
      priorityIndicators: ['mortalidad-suicidio'],
      relationships: {
        'mortalidad-suicidio': [
          'aprobacion',
          'mortalidad-suicidio',
          'not-selected',
        ],
      },
    })

    const cleaned = cleanWizardState(state)

    expect(cleaned.relationships['mortalidad-suicidio']).toEqual(['aprobacion'])
  })

  it('drops stratifiers for indicators no longer selected', () => {
    const state = baseState({
      selectedIndicators: ['mortalidad-suicidio'],
      stratifiersByIndicator: {
        'mortalidad-suicidio': [stratifier()],
        aprobacion: [stratifier()],
      },
    })

    const cleaned = cleanWizardState(state)

    expect(Object.keys(cleaned.stratifiersByIndicator)).toEqual([
      'mortalidad-suicidio',
    ])
  })

  it('keeps state untouched when everything already refers to selected indicators', () => {
    const state = baseState({
      selectedIndicators: ['mortalidad-suicidio', 'aprobacion'],
      priorityIndicators: ['mortalidad-suicidio'],
      relationships: { 'mortalidad-suicidio': ['aprobacion'] },
      stratifiersByIndicator: { 'mortalidad-suicidio': [stratifier()] },
    })

    const cleaned = cleanWizardState(state)

    expect(cleaned.priorityIndicators).toEqual(['mortalidad-suicidio'])
    expect(cleaned.relationships).toEqual({ 'mortalidad-suicidio': ['aprobacion'] })
    expect(Object.keys(cleaned.stratifiersByIndicator)).toEqual([
      'mortalidad-suicidio',
    ])
  })
})
