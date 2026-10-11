import { delimiter } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findOidcSkip, parseStaged, pathWithoutSafeChain } from './release.mjs'

describe('pathWithoutSafeChain', () => {
  it('drops the safe-chain shims directory from PATH', () => {
    const path = ['/root/.safe-chain/shims', '/home/runner/setup-pnpm/node_modules/.bin', '/usr/bin'].join(delimiter)

    expect(pathWithoutSafeChain(path)).toBe(['/home/runner/setup-pnpm/node_modules/.bin', '/usr/bin'].join(delimiter))
  })

  it('leaves an unrelated PATH untouched', () => {
    const path = ['/usr/local/bin', '/usr/bin'].join(delimiter)

    expect(pathWithoutSafeChain(path)).toBe(path)
  })

  it('returns an empty string when PATH is unset', () => {
    expect(pathWithoutSafeChain(undefined)).toBe('')
  })
})

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
  // pnpm pretty-prints its --json payload.
  const pretty = (value) => JSON.stringify(value, null, 2)

  it('returns name/version pairs from the object pnpm keys by package name', () => {
    const output = pretty({
      '@kubb/core': { id: '@kubb/core@5.0.0-beta.81', name: '@kubb/core', version: '5.0.0-beta.81' },
      kubb: { id: 'kubb@5.0.0-beta.81', name: 'kubb', version: '5.0.0-beta.81' },
    })

    expect(parseStaged(output)).toStrictEqual([
      { name: '@kubb/core', version: '5.0.0-beta.81' },
      { name: 'kubb', version: '5.0.0-beta.81' },
    ])
  })

  it('returns name/version pairs from a JSON array payload', () => {
    const output = pretty([
      { name: '@kubb/core', version: '5.0.0-beta.81' },
      { name: 'kubb', version: '5.0.0-beta.81' },
    ])

    expect(parseStaged(output)).toStrictEqual([
      { name: '@kubb/core', version: '5.0.0-beta.81' },
      { name: 'kubb', version: '5.0.0-beta.81' },
    ])
  })

  it('drops JSON entries missing a name or version', () => {
    const output = pretty([{ name: '@kubb/core', version: '5.0.0-beta.81' }, { name: 'kubb' }, { version: '1.0.0' }])

    expect(parseStaged(output)).toStrictEqual([{ name: '@kubb/core', version: '5.0.0-beta.81' }])
  })

  it('skips the progress lines pnpm prints before the JSON payload', () => {
    const output = [
      '📦 @kubb/core@5.0.0 → https://registry.npmjs.org/',
      '[WARN] Skip staging @kubb/core@5.0.0 (dry run)',
      pretty({ '@kubb/core': { name: '@kubb/core', version: '5.0.0' } }),
    ].join('\n')

    expect(parseStaged(output)).toStrictEqual([{ name: '@kubb/core', version: '5.0.0' }])
  })

  it('ignores notice lines that follow the JSON payload', () => {
    const output = [
      pretty({
        '@kubb/core': { name: '@kubb/core', version: '5.0.0' },
        kubb: { name: 'kubb', version: '5.0.0' },
      }),
      'ℹ Safe-chain: Some package versions were suppressed during package metadata resolution due to minimum package age.',
      '[WARN] Failed to replace env in config: ${NODE_AUTH_TOKEN}',
    ].join('\n')

    expect(parseStaged(output)).toStrictEqual([
      { name: '@kubb/core', version: '5.0.0' },
      { name: 'kubb', version: '5.0.0' },
    ])
  })

  it('reads past a closing brace inside a packed file path', () => {
    const output = pretty({
      '@kubb/core': { name: '@kubb/core', version: '5.0.0', files: [{ path: 'dist/[...slug}].js' }] },
      kubb: { name: 'kubb', version: '5.0.0', files: [{ path: 'package.json' }] },
    })

    expect(parseStaged(output)).toStrictEqual([
      { name: '@kubb/core', version: '5.0.0' },
      { name: 'kubb', version: '5.0.0' },
    ])
  })

  it('returns an empty array when nothing was staged', () => {
    expect(parseStaged('No packages to publish')).toStrictEqual([])
  })
})
