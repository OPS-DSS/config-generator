import { OptionCard } from '@/components/wizard/OptionCard'
import { INDICATOR_CATALOG } from '@/lib/catalog'
import type { WizardState } from '@/lib/types'

type PrioritiesStepProps = {
  state: WizardState
  onTogglePriority: (slug: string, checked: boolean) => void
}

export function PrioritiesStep({ state, onTogglePriority }: PrioritiesStepProps) {
  const priorities = new Set(state.priorityIndicators)

  return (
    <div className="grid gap-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
        Paso 4 de 6
      </p>
      <h2 className="text-xl font-bold">Definir prioridades</h2>
      <p className="max-w-2xl text-muted-foreground">
        Cualquier indicador seleccionado puede ser prioritario. Puede
        seleccionar uno, varios o ninguno.
      </p>

      <div className="grid gap-3">
        {state.selectedIndicators.map((slug) => {
          const indicator = INDICATOR_CATALOG.find((item) => item.slug === slug)
          if (!indicator) return null

          return (
            <OptionCard
              key={slug}
              id={`priority-${slug}`}
              title={indicator.title}
              description="Marcar como indicador prioritario en esta configuración."
              checked={priorities.has(slug)}
              onCheckedChange={(checked) => onTogglePriority(slug, checked)}
            />
          )
        })}
      </div>
    </div>
  )
}
