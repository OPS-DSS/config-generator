import { INDICATOR_CATALOG } from './catalog'
import { buildAppConfig } from './build-config'
import type { WizardState } from './types'

function requireElement<T extends Element>(
  container: ParentNode,
  selector: string
): T {
  const element = container.querySelector<T>(selector)

  if (!element) {
    throw new Error(`Elemento requerido no encontrado: ${selector}`)
  }

  return element
}

export function initConfigWizard(root: HTMLElement) {
  const form = requireElement<HTMLFormElement>(root, 'form')

  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'))
  const navButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-step-nav]')
  )

  const previousButton =
    root.querySelector<HTMLButtonElement>('[data-previous]')
  const nextButton = root.querySelector<HTMLButtonElement>('[data-next]')
  const downloadButton =
    root.querySelector<HTMLButtonElement>('[data-download]')
  const copyButton = root.querySelector<HTMLButtonElement>('[data-copy-json]')

  const localInput = requireElement<HTMLInputElement>(root, '#local')
  const subnationalInput = requireElement<HTMLInputElement>(
    root,
    '#subnational'
  )
  const nationalInput = requireElement<HTMLInputElement>(root, '#national')
  const mapInput = requireElement<HTMLInputElement>(root, '#feature-map')
  const scatterInput = requireElement<HTMLInputElement>(
    root,
    '#feature-scatter'
  )

  const priorityList = requireElement<HTMLElement>(
    root,
    '[data-priority-list]'
  )
  const relationshipsContainer = requireElement<HTMLElement>(
    root,
    '[data-relationships]'
  )
  const noPriorities = root.querySelector<HTMLElement>('[data-no-priorities]')
  const preview = root.querySelector<HTMLElement>('[data-json-preview]')

  const territoryError = root.querySelector<HTMLElement>(
    '[data-territory-error]'
  )
  const indicatorError = root.querySelector<HTMLElement>(
    '[data-indicator-error]'
  )

  let currentStep = 0

  const relationshipState: Record<string, string[]> = {}

  function selectedIndicatorSlugs(): string[] {
    return Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name="selected-indicator"]:checked'
      )
    ).map((input) => input.value)
  }

  function selectedPrioritySlugs(): string[] {
    return Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name="priority-indicator"]:checked'
      )
    ).map((input) => input.value)
  }

  function getIndicator(slug: string) {
    return INDICATOR_CATALOG.find((indicator) => indicator.slug === slug)
  }

  function validateTerritory(): boolean {
    const valid = Boolean(
      localInput.value.trim() &&
        subnationalInput.value.trim() &&
        nationalInput.value.trim()
    )

    if (territoryError) {
      territoryError.hidden = valid
    }

    return valid
  }

  function validateIndicators(): boolean {
    const valid = selectedIndicatorSlugs().length > 0

    if (indicatorError) {
      indicatorError.hidden = valid
    }

    return valid
  }

  function renderPriorities() {
    const selected = selectedIndicatorSlugs()
    const previouslySelected = new Set(selectedPrioritySlugs())

    priorityList.innerHTML = ''

    selected.forEach((slug) => {
      const indicator = getIndicator(slug)
      if (!indicator) return

      const label = document.createElement('label')
      label.className = 'option-card'

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.name = 'priority-indicator'
      checkbox.value = slug
      checkbox.checked = previouslySelected.has(slug)

      const content = document.createElement('span')

      const title = document.createElement('strong')
      title.textContent = indicator.title

      const description = document.createElement('small')
      description.textContent =
        'Marcar como indicador prioritario en esta configuración.'

      content.append(title, description)
      label.append(checkbox, content)
      priorityList.append(label)
    })
  }

  function renderRelationships() {
    const selected = selectedIndicatorSlugs()
    const priorities = selectedPrioritySlugs()

    relationshipsContainer.innerHTML = ''

    if (noPriorities) {
      noPriorities.hidden = priorities.length > 0
    }

    priorities.forEach((prioritySlug) => {
      const priority = getIndicator(prioritySlug)
      if (!priority) return

      const section = document.createElement('section')
      section.className = 'relationship-card'

      const heading = document.createElement('h3')
      heading.textContent = priority.title

      const help = document.createElement('p')
      help.textContent = 'Seleccione los indicadores relacionados:'

      const list = document.createElement('div')
      list.className = 'relationship-options'

      const currentRelationships = new Set(
        relationshipState[prioritySlug] ?? []
      )

      selected
        .filter((slug) => slug !== prioritySlug)
        .forEach((relatedSlug) => {
          const related = getIndicator(relatedSlug)
          if (!related) return

          const label = document.createElement('label')
          label.className = 'relation-option'

          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          checkbox.value = relatedSlug
          checkbox.dataset.prioritySlug = prioritySlug
          checkbox.checked = currentRelationships.has(relatedSlug)

          checkbox.addEventListener('change', () => {
            const existing = new Set(relationshipState[prioritySlug] ?? [])

            if (checkbox.checked) {
              existing.add(relatedSlug)
            } else {
              existing.delete(relatedSlug)
            }

            relationshipState[prioritySlug] = Array.from(existing)
          })

          const text = document.createElement('span')
          text.textContent = related.title

          label.append(checkbox, text)
          list.append(label)
        })

      section.append(heading, help, list)
      relationshipsContainer.append(section)
    })
  }

  function cleanRelationshipState() {
    const selected = new Set(selectedIndicatorSlugs())
    const priorities = new Set(selectedPrioritySlugs())

    Object.keys(relationshipState).forEach((prioritySlug) => {
      if (!priorities.has(prioritySlug)) {
        delete relationshipState[prioritySlug]
        return
      }

      relationshipState[prioritySlug] = (
        relationshipState[prioritySlug] ?? []
      ).filter(
        (relatedSlug) =>
          selected.has(relatedSlug) && relatedSlug !== prioritySlug
      )
    })
  }

  function getState(): WizardState {
    cleanRelationshipState()

    return {
      local: localInput.value.trim(),
      subnational: subnationalInput.value.trim(),
      national: nationalInput.value.trim(),
      features: {
        map: mapInput.checked,
        scatter: scatterInput.checked,
      },
      selectedIndicators: selectedIndicatorSlugs(),
      priorityIndicators: selectedPrioritySlugs(),
      relationships: structuredClone(relationshipState),
    }
  }

  function updatePreview() {
    const config = buildAppConfig(getState())

    if (preview) {
      preview.textContent = JSON.stringify(config, null, 2)
    }

    return config
  }

  function renderStep() {
    steps.forEach((step, index) => {
      step.hidden = index !== currentStep
    })

    navButtons.forEach((button, index) => {
      button.classList.toggle('is-active', index === currentStep)
      button.classList.toggle('is-complete', index < currentStep)
    })

    if (previousButton) {
      previousButton.disabled = currentStep === 0
    }

    if (nextButton) {
      nextButton.hidden = currentStep === steps.length - 1
    }

    if (currentStep === 3) {
      renderPriorities()
    }

    if (currentStep === 4) {
      renderRelationships()
    }

    if (currentStep === 5) {
      updatePreview()
    }
  }

  function goToStep(targetStep: number) {
    if (currentStep === 0 && targetStep > currentStep) {
      if (!validateTerritory()) return
    }

    if (currentStep === 2 && targetStep > currentStep) {
      if (!validateIndicators()) return
    }

    if (currentStep === 3 && targetStep > currentStep) {
      cleanRelationshipState()
    }

    currentStep = Math.max(0, Math.min(targetStep, steps.length - 1))
    renderStep()
  }

  previousButton?.addEventListener('click', () => {
    goToStep(currentStep - 1)
  })

  nextButton?.addEventListener('click', () => {
    goToStep(currentStep + 1)
  })

  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = Number(button.dataset.stepNav)

      if (Number.isNaN(target)) return

      if (target <= currentStep + 1) {
        goToStep(target)
      }
    })
  })

  form.addEventListener('change', (event) => {
    const target = event.target

    if (
      target instanceof HTMLInputElement &&
      target.name === 'selected-indicator'
    ) {
      const selected = new Set(selectedIndicatorSlugs())

      form
        .querySelectorAll<HTMLInputElement>('input[name="priority-indicator"]')
        .forEach((input) => {
          if (!selected.has(input.value)) {
            delete relationshipState[input.value]
          }
        })
    }
  })

  downloadButton?.addEventListener('click', () => {
    const config = updatePreview()
    const json = JSON.stringify(config, null, 2)

    const blob = new Blob([json], {
      type: 'application/json;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = 'app.config.json'
    document.body.append(anchor)
    anchor.click()
    anchor.remove()

    URL.revokeObjectURL(url)
  })

  copyButton?.addEventListener('click', async () => {
    const config = updatePreview()
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2))

    const originalText = copyButton.textContent

    copyButton.textContent = 'Copiado'

    window.setTimeout(() => {
      copyButton.textContent = originalText
    }, 1500)
  })

  renderStep()
}
