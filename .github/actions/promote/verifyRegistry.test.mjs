import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifyPackage } from './verifyRegistry.mjs'

const pkg = { name: '@kubb/core', version: '5.0.0-beta.81' }

function mockFetch(responses) {
  const fetch = vi.fn()
  for (const response of responses) {
    response instanceof Error ? fetch.mockRejectedValueOnce(response) : fetch.mockResolvedValueOnce(response)
  }
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const live = { ok: true }
const missing = { ok: false }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('verifyPackage', () => {
  it('returns true when the version is live on the first attempt', async () => {
    const fetch = mockFetch([live])

    await expect(verifyPackage({ pkg, attempts: 3, delayMs: 0 })).resolves.toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('requests the version with the scoped name escaped', async () => {
    const fetch = mockFetch([live])

    await verifyPackage({ pkg, attempts: 1, delayMs: 0 })
    expect(fetch).toHaveBeenCalledWith('https://registry.npmjs.org/@kubb%2fcore/5.0.0-beta.81')
  })

  it('retries until the version shows up on the registry', async () => {
    const fetch = mockFetch([missing, new TypeError('fetch failed'), live])

    await expect(verifyPackage({ pkg, attempts: 5, delayMs: 0 })).resolves.toBe(true)
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('returns false after exhausting every attempt', async () => {
    const fetch = mockFetch([missing, missing])

    await expect(verifyPackage({ pkg, attempts: 2, delayMs: 0 })).resolves.toBe(false)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
