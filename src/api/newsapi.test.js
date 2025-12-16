import { uniqByUrl } from './newsapi'
import { describe, it, expect } from 'vitest'

describe('uniqByUrl', () => {
  it('removes duplicates by url', () => {
    const items = [
      { url: 'a', title: 'one' },
      { url: 'b', title: 'two' },
      { url: 'a', title: 'one-dup' },
      { url: null, title: 'no-url' }
    ]
    const out = uniqByUrl(items)
    expect(out.length).toBe(2)
    expect(out.find(x => x.url === 'a').title).toBe('one')
  })
})
