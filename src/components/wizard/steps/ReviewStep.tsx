import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildAppConfig } from '@/lib/build-config'
import { cleanWizardState } from '@/lib/wizard-state'
import type { WizardState } from '@/lib/types'

type ReviewStepProps = {
  state: WizardState
}

export function ReviewStep({ state }: ReviewStepProps) {
  const [copied, setCopied] = useState(false)

  const config = useMemo(
    () => buildAppConfig(cleanWizardState(state)),
    [state]
  )
  const json = useMemo(() => JSON.stringify(config, null, 2), [config])

  async function handleCopy() {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  function handleDownload() {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = 'app.config.json'
    document.body.append(anchor)
    anchor.click()
    anchor.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
        Paso 7 de 7
      </p>
      <h2 className="text-xl font-bold">Revisar y descargar</h2>
      <p className="max-w-2xl text-muted-foreground">
        Revise el archivo antes de descargarlo.
      </p>

      <pre className="max-h-[34rem] overflow-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-100">
        <code>{json}</code>
      </pre>

      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <Button type="button" variant="secondary" onClick={handleCopy}>
          {copied ? 'Copiado' : 'Copiar JSON'}
        </Button>
        <Button type="button" onClick={handleDownload}>
          Descargar app.config.json
        </Button>
      </div>
    </div>
  )
}
