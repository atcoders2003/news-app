import React, { useMemo, useState } from 'react'

export default function Welcome({
  allTopics = [],
  initialTopics = [],
  initialCountry = '',
  onContinue,
  onSkip,
  title = 'Welcome',
  subtitle = 'Pick the topics you care about. We’ll show those first.'
}) {
  const [selected, setSelected] = useState(() => (initialTopics?.length ? initialTopics : []))
  const [country, setCountry] = useState(initialCountry || '')

  const canContinue = selected.length > 0

  const pills = useMemo(() => {
    return (allTopics || []).map(t => ({
      topic: t,
      active: selected.includes(t)
    }))
  }, [allTopics, selected])

  function toggle(topic) {
    setSelected(prev => prev.includes(topic) ? prev.filter(x => x !== topic) : [...prev, topic])
  }

  return (
    <div className="welcome">
      <div className="welcome-card">
        <div className="welcome-header">
          <h1 className="welcome-title">{title}</h1>
          <p className="welcome-subtitle">{subtitle}</p>
        </div>

        <div className="pill-grid" role="list">
          {pills.map(({ topic, active }) => (
            <button
              key={topic}
              type="button"
              className={active ? 'pill pill--active' : 'pill'}
              onClick={() => toggle(topic)}
              aria-pressed={active}
            >
              {topic}
            </button>
          ))}
        </div>

        <div className="welcome-row">
          <label className="field">
            <span className="field-label">Country (optional)</span>
            <input
              className="input"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="us"
              inputMode="text"
              autoComplete="country"
              maxLength={2}
            />
          </label>
        </div>

        <div className="welcome-actions">
          <button
            type="button"
            className={canContinue ? 'btn btn--primary' : 'btn btn--primary btn--disabled'}
            onClick={() => canContinue && onContinue(selected, country)}
            disabled={!canContinue}
          >
            Continue
          </button>
          {onSkip ? (
            <button type="button" className="btn btn--ghost" onClick={() => onSkip(country)}>
              Skip
            </button>
          ) : null}
        </div>

        <p className="welcome-footnote">
          Tip: swipe left/right to browse cards. Double-click a card to open the full article.
        </p>
      </div>
    </div>
  )
}
