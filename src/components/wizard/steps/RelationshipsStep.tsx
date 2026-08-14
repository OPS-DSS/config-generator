import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { INDICATOR_CATALOG } from '@/lib/catalog'
import type { WizardState } from '@/lib/types'
import { cn } from '@/lib/utils'

type RelationshipsStepProps = {
  state: WizardState
  onToggleRelationship: (
    prioritySlug: string,
    relatedSlug: string,
    checked: boolean
  ) => void
}

function indicatorTitle(slug: string): string {
  return INDICATOR_CATALOG.find((item) => item.slug === slug)?.title ?? slug
}

export function RelationshipsStep({
  state,
  onToggleRelationship,
}: RelationshipsStepProps) {
  const selected = new Set(state.selectedIndicators)
  const priorities = state.priorityIndicators.filter((slug) => selected.has(slug))

  return (
    <div className="grid gap-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
        Paso 6 de 7
      </p>
      <h2 className="text-xl font-bold">Relacionar indicadores</h2>
      <p className="max-w-2xl text-muted-foreground">
        Para cada indicador prioritario, seleccione los indicadores
        relacionados. Un indicador prioritario también puede relacionarse con
        otra prioridad.
      </p>

      {priorities.length === 0 ? (
        <Alert>
          <AlertDescription>
            No ha seleccionado indicadores prioritarios. Puede continuar sin
            definir relaciones.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-3">
          {priorities.map((prioritySlug) => {
            const related = state.relationships[prioritySlug] ?? []
            const relatedSet = new Set(related)
            const options = state.selectedIndicators.filter(
              (slug) => slug !== prioritySlug
            )

            return (
              <Card key={prioritySlug} className="gap-2 p-4">
                <h3 className="font-semibold">{indicatorTitle(prioritySlug)}</h3>
                <p className="text-sm text-muted-foreground">
                  Seleccione los indicadores relacionados:
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {options.map((relatedSlug) => {
                    const id = `relation-${prioritySlug}-${relatedSlug}`
                    const checked = relatedSet.has(relatedSlug)

                    return (
                      <Label
                        key={relatedSlug}
                        htmlFor={id}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-md border p-3 font-normal',
                          checked
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent/50'
                        )}
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={(value) =>
                            onToggleRelationship(
                              prioritySlug,
                              relatedSlug,
                              value === true
                            )
                          }
                        />
                        <span className="text-sm">{indicatorTitle(relatedSlug)}</span>
                      </Label>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
