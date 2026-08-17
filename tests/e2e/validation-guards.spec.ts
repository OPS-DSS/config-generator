import { expect, test } from '@playwright/test'
import {
  continueStep,
  fillTerritory,
  gotoWizard,
  indicatorCard,
  toggleOption,
} from './helpers'

test('blocks advancing past Territorio when fields are empty', async ({ page }) => {
  await gotoWizard(page)

  await continueStep(page)

  await expect(
    page.getByText('Complete la localidad y las etiquetas subnacional y nacional.')
  ).toBeVisible()
  await expect(page.getByText('Funciones del panel')).toHaveCount(0)
})

test('blocks advancing past Indicadores with none selected', async ({ page }) => {
  await gotoWizard(page)

  await fillTerritory(page, {
    local: 'Suaza',
    subnational: 'Huila',
    national: 'Colombia',
  })
  await continueStep(page) // -> Funciones
  await continueStep(page) // -> Indicadores
  await continueStep(page) // blocked: no indicator selected

  await expect(page.getByText('Seleccione al menos un indicador.')).toBeVisible()
  await expect(page.getByText('Estratificación', { exact: true })).toHaveCount(0)
})

test('blocks advancing past Estratificación when a stratifier is incomplete, and allows zero stratifiers', async ({
  page,
}) => {
  await gotoWizard(page)

  await fillTerritory(page, {
    local: 'Suaza',
    subnational: 'Huila',
    national: 'Colombia',
  })
  await continueStep(page) // -> Funciones
  await continueStep(page) // -> Indicadores
  await toggleOption(page, 'Mortalidad por Suicidio')
  await continueStep(page) // -> Estratificación

  const card = indicatorCard(page, 'Mortalidad por Suicidio')
  await card.locator('label').filter({ hasText: 'Datos estratificados' }).click()
  // Leave the auto-created stratifier's name and values empty.
  await continueStep(page)

  await expect(
    page.getByText('Cada estratificador debe tener un nombre y al menos dos valores completos.')
  ).toBeVisible()

  // Turning stratification back off (zero stratifiers) must be a valid state.
  await card.locator('label').filter({ hasText: 'Datos estratificados' }).click()
  await continueStep(page)

  await expect(page.getByText('Definir prioridades')).toBeVisible()
})
