import { defineConfig, devices } from '@playwright/test'

const PORT = 4321

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  // No `webServer` here: the dev-server lifecycle is managed by
  // scripts/e2e.mjs (see the comment there for why).
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
