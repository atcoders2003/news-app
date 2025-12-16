import axios from 'axios'
import { idbGet, idbSet } from '../utils/idb'

const KEY = import.meta.env.VITE_NEWSAPI_KEY
const PROXY_URL = import.meta.env.VITE_PROXY_URL || '/api/news'

export function uniqByUrl(items) {
  const seen = new Set()
  const out = []
  for (const it of items) {
    if (!it || !it.url) continue
    if (seen.has(it.url)) continue
    seen.add(it.url)
    out.push(it)
  }
  return out
}

// Local cache policy
const LOCAL_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const REFRESH_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

function makeKey(topics = [], country = '', pageSize = 10) {
  return `articles:${topics.join(',')}:${country}:${pageSize}`
}

async function fetchViaProxy(topics = [], country = '', pageSize = 10) {
  const resp = await axios.post(PROXY_URL, { topics, country, pageSize })
  return resp.data?.articles || []
}

async function fetchDirect(topics = [], country = '', pageSize = 10) {
  if (!KEY) throw new Error('VITE_NEWSAPI_KEY not set')
  const BASE = 'https://newsapi.org/v2'
  const requests = topics.map(topic => {
    const params = new URLSearchParams()
    if (topic) params.set('q', topic)
    if (country) params.set('country', country)
    params.set('pageSize', String(pageSize))
    return axios.get(`${BASE}/top-headlines?${params.toString()}`, {
      headers: { 'X-Api-Key': KEY }
    }).then(r => r.data.articles || []).catch(err => { console.warn('newsapi err', err); return [] })
  })
  const results = await Promise.all(requests)
  return results.flat()
}

function filterAndSortRecent(articles = [], maxAgeMs) {
  const now = Date.now()
  const filtered = (articles || []).filter(a => {
    if (!a || !a.publishedAt) return false
    const t = new Date(a.publishedAt).getTime()
    if (!Number.isFinite(t)) return false
    return (now - t) <= maxAgeMs
  })
  filtered.sort((a, b) => {
    const ta = new Date(a.publishedAt).getTime() || 0
    const tb = new Date(b.publishedAt).getTime() || 0
    return tb - ta
  })
  return filtered
}

// Public: fetch articles for topics with local cache; returns cached quickly and refreshes in background
export async function fetchArticlesForTopics(topics = [], country = '', opts = {}) {
  const pageSize = opts?.pageSize ?? 10
  const maxAgeDays = opts?.maxAgeDays ?? 3
  const maxAgeMs = Math.max(1, Number(maxAgeDays)) * 24 * 60 * 60 * 1000
  const key = `${makeKey(topics, country, pageSize)}:ageDays=${maxAgeDays}`
  try {
    const cached = await idbGet(key)
    const now = Date.now()
    if (cached && cached.ts && (now - cached.ts) < LOCAL_TTL_MS) {
      // Return cached results immediately
      // If cache is older than REFRESH_INTERVAL_MS, refresh in background
      if ((now - cached.ts) > REFRESH_INTERVAL_MS) {
        ;(async () => {
          try {
            let articles = []
            try { articles = await fetchViaProxy(topics, country, pageSize) } catch { articles = await fetchDirect(topics, country, pageSize) }
            const merged = uniqByUrl(articles)
            await idbSet(key, { ts: Date.now(), articles: merged })
          } catch (e) { console.warn('background refresh failed', e) }
        })()
      }
      return filterAndSortRecent(uniqByUrl(cached.articles || []), maxAgeMs)
    }

    // No cache or expired: fetch now (prefer proxy)
    let articles = []
    try { articles = await fetchViaProxy(topics, country, pageSize) } catch (err) {
      console.warn('proxy fetch failed, falling back to direct', err?.message)
      articles = await fetchDirect(topics, country, pageSize)
    }
    const merged = uniqByUrl(articles)
    const fresh = filterAndSortRecent(merged, maxAgeMs)
    await idbSet(key, { ts: Date.now(), articles: fresh })
    return fresh
  } catch (err) {
    console.warn('fetchArticlesForTopics error', err)
    // Last-resort: return empty list
    return []
  }
}
