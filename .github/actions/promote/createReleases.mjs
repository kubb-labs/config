#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// The lookahead after the version rejects a longer, hyphen-suffixed version
// sharing the same numeric prefix (e.g. searching for "5.0.0" must not match
// a "## v5.0.0-rc.1" heading), while still matching the exact version
// followed by whitespace, a separator, or end of line.
function versionHeadingPattern(version) {
  return new RegExp(`^##\\s+v?${escapeForRegExp(version)}(?![\\w.-]).*$`, 'm')
}

// Returns the block under a `## v<version>` or `## <version>` heading, up to
// the next `##` heading. Combined mode reads the root CHANGELOG.md that kubb's
// internals/changelog hook writes (same heading format as its format.mjs).
// Per-package mode reads each package's own CHANGELOG.md.
export function extractVersionNotes({ changelog, version }) {
  const versionMatch = versionHeadingPattern(version).exec(changelog)
  if (!versionMatch) return null

  const afterVersion = changelog.slice(versionMatch.index + versionMatch[0].length)
  const nextVersionHeading = /^##\s+/m.exec(afterVersion)
  return (nextVersionHeading ? afterVersion.slice(0, nextVersionHeading.index) : afterVersion).trim()
}

function releaseExists(tag) {
  return spawnSync('gh', ['release', 'view', tag], { encoding: 'utf8' }).status === 0
}

// A re-run of `promote` (e.g. a manual `promote: true` dispatch against a
// version that was already tagged and released) would otherwise fail here:
// `gh release create` errors on a tag that already has a release. Skipping
// cleanly makes promote safe to re-run instead of going red on a re-dispatch.
function createRelease({ tag, title, notes }) {
  if (releaseExists(tag)) {
    console.log(`Release ${tag} already exists, skipping.`)
    return
  }

  const result = spawnSync('gh', ['release', 'create', tag, '--title', title, '--notes', notes], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function fallbackNotes(repo) {
  return `Dependency update only, no direct changes for this package. See [CHANGELOG.md](https://github.com/${repo}/blob/main/CHANGELOG.md) for the full release notes.`
}

function getWorkspacePaths() {
  const result = spawnSync('pnpm', ['ls', '-r', '--json', '--depth', '0'], { encoding: 'utf8' })
  if (result.status !== 0) return {}
  try {
    return Object.fromEntries(JSON.parse(result.stdout).map((pkg) => [pkg.name, pkg.path]))
  } catch {
    return {}
  }
}

function createPerPackageReleases({ staged, repo }) {
  const pkgPaths = getWorkspacePaths()
  for (const pkg of staged) {
    let notes = null
    const pkgPath = pkgPaths[pkg.name]
    if (pkgPath) {
      try {
        notes = extractVersionNotes({ changelog: readFileSync(`${pkgPath}/CHANGELOG.md`, 'utf8'), version: pkg.version })
      } catch {}
    }
    notes ??= fallbackNotes(repo)
    createRelease({ tag: `${pkg.name}@${pkg.version}`, title: `${pkg.name}@${pkg.version}`, notes })
  }
}

// One release for the whole version, tagged with the flagship package's own
// tag (already created by the `changeset git-tag` step) rather than inventing a
// second, parallel tagging scheme.
function createCombinedRelease({ staged, changelog, repo }) {
  const flagship = staged.find((pkg) => pkg.name === 'kubb') ?? staged[0]
  const notes = extractVersionNotes({ changelog, version: flagship.version }) ?? fallbackNotes(repo)
  createRelease({ tag: `${flagship.name}@${flagship.version}`, title: `v${flagship.version}`, notes })
}

// verifyRegistry.mjs runs first in the same action and fails on an empty
// STAGED_PACKAGES, so this always gets at least one package.
function main() {
  const staged = JSON.parse(process.env.STAGED_PACKAGES)
  const repo = process.env.GITHUB_REPOSITORY

  if (process.env.RELEASE_MODE === 'combined') {
    createCombinedRelease({ staged, changelog: readFileSync('CHANGELOG.md', 'utf8'), repo })
  } else {
    createPerPackageReleases({ staged, repo })
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
