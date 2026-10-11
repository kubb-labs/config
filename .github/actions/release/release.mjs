#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'

// safe-chain (installed by the shared `setup` action) shims `pnpm` on PATH
// and proxies every registry.npmjs.org call. It has no OIDC awareness and
// breaks the one POST this pipeline makes, the id-token exchange, before any
// HTTP response comes back. `pnpm install` earlier in the job still runs
// through the shim and stays protected. Only this publish call skips it.
export function pathWithoutSafeChain(pathValue, platform = process.platform) {
  const separator = platform === 'win32' ? ';' : ':'
  const entries = (pathValue ?? '').split(separator).filter((entry) => !entry.includes('.safe-chain'))
  return entries.join(separator)
}

function readPreTag() {
  try {
    return JSON.parse(readFileSync('.changeset/pre.json', 'utf8')).tag ?? null
  } catch {
    return null
  }
}

// pnpm warns `Skipped OIDC: <reason>` when it cannot trade the GitHub id token
// for an npm auth token, then falls back to whatever static credentials it can
// find. This pipeline has none on purpose, so that fallback publishes
// anonymously and npm answers 401 — burying the real cause under an auth error
// that looks like a missing NPM_TOKEN. Catch the warning and report it instead.
export function findOidcSkip(output) {
  const match = output.match(/Skipped OIDC:\s*(.+)/)
  return match ? match[1].trim() : null
}

// Parse `pnpm stage publish --json` output into [{ name, version }]. pnpm
// prints progress lines (`📦 <name>@<version> → <registry>`, `[WARN] ...`)
// before the payload, and safe-chain or npm config notices can follow it. The
// payload is pretty-printed, so its outer brackets are the only ones alone on
// a line. pnpm prints an object keyed by package name; Object.values also
// takes a bare array.
export function parseStaged(output) {
  const json = output.match(/^\{$[\s\S]*^\}$|^\[$[\s\S]*^\]$/m)?.[0]
  if (!json) return []

  try {
    return Object.values(JSON.parse(json))
      .filter((entry) => entry?.name && entry?.version)
      .map(({ name, version }) => ({ name, version }))
  } catch {
    return []
  }
}

function main() {
  // Trusted publishing is the only credential this pipeline has. Without the
  // id-token endpoint pnpm cannot even start the exchange, and every package
  // would fail one by one on a 401 several minutes from now.
  if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
    console.error('No OIDC id token available. Give the release job `permissions: id-token: write`.')
    process.exit(1)
  }

  const tag = readPreTag()
  const stageArgs = ['stage', 'publish', '-r', '--no-git-checks', '--access', 'public', '--json']
  if (tag) stageArgs.push('--tag', tag)

  const result = spawnSync('pnpm', stageArgs, {
    encoding: 'utf8',
    env: { ...process.env, PATH: pathWithoutSafeChain(process.env.PATH) },
  })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  const oidcSkip = findOidcSkip(`${result.stdout ?? ''}\n${result.stderr ?? ''}`)
  if (oidcSkip) {
    console.error(`pnpm could not exchange the GitHub id token for an npm token: ${oidcSkip}`)
    console.error('Nothing was staged. Any 401 above is the anonymous fallback, not the cause.')
    console.error('Check that the package has a trusted publisher on npm for this repo and workflow, and that pnpm can reach the registry.')
    process.exit(1)
  }

  if (result.status !== 0) process.exit(result.status ?? 1)
  const output = result.stdout ?? ''
  const staged = parseStaged(output)

  // Tags aren't created here. A staged package may still be rejected on npm,
  // and changesets/changesets#2025 specifically warns against tagging at
  // stage time for that reason. The `promote` action creates and pushes tags
  // itself, after confirming the versions are actually live.
  //
  // Only signal a stage to the workflow if pnpm actually published something.
  // When everything was skipped (versions already on npm), let the canary step
  // fire instead — that's the intent for ordinary main pushes.
  if (staged.length > 0 && process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, 'staged=true\n')
    appendFileSync(process.env.GITHUB_OUTPUT, `staged_packages=${JSON.stringify(staged)}\n`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
