import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { INITIAL_WIZARD_STATE, WIZARD_STEP_LABELS } from '@/lib/wizard-state'
import type { WizardState } from '@/lib/types'
import { TerritoryStep } from './steps/TerritoryStep'
import { FeaturesStep } from './steps/FeaturesStep'
import { IndicatorsStep } from './steps/IndicatorsStep'
import { PrioritiesStep } from './steps/PrioritiesStep'
import { RelationshipsStep } from './steps/RelationshipsStep'
import { ReviewStep } from './steps/ReviewStep'

const LAST_STEP = WIZARD_STEP_LABELS.length - 1

export default function ConfigWizard() {
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE)
  const [currentStep, setCurrentStep] = useState(0)
  const [territoryError, setTerritoryError] = useState(false)
  const [indicatorError, setIndicatorError] = useState(false)

  function validateTerritory(): boolean {
    const valid = Boolean(
      state.local.trim() && state.subnational.trim() && state.national.trim()
    )
    setTerritoryError(!valid)
    return valid
  }

  function validateIndicators(): boolean {
    const valid = state.selectedIndicators.length > 0
    setIndicatorError(!valid)
    return valid
  }

  function goToStep(target: number) {
    if (currentStep === 0 && target > currentStep && !validateTerritory()) {
      return
    }

    if (currentStep === 2 && target > currentStep && !validateIndicators()) {
      return
    }

    setCurrentStep(Math.max(0, Math.min(target, LAST_STEP)))
  }

  function handleFieldChange(
    field: 'local' | 'subnational' | 'national',
    value: string
  ) {
    setState((prev) => ({ ...prev, [field]: value }))
  }

  function handleToggleFeature(feature: 'map' | 'scatter', checked: boolean) {
    setState((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: checked },
    }))
  }

  function handleToggleIndicator(slug: string, checked: boolean) {
    setState((prev) => ({
      ...prev,
      selectedIndicators: checked
        ? [...prev.selectedIndicators, slug]
        : prev.selectedIndicators.filter((value) => value !== slug),
    }))
  }

  function handleTogglePriority(slug: string, checked: boolean) {
    setState((prev) => ({
      ...prev,
      priorityIndicators: checked
        ? [...prev.priorityIndicators, slug]
        : prev.priorityIndicators.filter((value) => value !== slug),
    }))
  }

  function handleToggleRelationship(
    prioritySlug: string,
    relatedSlug: string,
    checked: boolean
  ) {
    setState((prev) => {
      const existing = new Set(prev.relationships[prioritySlug] ?? [])

      if (checked) {
        existing.add(relatedSlug)
      } else {
        existing.delete(relatedSlug)
      }

      return {
        ...prev,
        relationships: { ...prev.relationships, [prioritySlug]: Array.from(existing) },
      }
    })
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Progreso">
        {WIZARD_STEP_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (index <= currentStep + 1) goToStep(index)
            }}
            className={cn(
              'rounded-full px-3.5 py-2.5 text-sm font-bold',
              index === currentStep
                ? 'bg-primary text-primary-foreground'
                : index < currentStep
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      <Card className="p-5 sm:p-8">
        <form
          className="grid gap-4"
          noValidate
          onSubmit={(event) => event.preventDefault()}
        >
          {currentStep === 0 && (
            <TerritoryStep
              state={state}
              onFieldChange={handleFieldChange}
              showError={territoryError}
            />
          )}

          {currentStep === 1 && (
            <FeaturesStep state={state} onToggleFeature={handleToggleFeature} />
          )}

          {currentStep === 2 && (
            <IndicatorsStep
              state={state}
              onToggleIndicator={handleToggleIndicator}
              showError={indicatorError}
            />
          )}

          {currentStep === 3 && (
            <PrioritiesStep state={state} onTogglePriority={handleTogglePriority} />
          )}

          {currentStep === 4 && (
            <RelationshipsStep
              state={state}
              onToggleRelationship={handleToggleRelationship}
            />
          )}

          {currentStep === 5 && <ReviewStep state={state} />}

          <footer className="mt-4 flex justify-between gap-4 border-t pt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={currentStep === 0}
              onClick={() => goToStep(currentStep - 1)}
            >
              Anterior
            </Button>

            {currentStep !== LAST_STEP && (
              <Button type="button" onClick={() => goToStep(currentStep + 1)}>
                Continuar
              </Button>
            )}
          </footer>
        </form>
      </Card>
    </section>
  )
}
