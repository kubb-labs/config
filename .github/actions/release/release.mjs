#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'

function readPreTag() {
  try {
    return JSON.parse(readFileSync('.changeset/pre.json', 'utf8')).tag ?? null
  } catch {
    return null
  }
}

// Parse pnpm stage publish output into [{ name, version }]. Prefers the --json
// payload, in whichever shape it comes in (a bare array, or an object keyed by
// package name, both observed across pnpm/npm staged-publish responses), then
// falls back to scanning text output for `+ <name>@<version>` lines.
// pnpm's --json payload can be preceded or followed by unrelated banner lines (safe-chain
// notices, npm config warnings like "${NODE_AUTH_TOKEN}") sharing the same stdout stream. A
// naive first/last bracket slice breaks on stray braces in that banner text, so walk the
// bracket balance from the first `{`/`[` to find where the JSON value actually closes.
function extractJson(output) {
  const start = output.search(/[[{]/)
  if (start === -1) return output

  const open = output[start]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  for (let i = start; i < output.length; i++) {
    if (output[i] === open) depth++
    else if (output[i] === close) {
      depth--
      if (depth === 0) return output.slice(start, i + 1)
    }
  }
  return output
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

export function parseStaged(output) {
  try {
    const parsed = JSON.parse(extractJson(output))
    const entries = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object'
        ? Object.entries(parsed).map(([key, value]) => ({ name: value?.name ?? value?.packageName ?? key, version: value?.version }))
        : null

    if (entries) {
      return entries.filter((entry) => entry?.name && entry?.version).map((entry) => ({ name: entry.name, version: entry.version }))
    }
  } catch {}

  const found = []
  for (const line of output.split('\n')) {
    const match = line.match(/^\+\s+(@?[^\s@]+)@(\S+)/)
    if (match) found.push({ name: match[1], version: match[2] })
  }
  return found
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

  const result = spawnSync('pnpm', stageArgs, { encoding: 'utf8' })
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
