#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

// Combined mode has one release for the whole version (see createReleases.mjs),
// so only the flagship tag's commit range is walked.
export function collectReleases({ staged, releaseMode }) {
  if (releaseMode === 'combined') {
    const flagship = staged.find((pkg) => pkg.name === 'kubb') ?? staged[0]
    return [{ name: flagship.name, tag: `${flagship.name}@${flagship.version}`, label: `v${flagship.version}` }]
  }
  return staged.map((pkg) => ({ name: pkg.name, tag: `${pkg.name}@${pkg.version}`, label: `${pkg.name}@${pkg.version}` }))
}

// `tags` is newest first, so the previous release is the entry after `tag`.
// Null on the first release of a package: there is no range to walk yet.
export function previousTag({ tags, tag }) {
  const index = tags.indexOf(tag)
  return index === -1 ? null : (tags[index + 1] ?? null)
}

export function buildComment({ releases, repo }) {
  const links = releases.map(({ tag, label }) => `[${label}](https://github.com/${repo}/releases/tag/${encodeURIComponent(tag)})`)
  return `Released in ${links.join(', ')} 🎉`
}

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr)
  return result.stdout.split('\n').filter(Boolean)
}

const PR_QUERY = `query($url: URI!) {
  resource(url: $url) {
    ... on Commit {
      associatedPullRequests(first: 10) {
        nodes { number headRefName closingIssuesReferences(first: 20) { nodes { number } } }
      }
    }
  }
}`

// Returns the PR numbers that produced `sha` plus the issues they close.
// Changesets' own "version packages" PR ships in every release, so it is skipped.
function linkedNumbers({ repo, sha }) {
  const result = spawnSync('gh', ['api', 'graphql', '-f', `query=${PR_QUERY}`, '-f', `url=https://github.com/${repo}/commit/${sha}`], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr)
  const prs = JSON.parse(result.stdout).data.resource?.associatedPullRequests.nodes ?? []
  return prs
    .filter((pr) => !pr.headRefName.startsWith('changeset-release/'))
    .flatMap((pr) => [pr.number, ...pr.closingIssuesReferences.nodes.map((issue) => issue.number)])
}

// shortcut: a promote re-run comments again, dedupe against existing comments if re-runs become common
function main() {
  const staged = JSON.parse(process.env.STAGED_PACKAGES)
  const repo = process.env.GITHUB_REPOSITORY
  const releases = collectReleases({ staged, releaseMode: process.env.RELEASE_MODE })

  const releasesByNumber = new Map()
  for (const release of releases) {
    const tags = git(['tag', '--list', `${release.name}@*`, '--sort=-v:refname'])
    const prev = previousTag({ tags, tag: release.tag })
    if (!prev) {
      console.log(`${release.tag} is the first release of ${release.name}, nothing to comment on.`)
      continue
    }
    for (const sha of git(['log', '--format=%H', `${prev}..${release.tag}`])) {
      for (const number of linkedNumbers({ repo, sha })) {
        releasesByNumber.set(number, [...(releasesByNumber.get(number) ?? []), release])
      }
    }
  }

  for (const [number, linked] of releasesByNumber) {
    const body = buildComment({ releases: [...new Set(linked)], repo })
    const result = spawnSync('gh', ['api', `repos/${repo}/issues/${number}/comments`, '-f', `body=${body}`], { encoding: 'utf8' })
    // A locked issue must not fail a release that already shipped.
    if (result.status !== 0) console.warn(`Could not comment on #${number}: ${result.stderr.trim()}`)
    else console.log(`Commented on #${number}: ${body}`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
