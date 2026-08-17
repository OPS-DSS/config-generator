import { describe, expect, it } from 'vitest'
import { buildAppConfig, validateWizardState } from '@/lib/build-config'
import { baseState, stratifier } from './fixtures'

describe('validateWizardState', () => {
  it('requires the territory fields', () => {
    const errors = validateWizardState(baseState({ local: '', subnational: '' }))

    expect(errors).toContain('La localidad es obligatoria.')
    expect(errors).toContain('La etiqueta subnacional es obligatoria.')
  })

  it('requires at least one selected indicator', () => {
    const errors = validateWizardState(baseState({ selectedIndicators: [] }))

    expect(errors).toContain('Debe seleccionar al menos un indicador.')
  })

  it('rejects a priority indicator that is not selected', () => {
    const errors = validateWizardState(
      baseState({ priorityIndicators: ['aprobacion'] })
    )

    expect(
      errors.some((e) => e.includes('"aprobacion"') && e.includes('no está seleccionado'))
    ).toBe(true)
  })

  it('rejects a relationship on an indicator that is not a priority', () => {
    const errors = validateWizardState(
      baseState({
        selectedIndicators: ['mortalidad-suicidio', 'aprobacion'],
        relationships: { 'mortalidad-suicidio': ['aprobacion'] },
      })
    )

    expect(errors.some((e) => e.includes('no está marcado como prioritario'))).toBe(
      true
    )
  })

  it('rejects a relationship to an indicator that is not selected', () => {
    const errors = validateWizardState(
      baseState({
        selectedIndicators: ['mortalidad-suicidio'],
        priorityIndicators: ['mortalidad-suicidio'],
        relationships: { 'mortalidad-suicidio': ['aprobacion'] },
      })
    )

    expect(errors.some((e) => e.includes('no está seleccionado'))).toBe(true)
  })

  it('rejects a self-relationship', () => {
    const errors = validateWizardState(
      baseState({
        priorityIndicators: ['mortalidad-suicidio'],
        relationships: { 'mortalidad-suicidio': ['mortalidad-suicidio'] },
      })
    )

    expect(
      errors.some((e) => e.includes('no puede estar relacionado consigo mismo'))
    ).toBe(true)
  })

  it('rejects stratifiers attached to an unselected indicator', () => {
    const errors = validateWizardState(
      baseState({
        selectedIndicators: ['mortalidad-suicidio'],
        stratifiersByIndicator: { aprobacion: [stratifier()] },
      })
    )

    expect(
      errors.some((e) => e.includes('"aprobacion"') && e.includes('no está seleccionado'))
    ).toBe(true)
  })

  it('rejects a stratifier with no name', () => {
    const errors = validateWizardState(
      baseState({
        stratifiersByIndicator: {
          'mortalidad-suicidio': [stratifier({ label: '   ' })],
        },
      })
    )

    expect(errors.some((e) => e.includes('sin nombre'))).toBe(true)
  })

  it('rejects duplicate stratifier names on the same indicator', () => {
    const errors = validateWizardState(
      baseState({
        stratifiersByIndicator: {
          'mortalidad-suicidio': [
            stratifier({ id: 'a', label: 'Sexo' }),
            stratifier({ id: 'b', label: 'sexo' }),
          ],
        },
      })
    )

    expect(errors.some((e) => e.includes('duplicados'))).toBe(true)
  })

  it('rejects a stratifier with fewer than two distinct non-empty values', () => {
    const errors = validateWizardState(
      baseState({
        stratifiersByIndicator: {
          'mortalidad-suicidio': [
            stratifier({
              values: [
                { id: 'v1', value: 'Hombres' },
                { id: 'v2', value: '  ' },
              ],
            }),
          ],
        },
      })
    )

    expect(errors.some((e) => e.includes('al menos dos valores'))).toBe(true)
  })

  it('accepts a fully valid state', () => {
    const errors = validateWizardState(
      baseState({
        selectedIndicators: ['mortalidad-suicidio', 'aprobacion'],
        priorityIndicators: ['mortalidad-suicidio'],
        relationships: { 'mortalidad-suicidio': ['aprobacion'] },
        stratifiersByIndicator: { 'mortalidad-suicidio': [stratifier()] },
      })
    )

    expect(errors).toEqual([])
  })
})

