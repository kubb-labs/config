#!/usr/bin/env node
import { appendFileSync } from 'node:fs'

const RETRY_ATTEMPTS = 10
const RETRY_DELAY_MS = 300_000

// The registry takes a scoped name with its slash escaped (`@kubb%2fcore`),
// the same way npm requests it. A network error counts as not live yet.
async function isLiveOnRegistry(pkg) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${pkg.name.replace('/', '%2f')}/${pkg.version}`)
    return res.ok
  } catch {
    return false
  }
}

// A green environment review only means a maintainer clicked approve, not
// that they actually ran `npm stage approve`. Retrying absorbs registry
// propagation lag right after a real approval; giving up after all attempts
// means the version genuinely isn't live yet.
export async function verifyPackage({ pkg, attempts = RETRY_ATTEMPTS, delayMs = RETRY_DELAY_MS }) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (await isLiveOnRegistry(pkg)) return true

    if (attempt < attempts) {
      process.stdout.write(`${pkg.name}@${pkg.version} not live yet (attempt ${attempt}/${attempts}), retrying in ${delayMs / 1_000}s ...\n`)
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }

  return false
}

async function main() {
  const staged = JSON.parse(process.env.STAGED_PACKAGES || '[]')
  if (staged.length === 0) {
    console.error('STAGED_PACKAGES is empty. The promote job only runs when release staged something, so this should never happen.')
    process.exit(1)
  }

  // Each package's retries run independently, so verifying them concurrently
  // instead of one after another keeps the total wait close to the slowest
  // single package's retry budget, not the sum across every staged package.
  const results = await Promise.all(
    staged.map(async (pkg) => {
      process.stdout.write(`Checking ${pkg.name}@${pkg.version} ...\n`)
      const live = await verifyPackage({ pkg })
      return { pkg, live }
    }),
  )

  const missing = results.filter((result) => !result.live)
  if (missing.length > 0) {
    const waitedSeconds = ((RETRY_ATTEMPTS - 1) * RETRY_DELAY_MS) / 1_000
    for (const { pkg } of missing) {
      console.error(
        `${pkg.name}@${pkg.version} isn't live on npm yet after ${RETRY_ATTEMPTS} attempts over ${waitedSeconds}s. Confirm npm stage approve was run for this exact version, or that the staged version hasn't expired.`,
      )
    }
    process.exit(1)
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, 'approved=true\n')
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
