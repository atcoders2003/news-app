import React, { useState } from 'react'

function Card({ article, onOpen }) {
  return (
    <div className="card" onDoubleClick={() => onOpen(article)}>
      <h3>{article.title}</h3>
      <p>{article.description}</p>
      <small>{article.source?.name} • {new Date(article.publishedAt).toLocaleString()}</small>
    </div>
  )
}

export default function CardFeed({ articles = [] }) {
  const [idx, setIdx] = useState(0)
  const current = articles[idx]
  const [touchStartX, setTouchStartX] = useState(null)

  function next() { setIdx(i => Math.min(i + 1, articles.length - 1)) }
  function prev() { setIdx(i => Math.max(i - 1, 0)) }
  function open(a) { if (!a || !a.url) return; window.open(a.url, '_blank') }

  function onTouchStart(e) {
    setTouchStartX(e.touches ? e.touches[0].clientX : e.clientX)
  }

  function onTouchEnd(e) {
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    if (touchStartX == null) return
    const dx = endX - touchStartX
    if (Math.abs(dx) > 50) {
      if (dx < 0) next()
      else prev()
    }
    setTouchStartX(null)
  }

  if (!articles.length) return <p>No articles</p>

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="feed-controls">
          <button onClick={prev} aria-label="previous">◀</button>
          <button onClick={next} aria-label="next">▶</button>
        </div>
        <div>{idx + 1} / {articles.length}</div>
      </div>
      {current && (
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onTouchStart} onMouseUp={onTouchEnd}>
          <Card article={current} onOpen={open} />
        </div>
      )}
    </div>
  )
}
