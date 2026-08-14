import { INDICATOR_CATALOG } from './catalog'
import { assignStratifierColors, slugify } from './stratifiers'
import type {
  GeneratedConfig,
  IndicatorDefinition,
  IndicatorStratifier,
  SchemeField,
  WizardState,
} from './types'

function buildScheme(stratifiers: IndicatorStratifier[] = []): SchemeField[] {
  const scheme: SchemeField[] = [
    {
      name: 'territorio',
      type: 'string',
      role: 'territory',
      index: 1,
    },
    {
      name: 'anio',
      type: 'number',
      role: 'year',
      index: 3,
    },
  ]

  stratifiers.forEach((stratifier, offset) => {
    const values = stratifier.values
      .map((entry) => entry.value.trim())
      .filter(Boolean)

    scheme.push({
      name: slugify(stratifier.label),
      type: 'string',
      label: stratifier.label,
      values,
      aggregate: 'Total',
      colors: assignStratifierColors(values),
      index: 4 + offset,
    })
  })

  scheme.push({
    name: 'valor',
    type: 'number',
    role: 'value',
    index: 4 + stratifiers.length,
  })

  return scheme
}

function findIndicator(slug: string): IndicatorDefinition {
  const indicator = INDICATOR_CATALOG.find((item) => item.slug === slug)

  if (!indicator) {
    throw new Error(`El indicador "${slug}" no existe en el catálogo.`)
  }

  return indicator
}

/**
 * The UI stores relationships in the natural direction:
 *
 * priority -> related indicators
 *
 * Example:
 * {
 *   "mortalidad-suicidio": ["formalidad", "desercion"]
 * }
 *
 * app.config.json stores the inverse relationship on each related indicator:
 *
 * related_priorities: ["mortalidad-suicidio"]
 *
 * This preserves the existing configuration contract while allowing an
 * indicator to be both priority=true and related to another priority.
 */
function buildRelatedPriorities(
  indicatorSlug: string,
  state: WizardState,
): string[] {
  return state.priorityIndicators.filter((prioritySlug) => {
    const related = state.relationships[prioritySlug] ?? []
    return related.includes(indicatorSlug)
  })
}

function materialiseIndicator(
  definition: IndicatorDefinition,
  state: WizardState,
) {
  const stratifiers = state.stratifiersByIndicator[definition.slug] ?? []

  return {
    ...definition,
    priority: state.priorityIndicators.includes(definition.slug),
    related_priorities: buildRelatedPriorities(definition.slug, state),
    file: `${definition.slug}.parquet`,
    stratifiers: stratifiers.map((stratifier) => slugify(stratifier.label)),
    scheme: buildScheme(stratifiers),
  }
}

function buildAnalyticsDataset(indicators: IndicatorDefinition[]) {
  return {
    file: 'analytics.parquet',
    scheme: [
      {
        name: 'anio',
        type: 'number',
        role: 'year',
        index: 0,
      },
      {
        name: 'valor',
        type: 'number',
        role: 'value',
        index: 1,
      },
      ...indicators.map((indicator, index) => ({
        name: indicator.slug,
        type: 'number',
        index: index + 2,
      })),
    ],
  }
}

function buildForestPlotDataset() {
  return {
    file: 'forest-plot.parquet',
    scheme: [
      { name: 'anio', type: 'number', role: 'year', index: 0 },
      { name: 'indicador', type: 'string', index: 1 },
      { name: 'label', type: 'string', index: 2 },
      { name: 'correlacion', type: 'number', role: 'value', index: 3 },
      { name: 'ci_lower', type: 'number', index: 4 },
      { name: 'ci_upper', type: 'number', index: 5 },
      { name: 'p_value', type: 'number', index: 6 },
      { name: 'n', type: 'number', index: 7 },
    ],
  }
}

function buildScatterDataset(indicators: IndicatorDefinition[]) {
  return {
    file: 'scatter.parquet',
    scheme: [
      {
        name: 'anio',
        type: 'number',
        role: 'year',
        index: 0,
      },
      {
        name: 'territorio',
        type: 'string',
        role: 'territory',
        index: 1,
      },
      {
        name: 'valor',
        type: 'number',
        role: 'value',
        index: 2,
      },
      ...indicators.map((indicator, index) => ({
        name: indicator.slug,
        type: 'number',
        index: index + 3,
      })),
    ],
  }
}

export function validateWizardState(state: WizardState): string[] {
  const errors: string[] = []

  if (!state.local.trim()) {
    errors.push('La localidad es obligatoria.')
  }

  if (!state.subnational.trim()) {
    errors.push('La etiqueta subnacional es obligatoria.')
  }

  if (!state.national.trim()) {
    errors.push('La etiqueta nacional es obligatoria.')
  }

  if (state.selectedIndicators.length === 0) {
    errors.push('Debe seleccionar al menos un indicador.')
  }

  const selected = new Set(state.selectedIndicators)

  for (const prioritySlug of state.priorityIndicators) {
    if (!selected.has(prioritySlug)) {
      errors.push(
        `El indicador prioritario "${prioritySlug}" no está seleccionado.`,
      )
    }
  }

  for (const [prioritySlug, relatedSlugs] of Object.entries(
    state.relationships,
  )) {
    if (!state.priorityIndicators.includes(prioritySlug)) {
      errors.push(
        `El indicador "${prioritySlug}" tiene relaciones pero no está marcado como prioritario.`,
      )
    }

    for (const relatedSlug of relatedSlugs) {
      if (!selected.has(relatedSlug)) {
        errors.push(
          `El indicador relacionado "${relatedSlug}" no está seleccionado.`,
        )
      }

      if (prioritySlug === relatedSlug) {
        errors.push(
          `El indicador "${prioritySlug}" no puede estar relacionado consigo mismo.`,
        )
      }
    }
  }

  for (const [slug, stratifiers] of Object.entries(
    state.stratifiersByIndicator,
  )) {
    if (stratifiers.length === 0) continue

    if (!selected.has(slug)) {
      errors.push(
        `El indicador "${slug}" tiene estratificadores pero no está seleccionado.`,
      )
      continue
    }

    const names = new Set<string>()

    for (const stratifier of stratifiers) {
      const label = stratifier.label.trim()

      if (!label) {
        errors.push(
          `El indicador "${slug}" tiene un estratificador sin nombre.`,
        )
        continue
      }

      const name = slugify(label)

      if (names.has(name)) {
        errors.push(
          `El indicador "${slug}" tiene estratificadores duplicados: "${label}".`,
        )
      }
      names.add(name)

      const values = new Set(
        stratifier.values.map((entry) => entry.value.trim()).filter(Boolean),
      )

      if (values.size < 2) {
        errors.push(
          `El estratificador "${label}" del indicador "${slug}" debe tener al menos dos valores.`,
        )
      }
    }
  }

  return errors
}

export function buildAppConfig(state: WizardState): GeneratedConfig {
  const errors = validateWizardState(state)

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  const definitions = state.selectedIndicators.map(findIndicator)

  const indicators = definitions.map((definition) =>
    materialiseIndicator(definition, state),
  )

  const datasets: Record<string, unknown> = {
    analytics: buildAnalyticsDataset(definitions),
    forestPlot: buildForestPlotDataset(),
  }

  if (state.features.scatter) {
    datasets.scatter = buildScatterDataset(definitions)
  }

  return {
    local: state.local.trim(),
    subnational: state.subnational.trim(),
    national: state.national.trim(),
    indicators,
    features: {
      map: state.features.map,
      scatter: state.features.scatter,
    },
    data: {
      path: 'public/data/parquet',
    },
    datasets,
  }
}
