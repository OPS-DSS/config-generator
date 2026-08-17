import { expect, test } from '@playwright/test'
import {
  continueStep,
  fillTerritory,
  getGeneratedConfig,
  gotoWizard,
  indicatorCard,
  toggleOption,
} from './helpers'

test('wizard input is reflected accurately in the generated app.config.json', async ({
  page,
}) => {
  await gotoWizard(page)

  // Paso 1: Territorio
  await fillTerritory(page, {
    local: 'Suaza',
    subnational: 'Huila',
    national: 'Colombia',
  })
  await continueStep(page)

  // Paso 2: Funciones
  await toggleOption(page, 'Mapa')
  await continueStep(page)

  // Paso 3: Indicadores
  await toggleOption(page, 'Mortalidad por Suicidio')
  await toggleOption(page, 'Tasa de aprobación')
  await continueStep(page)

  // Paso 4: Estratificación — only stratify the first indicator
  const suicidioCard = indicatorCard(page, 'Mortalidad por Suicidio')
  await suicidioCard.locator('label').filter({ hasText: 'Datos estratificados' }).click()
  await suicidioCard.getByPlaceholder(/Ej\. Sexo/).fill('Sexo')
  const valueInputs = suicidioCard.getByPlaceholder('Ej. Hombres')
  await valueInputs.nth(0).fill('Hombres')
  await valueInputs.nth(1).fill('Mujeres')
  await continueStep(page)

  // Paso 5: Prioridades
  await toggleOption(page, 'Mortalidad por Suicidio')
  await continueStep(page)

  // Paso 6: Relaciones
  await toggleOption(page, 'Tasa de aprobación')
  await continueStep(page)

  // Paso 7: Revisar
  const config = await getGeneratedConfig(page)

  expect(config.local).toBe('Suaza')
  expect(config.subnational).toBe('Huila')
  expect(config.national).toBe('Colombia')
  expect(config.features).toEqual({ map: true, scatter: false })
  expect(config.datasets.scatter).toBeUndefined()

  expect(config.indicators.map((i: any) => i.slug)).toEqual([
    'mortalidad-suicidio',
    'aprobacion',
  ])

  const suicidio = config.indicators.find(
    (i: any) => i.slug === 'mortalidad-suicidio'
  )
  expect(suicidio.priority).toBe(true)
  expect(suicidio.stratifiers).toEqual(['sexo'])

  const sexoField = suicidio.scheme.find((f: any) => f.name === 'sexo')
  expect(sexoField.label).toBe('Sexo')
  expect(sexoField.values).toEqual(['Hombres', 'Mujeres'])
  expect(sexoField.aggregate).toBe('Total')
  expect(Object.keys(sexoField.colors)).toEqual(['Hombres', 'Mujeres'])
  expect(sexoField.colors.Hombres).toMatch(/^#[0-9a-f]{6}$/i)
  expect(sexoField.colors.Mujeres).toMatch(/^#[0-9a-f]{6}$/i)
  expect(sexoField.colors.Hombres).not.toBe(sexoField.colors.Mujeres)

  const aprobacion = config.indicators.find((i: any) => i.slug === 'aprobacion')
  expect(aprobacion.priority).toBe(false)
  expect(aprobacion.related_priorities).toEqual(['mortalidad-suicidio'])
  expect(aprobacion.stratifiers).toEqual([])
})
