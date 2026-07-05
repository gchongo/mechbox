import { describe, it, expect, beforeEach, beforeAll } from 'vitest'

function makeMemoryStorage() {
  const store = new Map()
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  }
}

beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = makeMemoryStorage()
  }
})

import {
  getThreadFavorites,
  toggleThreadFavorite,
  isThreadFavorite,
  removeThreadFavorite,
} from '@/utils/thread-favorites'

describe('thread favorites', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles favorite row ids', () => {
    expect(toggleThreadFavorite('metric-M10')).toBe(true)
    expect(isThreadFavorite('metric-M10')).toBe(true)
    expect(getThreadFavorites()).toEqual(['metric-M10'])
    expect(toggleThreadFavorite('metric-M10')).toBe(false)
    expect(getThreadFavorites()).toEqual([])
  })

  it('keeps newest first and caps list', () => {
    for (let i = 0; i < 35; i += 1) {
      toggleThreadFavorite(`id-${i}`)
    }
    expect(getThreadFavorites().length).toBeLessThanOrEqual(30)
    expect(getThreadFavorites()[0]).toBe('id-34')
  })

  it('remove favorite', () => {
    toggleThreadFavorite('a')
    removeThreadFavorite('a')
    expect(isThreadFavorite('a')).toBe(false)
  })
})
