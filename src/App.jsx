import React, { useEffect, useState } from 'react'
import Welcome from './components/Welcome'
import CardFeed from './components/CardFeed'
import { fetchArticlesForTopics, uniqByUrl } from './api/newsapi'

const ALL_TOPICS = ['business','entertainment','general','health','science','sports','technology']

export default function App() {
  const [topics, setTopics] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('prefs.topics')) || ['technology', 'business']
    } catch { return ['technology', 'business'] }
  })
  const [country, setCountry] = useState(() => localStorage.getItem('prefs.country') || '')
  const [mode, setMode] = useState(() => (localStorage.getItem('prefs.onboarded') ? 'feed' : 'welcome'))
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (mode !== 'feed') return

    async function load() {
      setLoading(true)
      try {
        const preferred = Array.isArray(topics) && topics.length ? topics : ['general']
        const otherTopics = ALL_TOPICS.filter(t => !preferred.includes(t))

        // 1) preferred first
        const preferredArticles = await fetchArticlesForTopics(preferred, country, { pageSize: 10 })
        setArticles(preferredArticles)

        // 2) then fetch the remaining topics in the background (smaller pageSize)
        if (otherTopics.length) {
          setLoadingMore(true)
          ;(async () => {
            try {
              const more = await fetchArticlesForTopics(otherTopics, country, { pageSize: 4 })
              setArticles(prev => uniqByUrl([...(prev || []), ...(more || [])]))
            } catch (e) {
              console.warn('fetch more topics failed', e)
            } finally {
              setLoadingMore(false)
            }
          })()
        }
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
    load()
  }, [topics, country, mode])

  function persistPrefs(newTopics, newCountry) {
    setTopics(newTopics)
    setCountry(newCountry)
    localStorage.setItem('prefs.topics', JSON.stringify(newTopics))
    localStorage.setItem('prefs.country', newCountry || '')
    localStorage.setItem('prefs.onboarded', '1')
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">
          <div className="brand-title">News</div>
          <div className="brand-subtitle">Swipe-first headlines</div>
        </div>

        <button type="button" className="btn btn--ghost" onClick={() => setMode('welcome')}>
          Topics
        </button>
      </header>
      <main>
        {mode === 'welcome' ? (
          <Welcome
            allTopics={ALL_TOPICS}
            initialTopics={topics}
            initialCountry={country}
            title={localStorage.getItem('prefs.onboarded') ? 'Update your topics' : 'Welcome'}
            subtitle={localStorage.getItem('prefs.onboarded')
              ? 'Pick your preferred topics. We’ll show them first.'
              : 'Pick your preferred topics. We’ll show them first.'}
            onContinue={(newTopics, newCountry) => {
              persistPrefs(newTopics.length ? newTopics : ['general'], newCountry)
              setMode('feed')
            }}
            onSkip={(newCountry) => {
              persistPrefs(['general'], newCountry)
              setMode('feed')
            }}
          />
        ) : (
          <>
            {loading ? <p className="muted">Loading your topics…</p> : <CardFeed articles={articles} />}
            {loadingMore && !loading ? <p className="muted">Loading more topics…</p> : null}
          </>
        )}
      </main>
    </div>
  )
}
