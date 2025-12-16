import React, { useEffect, useState } from 'react'
import Preferences from './components/Preferences'
import CardFeed from './components/CardFeed'
import { fetchArticlesForTopics } from './api/newsapi'

export default function App() {
  const [topics, setTopics] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('prefs.topics')) || ['technology', 'business']
    } catch { return ['technology', 'business'] }
  })
  const [country, setCountry] = useState(() => localStorage.getItem('prefs.country') || '')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetchArticlesForTopics(topics, country)
        setArticles(res)
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
    load()
  }, [topics, country])

  function handlePrefsChange(newTopics, newCountry) {
    setTopics(newTopics)
    setCountry(newCountry)
    localStorage.setItem('prefs.topics', JSON.stringify(newTopics))
    localStorage.setItem('prefs.country', newCountry)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>News App</h1>
        <Preferences topics={topics} country={country} onChange={handlePrefsChange} />
      </header>
      <main>
        {loading ? <p>Loading...</p> : <CardFeed articles={articles} />}
      </main>
    </div>
  )
}
