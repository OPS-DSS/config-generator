import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WizardState } from '@/lib/types'

type TerritoryStepProps = {
  state: WizardState
  onFieldChange: (field: 'local' | 'subnational' | 'national', value: string) => void
  showError: boolean
}

export function TerritoryStep({ state, onFieldChange, showError }: TerritoryStepProps) {
  return (
    <div className="grid gap-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
        Paso 1 de 6
      </p>
      <h2 className="text-xl font-bold">Territorio</h2>
      <p className="max-w-2xl text-muted-foreground">
        Ingrese las etiquetas territoriales que aparecerán en la configuración.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Label className="col-span-full grid gap-1.5 font-semibold">
          <span>Localidad</span>
          <Input
            value={state.local}
            onChange={(event) => onFieldChange('local', event.target.value)}
            placeholder="Ej. San Martín del Valle o Suaza"
            required
          />
        </Label>

        <Label className="grid gap-1.5 font-semibold">
          <span>Etiqueta subnacional</span>
          <Input
            value={state.subnational}
            onChange={(event) => onFieldChange('subnational', event.target.value)}
            placeholder="Ej. Huila"
            required
          />
        </Label>

        <Label className="grid gap-1.5 font-semibold">
          <span>Etiqueta nacional</span>
          <Input
            value={state.national}
            onChange={(event) => onFieldChange('national', event.target.value)}
            placeholder="Ej. Colombia"
            required
          />
        </Label>
      </div>

      {showError && (
        <Alert variant="destructive">
          <AlertDescription>
            Complete la localidad y las etiquetas subnacional y nacional.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
