import React, { useEffect, useMemo, useRef, useState } from 'react'

function formatWhen(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d)
}

function Card({ article, onOpen }) {
  const when = useMemo(() => formatWhen(article?.publishedAt), [article?.publishedAt])
  const subtitle = article?.description || article?.content || ''

  return (
    <article className="card" onDoubleClick={() => onOpen(article)}>
      {article?.urlToImage ? (
        <div className="card-media" aria-hidden="true">
          <img className="card-img" src={article.urlToImage} alt="" loading="lazy" />
        </div>
      ) : null}

      <div className="card-body">
        <h3 className="card-title">{article.title}</h3>
        {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
        <div className="card-meta">
          <span className="card-source">{article.source?.name || 'Unknown source'}</span>
          {when ? <span className="card-dot">•</span> : null}
          {when ? <time dateTime={article.publishedAt}>{when}</time> : null}
        </div>
      </div>
    </article>
  )
}

export default function CardFeed({ articles = [] }) {
  const [idx, setIdx] = useState(0)
  const current = articles[idx]
  const [touchStartX, setTouchStartX] = useState(null)
  const stageRef = useRef(null)

  function next() { setIdx(i => Math.min(i + 1, articles.length - 1)) }
  function prev() { setIdx(i => Math.max(i - 1, 0)) }
  function open(a) { if (!a || !a.url) return; window.open(a.url, '_blank') }

  useEffect(() => {
    setIdx(0)
  }, [articles.length])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [articles.length])

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

  if (!articles.length) return <p className="muted">No articles</p>

  return (
    <div className="feed">
      <div className="feed-top">
        <div className="feed-count">{idx + 1} / {articles.length}</div>
      </div>

      {current && (
        <div
          ref={stageRef}
          className="feed-stage"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onTouchStart}
          onMouseUp={onTouchEnd}
          onClick={(e) => {
            // Desktop-friendly navigation without visible arrows.
            const el = stageRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const x = e.clientX - rect.left
            if (x < rect.width * 0.4) prev()
            else if (x > rect.width * 0.6) next()
          }}
        >
          <Card article={current} onOpen={open} />
        </div>
      )}
    </div>
  )
}
