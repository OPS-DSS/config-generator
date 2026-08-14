import type { WizardState } from './types'

export const INITIAL_WIZARD_STATE: WizardState = {
  local: '',
  subnational: '',
  national: '',
  features: {
    map: false,
    scatter: false,
  },
  selectedIndicators: [],
  priorityIndicators: [],
  relationships: {},
  stratifiersByIndicator: {},
}

export const WIZARD_STEP_LABELS = [
  '1. Territorio',
  '2. Funciones',
  '3. Indicadores',
  '4. Estratificación',
  '5. Prioridades',
  '6. Relaciones',
  '7. Revisar',
]

/**
 * Drops priorities and relationships that reference indicators no longer
 * selected, mirroring what the previous DOM-based wizard did implicitly by
 * only rendering checkboxes for currently selected indicators.
 */
export function cleanWizardState(state: WizardState): WizardState {
  const selected = new Set(state.selectedIndicators)
  const priorityIndicators = state.priorityIndicators.filter((slug) =>
    selected.has(slug)
  )

  const relationships: Record<string, string[]> = {}

  for (const prioritySlug of priorityIndicators) {
    relationships[prioritySlug] = (
      state.relationships[prioritySlug] ?? []
    ).filter(
      (relatedSlug) => selected.has(relatedSlug) && relatedSlug !== prioritySlug
    )
  }

  const stratifiersByIndicator: WizardState['stratifiersByIndicator'] = {}

  for (const slug of state.selectedIndicators) {
    if (state.stratifiersByIndicator[slug]) {
      stratifiersByIndicator[slug] = state.stratifiersByIndicator[slug]
    }
  }

  return { ...state, priorityIndicators, relationships, stratifiersByIndicator }
}