describe('buildAppConfig', () => {
  it('throws when the wizard state is invalid', () => {
    expect(() => buildAppConfig(baseState({ selectedIndicators: [] }))).toThrow()
  })

  it('trims territory labels and carries feature flags through', () => {
    const config = buildAppConfig(
      baseState({
        local: '  Suaza  ',
        subnational: ' Huila ',
        national: ' Colombia ',
        features: { map: true, scatter: false },
      })
    )

    expect(config.local).toBe('Suaza')
    expect(config.subnational).toBe('Huila')
    expect(config.national).toBe('Colombia')
    expect(config.features).toEqual({ map: true, scatter: false })
    expect(config.datasets.scatter).toBeUndefined()
  })

  it('includes the scatter dataset only when the scatter feature is on', () => {
    const config = buildAppConfig(baseState({ features: { map: false, scatter: true } }))

    expect(config.datasets.scatter).toBeDefined()
  })

  it('marks priority indicators and inverts relationships into related_priorities', () => {
    const config = buildAppConfig(
      baseState({
        selectedIndicators: ['mortalidad-suicidio', 'aprobacion'],
        priorityIndicators: ['mortalidad-suicidio'],
        relationships: { 'mortalidad-suicidio': ['aprobacion'] },
      })
    )

    const priority = config.indicators.find((i) => i.slug === 'mortalidad-suicidio')!
    const related = config.indicators.find((i) => i.slug === 'aprobacion')!

    expect(priority.priority).toBe(true)
    expect(priority.related_priorities).toEqual([])
    expect(related.priority).toBe(false)
    expect(related.related_priorities).toEqual(['mortalidad-suicidio'])
  })

  it('gives every indicator a scheme with territory, year and value columns even with no stratifiers', () => {
    const config = buildAppConfig(baseState())
    const indicator = config.indicators[0]

    expect(indicator.stratifiers).toEqual([])
    expect(indicator.scheme.map((c) => c.name)).toEqual([
      'territorio',
      'anio',
      'valor',
    ])
    expect(indicator.scheme.map((c) => c.role)).toEqual([
      'territory',
      'year',
      'value',
    ])
  })

  it('builds a scheme column per stratifier, positioned between year and value', () => {
    const config = buildAppConfig(
      baseState({
        stratifiersByIndicator: {
          'mortalidad-suicidio': [
            stratifier({ label: 'Sexo', values: [
              { id: 'v1', value: 'Hombres' },
              { id: 'v2', value: 'Mujeres' },
            ] }),
          ],
        },
      })
    )

    const indicator = config.indicators[0]
    expect(indicator.stratifiers).toEqual(['sexo'])
    expect(indicator.scheme.map((c) => c.name)).toEqual([
      'territorio',
      'anio',
      'sexo',
      'valor',
    ])

    const sexoField = indicator.scheme.find((c) => c.name === 'sexo')!
    expect(sexoField.label).toBe('Sexo')
    expect(sexoField.values).toEqual(['Hombres', 'Mujeres'])
    expect(sexoField.aggregate).toBe('Total')
    expect(Object.keys(sexoField.colors ?? {})).toEqual(['Hombres', 'Mujeres'])
    expect(sexoField.colors!.Hombres).not.toBe(sexoField.colors!.Mujeres)
  })

  it('supports multiple stratifiers on the same indicator', () => {
    const config = buildAppConfig(
      baseState({
        stratifiersByIndicator: {
          'mortalidad-suicidio': [
            stratifier({ id: 'a', label: 'Sexo' }),
            stratifier({
              id: 'b',
              label: 'Zona',
              values: [
                { id: 'v1', value: 'Urbana' },
                { id: 'v2', value: 'Rural' },
              ],
            }),
          ],
        },
      })
    )

    const indicator = config.indicators[0]
    expect(indicator.stratifiers).toEqual(['sexo', 'zona'])
    expect(indicator.scheme.map((c) => c.name)).toEqual([
      'territorio',
      'anio',
      'sexo',
      'zona',
      'valor',
    ])
  })

  it('drops blank values before building the scheme and colors', () => {
    const config = buildAppConfig(
      baseState({
        stratifiersByIndicator: {
          'mortalidad-suicidio': [
            stratifier({
              values: [
                { id: 'v1', value: 'Hombres' },
                { id: 'v2', value: '  ' },
                { id: 'v3', value: 'Mujeres' },
              ],
            }),
          ],
        },
      })
    )

    const sexoField = config.indicators[0].scheme.find((c) => c.name === 'sexo')!
    expect(sexoField.values).toEqual(['Hombres', 'Mujeres'])
    expect(Object.keys(sexoField.colors ?? {})).toEqual(['Hombres', 'Mujeres'])
  })
})
