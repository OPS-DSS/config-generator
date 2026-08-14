import { OptionCard } from '@/components/wizard/OptionCard'
import type { WizardState } from '@/lib/types'

type FeaturesStepProps = {
  state: WizardState
  onToggleFeature: (feature: 'map' | 'scatter', checked: boolean) => void
}

export function FeaturesStep({ state, onToggleFeature }: FeaturesStepProps) {
  return (
    <div className="grid gap-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
        Paso 2 de 6
      </p>
      <h2 className="text-xl font-bold">Funciones del panel</h2>
      <p className="max-w-2xl text-muted-foreground">
        Active únicamente las funciones que utilizará esta instancia.
      </p>

      <div className="grid gap-3">
        <OptionCard
          id="feature-map"
          title="Mapa"
          description="Desactivado por defecto."
          checked={state.features.map}
          onCheckedChange={(checked) => onToggleFeature('map', checked)}
        />

        <OptionCard
          id="feature-scatter"
          title="Gráfico de dispersión"
          description="Desactivado por defecto."
          checked={state.features.scatter}
          onCheckedChange={(checked) => onToggleFeature('scatter', checked)}
        />
      </div>
    </div>
  )
}
