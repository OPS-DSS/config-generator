import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OptionCard } from '@/components/wizard/OptionCard'
import { INDICATOR_CATALOG } from '@/lib/catalog'
import {
  MIN_STRATIFIER_VALUES,
  createStratifier,
  createStratifierValue,
} from '@/lib/stratifiers'
import type { IndicatorStratifier, WizardState } from '@/lib/types'

type StratifiersStepProps = {
  state: WizardState
  onChange: (slug: string, stratifiers: IndicatorStratifier[]) => void
  showError: boolean
}

function indicatorTitle(slug: string): string {
  return INDICATOR_CATALOG.find((item) => item.slug === slug)?.title ?? slug
}

type StratifierEditorProps = {
  stratifier: IndicatorStratifier
  onChange: (next: IndicatorStratifier) => void
  onRemove: () => void
}

function StratifierEditor({
  stratifier,
  onChange,
  onRemove,
}: StratifierEditorProps) {
  return (
    <div className="grid gap-2 rounded-md border p-3">
      <div className="flex items-end gap-2">
        <Label className="grid flex-1 gap-1.5 font-semibold">
          <span>Nombre del estratificador</span>
          <Input
            value={stratifier.label}
            onChange={(event) =>
              onChange({ ...stratifier, label: event.target.value })
            }
            placeholder="Ej. Sexo, Zona, Régimen"
          />
        </Label>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Eliminar
        </Button>
      </div>

      <div className="grid gap-2">
        <span className="text-sm text-muted-foreground">
          Valores (mínimo {MIN_STRATIFIER_VALUES})
        </span>

        {stratifier.values.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2">
            <Input
              value={entry.value}
              onChange={(event) =>
                onChange({
                  ...stratifier,
                  values: stratifier.values.map((value) =>
                    value.id === entry.id
                      ? { ...value, value: event.target.value }
                      : value
                  ),
                })
              }
              placeholder="Ej. Hombres"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={stratifier.values.length <= MIN_STRATIFIER_VALUES}
              onClick={() =>
                onChange({
                  ...stratifier,
                  values: stratifier.values.filter(
                    (value) => value.id !== entry.id
                  ),
                })
              }
            >
              Quitar
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="justify-self-start"
          onClick={() =>
            onChange({
              ...stratifier,
              values: [...stratifier.values, createStratifierValue()],
            })
          }
        >
          Agregar valor
        </Button>
      </div>
    </div>
  )
}

export function StratifiersStep({
  state,
  onChange,
  showError,
}: StratifiersStepProps) {
  return (
    <div className="grid gap-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
        Paso 4 de 7
      </p>
      <h2 className="text-xl font-bold">Estratificación</h2>
      <p className="max-w-2xl text-muted-foreground">
        Indique si los datos de cada indicador vienen estratificados (por
        ejemplo, por sexo, zona o régimen). Puede agregar cero, uno o varios
        estratificadores por indicador, cada uno con al menos dos valores.
      </p>

      <div className="grid gap-4">
        {state.selectedIndicators.map((slug) => {
          const stratifiers = state.stratifiersByIndicator[slug] ?? []
          const isStratified = stratifiers.length > 0

          function setStratifiers(next: IndicatorStratifier[]) {
            onChange(slug, next)
          }

          return (
            <Card key={slug} className="gap-3 p-4">
              <h3 className="font-semibold">{indicatorTitle(slug)}</h3>

              <OptionCard
                id={`stratified-${slug}`}
                title="Datos estratificados"
                description="Active esta opción si el indicador se puede desagregar por una o más variables."
                checked={isStratified}
                onCheckedChange={(checked) =>
                  setStratifiers(checked ? [createStratifier()] : [])
                }
                compact
              />

              {isStratified && (
                <div className="grid gap-3 border-l-2 border-border pl-4">
                  {stratifiers.map((stratifier) => (
                    <StratifierEditor
                      key={stratifier.id}
                      stratifier={stratifier}
                      onChange={(next) =>
                        setStratifiers(
                          stratifiers.map((item) =>
                            item.id === next.id ? next : item
                          )
                        )
                      }
                      onRemove={() =>
                        setStratifiers(
                          stratifiers.filter(
                            (item) => item.id !== stratifier.id
                          )
                        )
                      }
                    />
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-self-start"
                    onClick={() =>
                      setStratifiers([...stratifiers, createStratifier()])
                    }
                  >
                    Agregar otro estratificador
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {showError && (
        <Alert variant="destructive">
          <AlertDescription>
            Cada estratificador debe tener un nombre y al menos dos valores
            completos.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
