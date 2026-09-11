import { describe, expect, it } from 'vitest'
import { findOidcSkip, parseStaged } from './release.mjs'

describe('findOidcSkip', () => {
  it('returns the reason pnpm gave for skipping the token exchange', () => {
    const output = [
      'GET https://run-actions-1-azure-eastus.actions.githubusercontent.com/249//idtoken/abc?audience=npm 200 306ms',
      '[WARN] Skipped OIDC: ERR_PNPM_AUTH_TOKEN_FETCH: Failed to fetch authToken for package @kubb/ast from registry https://registry.npmjs.org/: error sending request',
      '📦 @kubb/ast@5.2.1 → https://registry.npmjs.org/',
    ].join('\n')

    expect(findOidcSkip(output)).toBe(
      'ERR_PNPM_AUTH_TOKEN_FETCH: Failed to fetch authToken for package @kubb/ast from registry https://registry.npmjs.org/: error sending request',
    )
  })

  it('returns null when the exchange succeeded', () => {
    expect(findOidcSkip('+ @kubb/core@5.2.1\nDone')).toBeNull()
  })
})

describe('parseStaged', () => {
  it('returns name/version pairs from a JSON array payload', () => {
    const output = JSON.stringify([
      { name: '@kubb/core', version: '5.0.0-beta.81' },
      { name: 'kubb', version: '5.0.0-beta.81' },
    ])

    expect(parseStaged(output)).toStrictEqual([
      { name: '@kubb/core', version: '5.0.0-beta.81' },
      { name: 'kubb', version: '5.0.0-beta.81' },
    ])
  })

  it('drops JSON entries missing a name or version', () => {
    const output = JSON.stringify([{ name: '@kubb/core', version: '5.0.0-beta.81' }, { name: 'kubb' }, { version: '1.0.0' }])

    expect(parseStaged(output)).toStrictEqual([{ name: '@kubb/core', version: '5.0.0-beta.81' }])
  })

  it('returns name/version pairs from a JSON object keyed by package name', () => {
    const output = JSON.stringify({
      '@kubb/core': { name: '@kubb/core', version: '5.0.0-beta.81' },
      kubb: { name: 'kubb', version: '5.0.0-beta.81' },
    })

    expect(parseStaged(output)).toStrictEqual([
      { name: '@kubb/core', version: '5.0.0-beta.81' },
      { name: 'kubb', version: '5.0.0-beta.81' },
    ])
  })

  it('falls back to the object key as the name when an entry has neither a name nor a packageName field', () => {
    const output = JSON.stringify({ '@kubb/core': { version: '5.0.0-beta.81' } })

    expect(parseStaged(output)).toStrictEqual([{ name: '@kubb/core', version: '5.0.0-beta.81' }])
  })

  it('falls back to scanning `+ <name>@<version>` lines when the payload is not JSON', () => {
    const output = ['Packages: +2', '+ @kubb/core@5.0.0-beta.81', '+ kubb@5.0.0-beta.81', 'Done'].join('\n')

    expect(parseStaged(output)).toStrictEqual([
      { name: '@kubb/core', version: '5.0.0-beta.81' },
      { name: 'kubb', version: '5.0.0-beta.81' },
    ])
  })

  it('returns an empty array when nothing was staged', () => {
    expect(parseStaged('No packages to publish')).toStrictEqual([])
  })

  it('ignores banner lines that share stdout with the JSON payload', () => {
    const json = JSON.stringify({
      '@kubb/core': { name: '@kubb/core', version: '5.0.0' },
      kubb: { name: 'kubb', version: '5.0.0' },
    })
    const output = [
      json,
      'ℹ Safe-chain: Some package versions were suppressed during package metadata resolution due to minimum package age.',
      '[WARN] Failed to replace env in config: ${NODE_AUTH_TOKEN}',
    ].join('\n')

    expect(parseStaged(output)).toStrictEqual([
      { name: '@kubb/core', version: '5.0.0' },
      { name: 'kubb', version: '5.0.0' },
    ])
  })
})
