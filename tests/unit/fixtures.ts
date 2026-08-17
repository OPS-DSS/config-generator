import { INITIAL_WIZARD_STATE } from '@/lib/wizard-state'
import type { IndicatorStratifier, WizardState } from '@/lib/types'

export function baseState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    ...INITIAL_WIZARD_STATE,
    local: 'Suaza',
    subnational: 'Huila',
    national: 'Colombia',
    selectedIndicators: ['mortalidad-suicidio'],
    ...overrides,
  }
}

export function stratifier(
  overrides: Partial<IndicatorStratifier> = {}
): IndicatorStratifier {
  return {
    id: 'strat-1',
    label: 'Sexo',
    values: [
      { id: 'v1', value: 'Hombres' },
      { id: 'v2', value: 'Mujeres' },
    ],
    ...overrides,
  }
}
