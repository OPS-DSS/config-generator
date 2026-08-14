export type FeatureFlags = {
  map: boolean
  scatter: boolean
}

export type IndicatorDefinition = {
  slug: string
  title: string
  text?: string
  description: string
  category?: string
  dimension: 'dss' | 'policy'
  subdimensions: string[]
  source: string
  label: string
  axisLabel: string
  color: string
  totalColor?: string
  bivariate_value?: string
}

export type StratifierValueEntry = {
  id: string
  value: string
}

/**
 * A stratifier as configured in the wizard for a single indicator. `label`
 * is the only thing the user edits; the scheme column name is derived from
 * it (see `slugify` in lib/stratifiers.ts) rather than stored here, so it
 * never falls out of sync while the user is still typing the label. Colors
 * aren't assigned until the config is generated (see `buildScheme` in
 * lib/build-config.ts), once the final set of values is known.
 */
export type IndicatorStratifier = {
  id: string
  label: string
  values: StratifierValueEntry[]
}

export type WizardState = {
  local: string
  subnational: string
  national: string
  features: FeatureFlags
  selectedIndicators: string[]
  priorityIndicators: string[]
  relationships: Record<string, string[]>
  stratifiersByIndicator: Record<string, IndicatorStratifier[]>
}

export type SchemeField = {
  name: string
  type: 'string' | 'number'
  role?: 'territory' | 'year' | 'value'
  label?: string
  values?: string[]
  aggregate?: string
  colors?: Record<string, string>
  index: number
}

export type GeneratedIndicator = IndicatorDefinition & {
  priority: boolean
  related_priorities: string[]
  file: string
  stratifiers: string[]
  scheme: SchemeField[]
}

export type GeneratedConfig = {
  local: string
  subnational: string
  national: string
  indicators: GeneratedIndicator[]
  features: FeatureFlags
  data: {
    path: string
  }
  datasets: Record<string, unknown>
}
