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
  stratifiers?: string[]
  source: string
  label: string
  axisLabel: string
  color: string
  totalColor?: string
}

export type WizardState = {
  local: string
  subnational: string
  national: string
  features: FeatureFlags
  selectedIndicators: string[]
  priorityIndicators: string[]
  relationships: Record<string, string[]>
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
