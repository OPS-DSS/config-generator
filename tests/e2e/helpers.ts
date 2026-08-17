import type { Page } from '@playwright/test'

/**
 * Navigates to the wizard and waits for the React island to finish
 * hydrating. Astro renders the shell server-side and hydrates it
 * client-side (`client:load`); interacting before hydration completes
 * clicks a button with no listener attached yet, so a plain `page.goto('/')`
 * can silently no-op the very first click.
 */
export async function gotoWizard(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Continuar' }).waitFor({ state: 'visible' })
}

/** Clicks the label wrapping a checkbox/toggle by its visible text. */
export async function toggleOption(page: Page, text: string) {
  await page.locator('label').filter({ hasText: text }).first().click()
}

export async function continueStep(page: Page) {
  await page.getByRole('button', { name: 'Continuar' }).click()
}

export async function fillTerritory(
  page: Page,
  values: { local: string; subnational: string; national: string }
) {
  await page.getByPlaceholder(/San Martín/).fill(values.local)
  await page.getByPlaceholder(/Ej\. Huila/).fill(values.subnational)
  await page.getByPlaceholder(/Ej\. Colombia/).fill(values.national)
}

/**
 * Scopes queries to a single indicator's Card on the Estratificación step.
 * The wizard's own outer shell is also a `[data-slot="card"]` and contains
 * every indicator's text, so the filter matches it too — `.last()` picks
 * the innermost (per-indicator) match, which always comes after its
 * ancestor in document order.
 */
export function indicatorCard(page: Page, title: string) {
  return page.locator('[data-slot="card"]').filter({ hasText: title }).last()
}

export async function getGeneratedConfig(page: Page): Promise<any> {
  const text = await page.locator('pre code').textContent()
  return JSON.parse(text ?? '{}')
}
