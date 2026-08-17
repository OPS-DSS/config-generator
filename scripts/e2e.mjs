#!/usr/bin/env node
// Drives the e2e run's dev-server lifecycle explicitly.
//
// `astro dev` in this project always forks a background daemon and returns
// immediately (see astro dev --background / stop / status / logs), even
// without --background. That's incompatible with Playwright's `webServer`
// option, which expects its command to stay alive as the server process
// itself — Playwright sees the immediate exit and reports "Process from
// config.webServer exited early." So this script owns start/wait/stop
// around `playwright test` instead of delegating that to Playwright.
import { spawn } from 'node:child_process'

const PORT = process.env.PORT ?? '4321'
const URL = `http://localhost:${PORT}/`

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options })
    child.on('exit', (code) =>
      code === 0
        ? resolvePromise()
        : reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    )
  })
}

async function waitUntilUp(timeoutMs = 30_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(URL)
      if (res.status < 500) return true
    } catch {
      // not up yet
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 300))
  }
  return false
}

async function main() {
  await run('pnpm', ['exec', 'astro', 'dev', 'stop']).catch(() => {})

  console.log(`[e2e] starting astro dev on port ${PORT} (BASE_PATH=/)...`)
  await run('pnpm', ['exec', 'astro', 'dev', '--background', '--port', PORT], {
    env: { ...process.env, BASE_PATH: '/' },
  })

  if (!(await waitUntilUp())) {
    console.error(`[e2e] dev server never became ready on ${URL}`)
    process.exitCode = 1
    return
  }

  try {
    await run('pnpm', ['exec', 'playwright', 'test'])
  } finally {
    console.log('[e2e] stopping the dev server...')
    await run('pnpm', ['exec', 'astro', 'dev', 'stop']).catch(() => {})
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
