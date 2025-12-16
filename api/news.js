import axios from 'axios'

// Simple in-memory cache for example (replace with Redis or persistent cache in production)
const cache = new Map()
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

const NEWSAPI_KEY = process.env.NEWSAPI_KEY || process.env.VITE_NEWSAPI_KEY
const BASE = 'https://newsapi.org/v2'

function makeCacheKey(topics = [], country = '', pageSize = 10) {
  return `news:${topics.join(',')}:${country}:${pageSize}`
}

async function fetchFromNewsAPI(topics = [], country = '', pageSize = 10) {
  const requests = topics.map(topic => {
    const params = new URLSearchParams()
    if (topic) params.set('q', topic)
    if (country) params.set('country', country)
    params.set('pageSize', String(pageSize))
    return axios.get(`${BASE}/top-headlines?${params.toString()}`, {
      headers: { 'X-Api-Key': NEWSAPI_KEY }
    }).then(r => r.data.articles || [])
  })

  const results = await Promise.all(requests)
  const merged = results.flat()
  // dedupe by url
  const seen = new Set()
  const out = []
  for (const a of merged) {
    if (!a || !a.url) continue
    if (seen.has(a.url)) continue
    seen.add(a.url)
    out.push(a)
  }
  return out
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { topics = [], country = '', pageSize = 10 } = req.body || {}
    if (!Array.isArray(topics)) return res.status(400).json({ error: 'topics must be array' })

    const key = makeCacheKey(topics, country, pageSize)
    const now = Date.now()
    const cached = cache.get(key)
    if (cached && (now - cached.ts) < CACHE_TTL_MS) {
      return res.json({ articles: cached.articles, source: 'cache', cachedAt: new Date(cached.ts).toISOString() })
    }

    if (!NEWSAPI_KEY) return res.status(500).json({ error: 'NewsAPI key not configured' })

    try {
      const articles = await fetchFromNewsAPI(topics, country, pageSize)
      cache.set(key, { ts: now, articles })
      return res.json({ articles, source: 'newsapi', cachedAt: new Date(now).toISOString() })
    } catch (err) {
      if (err.response && err.response.status === 426) {
        // NewsAPI may return rate-limit or upgrade required; handle generically
      }
      // On error, if we have stale cache, return it with a warning
      if (cached) {
        return res.status(200).json({ articles: cached.articles, source: 'stale-cache', cachedAt: new Date(cached.ts).toISOString(), warning: 'Using stale cache due to upstream error' })
      }
      console.error('proxy error', err.toString())
      return res.status(502).json({ error: 'upstream error' })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal' })
  }
}
