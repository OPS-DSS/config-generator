import { OptionCard } from '@/components/wizard/OptionCard'
import { INDICATOR_CATALOG } from '@/lib/catalog'
import type { WizardState } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'

type IndicatorsStepProps = {
  state: WizardState
  onToggleIndicator: (slug: string, checked: boolean) => void
  showError: boolean
}

export function IndicatorsStep({
  state,
  onToggleIndicator,
  showError,
}: IndicatorsStepProps) {
  const selected = new Set(state.selectedIndicators)

  return (
    <div className="grid gap-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
        Paso 3 de 6
      </p>
      <h2 className="text-xl font-bold">Seleccionar indicadores</h2>
      <p className="max-w-2xl text-muted-foreground">
        Seleccione todos los indicadores que formarán parte de esta
        configuración.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {INDICATOR_CATALOG.map((indicator) => (
          <OptionCard
            key={indicator.slug}
            id={`indicator-${indicator.slug}`}
            title={indicator.title}
            description={indicator.description}
            meta={`${indicator.dimension} · ${indicator.subdimensions.join(', ')}`}
            checked={selected.has(indicator.slug)}
            onCheckedChange={(checked) =>
              onToggleIndicator(indicator.slug, checked)
            }
          />
        ))}
      </div>

      {showError && (
        <Alert variant="destructive">
          <AlertDescription>Seleccione al menos un indicador.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
