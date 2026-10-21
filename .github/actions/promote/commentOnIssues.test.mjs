import { describe, expect, it } from 'vitest'
import { buildComment, collectReleases, previousTag } from './commentOnIssues.mjs'

describe('collectReleases', () => {
  it('walks only the flagship tag in combined mode', () => {
    const staged = [
      { name: '@kubb/core', version: '5.11.6' },
      { name: 'kubb', version: '5.11.6' },
    ]
    expect(collectReleases({ staged, releaseMode: 'combined' })).toEqual([{ name: 'kubb', tag: 'kubb@5.11.6', label: 'v5.11.6' }])
  })

  it('walks every package in per-package mode', () => {
    const staged = [{ name: '@kubb/plugin-swr', version: '5.4.4' }]
    expect(collectReleases({ staged, releaseMode: '' })).toEqual([{ name: '@kubb/plugin-swr', tag: '@kubb/plugin-swr@5.4.4', label: '@kubb/plugin-swr@5.4.4' }])
  })
})

describe('previousTag', () => {
  const tags = ['kubb@5.11.6', 'kubb@5.11.5', 'kubb@5.11.4']

  it('returns the tag released before the given one', () => {
    expect(previousTag({ tags, tag: 'kubb@5.11.5' })).toBe('kubb@5.11.4')
  })

  it('returns null on the first release or an unknown tag', () => {
    expect(previousTag({ tags, tag: 'kubb@5.11.4' })).toBeNull()
    expect(previousTag({ tags, tag: 'kubb@9.9.9' })).toBeNull()
  })
})

describe('buildComment', () => {
  it('links every release the number shipped in', () => {
    const releases = [
      { tag: '@kubb/plugin-axios@5.7.0', label: '@kubb/plugin-axios@5.7.0' },
      { tag: '@kubb/plugin-fetch@5.7.0', label: '@kubb/plugin-fetch@5.7.0' },
    ]
    expect(buildComment({ releases, repo: 'kubb-labs/plugins' })).toBe(
      'Released in [@kubb/plugin-axios@5.7.0](https://github.com/kubb-labs/plugins/releases/tag/%40kubb%2Fplugin-axios%405.7.0), [@kubb/plugin-fetch@5.7.0](https://github.com/kubb-labs/plugins/releases/tag/%40kubb%2Fplugin-fetch%405.7.0) 🎉',
    )
  })
})
