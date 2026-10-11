import { describe, expect, it } from 'vitest'
import { extractVersionNotes } from './createReleases.mjs'

const changelog = `# Changelog

## v5.0.0-beta.80 — Jul 2, 2026

### @kubb/ast

#### Features

- Let a printer node override reuse the handler it replaces.

### @kubb/parser-md

#### Bug Fixes

- Correct the \`parserMd\` JSDoc.

### Contributors

Thanks to everyone who contributed to this release:

[@stijnvanhulle](https://github.com/stijnvanhulle)

## v5.0.0-beta.79 — Jun 30, 2026

### @kubb/cli

#### Bug Fixes

- Cleanup defineLogger
`

describe('extractVersionNotes', () => {
  it('returns the whole version block, covering every package in it', () => {
    const notes = extractVersionNotes({ changelog, version: '5.0.0-beta.80' })

    expect(notes).toContain('### @kubb/ast')
    expect(notes).toContain('### @kubb/parser-md')
    expect(notes).toContain('### Contributors')
    expect(notes).not.toContain('v5.0.0-beta.79')
  })

  it('returns null when the version heading does not exist', () => {
    expect(extractVersionNotes({ changelog, version: '9.9.9' })).toBeNull()
  })

  it('does not match a longer prerelease version sharing the same numeric prefix', () => {
    const withPrerelease = `# Changelog\n\n## v5.0.0-rc.1 — Jul 3, 2026\n\n### @kubb/ast\n\n#### Features\n\n- Something.\n`
    expect(extractVersionNotes({ changelog: withPrerelease, version: '5.0.0' })).toBeNull()
  })
})
