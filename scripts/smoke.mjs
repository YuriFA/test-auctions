/**
 * One-shot smoke runner: starts `vite dev` in the background, waits until it is
 * ready, runs every `scripts/*-smoke.mjs`, then shuts the dev server down.
 *
 * MSW-node smokes run first (they don't need the dev server); browser smokes
 * run after. Any failure aborts the run and the dev server is still torn down
 * via the `finally` block.
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const PORT = process.env.SMOKE_PORT ?? '5175'
const BASE = process.env.SMOKE_BASE ?? `http://localhost:${PORT}`
const DEV_READY_TIMEOUT_MS = 30_000

const MSW_NODE_SMOKES = [
  ['smoke:msw:list', 'scripts/msw-list-smoke.mjs'],
  ['smoke:msw:detail', 'scripts/msw-detail-smoke.mjs'],
  ['smoke:msw:bets', 'scripts/msw-bets-smoke.mjs'],
  ['smoke:msw:set-bet', 'scripts/msw-set-bet-smoke.mjs'],
]

const BROWSER_SMOKES = [
  ['smoke:list', 'scripts/list-page-smoke.mjs'],
  ['smoke:route', 'scripts/route-smoke.mjs'],
  ['smoke:msw-browser', 'scripts/msw-browser-smoke.mjs'],
]

function run(cmd, args, env) {
  const p = spawn(cmd, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  })
  return new Promise((resolve, reject) => {
    p.on('error', reject)
    p.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))
      }
    })
  })
}

async function waitForDev() {
  const deadline = Date.now() + DEV_READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE)
      if (res.status < 500) {
        return
      }
    } catch {
      // dev not up yet
    }
    await sleep(300)
  }
  throw new Error(`dev server did not become ready at ${BASE} within ${DEV_READY_TIMEOUT_MS}ms`)
}

async function main() {
  console.log(`▶ starting vite dev on :${PORT} …`)
  const vite = spawn('pnpm', ['exec', 'vite', '--port', PORT, '--strictPort'], {
    stdio: 'inherit',
    env: process.env,
  })
  vite.on('error', (err) => {
    throw err
  })

  try {
    await waitForDev()
    console.log(`✓ dev ready at ${BASE}\n`)

    for (const [label, file] of MSW_NODE_SMOKES) {
      console.log(`\n=== ${label} ===`)
      await run('pnpm', ['exec', 'tsx', file], { SMOKE_BASE: BASE })
    }

    for (const [label, file] of BROWSER_SMOKES) {
      console.log(`\n=== ${label} ===`)
      await run('node', [file], { SMOKE_BASE: BASE })
    }

    console.log('\n✓ all smoke scripts passed')
  } finally {
    console.log('\n shutting down dev server …')
    vite.kill('SIGTERM')
    await new Promise((resolve) => {
      vite.once('exit', resolve)
    })
  }
}

main().catch((err) => {
  console.error(`\n✗ smoke run failed: ${err.message}`)
  process.exit(1)
})
