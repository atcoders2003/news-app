import React, { useState } from 'react'

const ALL_TOPICS = ['business','entertainment','general','health','science','sports','technology']

export default function Preferences({ topics = [], country = '', onChange }) {
  const [sel, setSel] = useState(topics)
  const [c, setC] = useState(country)

  function toggle(t) {
    setSel(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  return (
    <div>
      <details>
        <summary>Preferences</summary>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
          <div>
            <strong>Topics</strong>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
              {ALL_TOPICS.map(t => (
                <label key={t} style={{cursor:'pointer'}}>
                  <input type="checkbox" checked={sel.includes(t)} onChange={() => toggle(t)} /> {t}
                </label>
              ))}
            </div>
          </div>
          <div>
            <strong>Country (ISO2)</strong>
            <input value={c} onChange={e => setC(e.target.value)} placeholder="us" style={{marginLeft:8}} />
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => onChange(sel.length ? sel : ['general'], c)}>Save</button>
            <button onClick={() => { setSel(['technology']); setC('') }}>Reset</button>
          </div>
        </div>
      </details>
    </div>
  )
}
