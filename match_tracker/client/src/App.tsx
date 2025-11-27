import React, { useEffect, useMemo, useState } from 'react'
import MatchList from './components/MatchList'
import AdminPanel from './components/AdminPanel'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
const ROLE = import.meta.env.VITE_ROLE || 'user'

export type Match = {
  id: number
  team1: string
  team2: string
  score: string
}

export default function App() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [live, setLive] = useState(false)
  const selected = useMemo(() => matches.find(m => m.id === selectedId) || null, [selectedId, matches])
  const eventsUrl = useMemo(() => `${SERVER_URL}/events`, [])

  useEffect(() => {
    fetch(`${SERVER_URL}/matches`).then(r => r.json()).then(setMatches).catch(() => {})
    const es = new EventSource(eventsUrl)
    es.onopen = () => setLive(true)
    es.onmessage = (e) => {
      try { setMatches(JSON.parse(e.data) as Match[]) } catch {}
    }
    es.onerror = () => setLive(false)
    return () => { setLive(false); es.close() }
  }, [eventsUrl])

  const addMatch = async (team1: string, team2: string) => {
    const res = await fetch(`${SERVER_URL}/matches`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' }, body: JSON.stringify({ team1, team2 })
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Create failed (${res.status})`)
  }
  const updateMatch = async (id: number, patch: Partial<Pick<Match, 'team1' | 'team2' | 'score'>>) => {
    const res = await fetch(`${SERVER_URL}/matches/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' }, body: JSON.stringify(patch)
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Update failed (${res.status})`)
  }
  const deleteMatch = async (id: number) => {
    const res = await fetch(`${SERVER_URL}/matches/${id}`, { method: 'DELETE', headers: { 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' } })
    if (!res.ok && res.status !== 204) throw new Error((await res.json().catch(() => ({}))).error || `Delete failed (${res.status})`)
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Football Live Scores</h1>
        <div className="row" style={{ gap: 12 }}>
          {live && (
            <span className="live-badge" title="Connected to live updates">
              <span className="pulse-dot" aria-hidden /> LIVE
            </span>
          )}
          <span className="meta">Server: {SERVER_URL} · Role: {ROLE}</span>
        </div>
      </header>

      {ROLE === 'admin' ? (
        <div className="grid">
          <section className="section">
            <h2>Matches</h2>
            <MatchList matches={matches} onUpdate={updateMatch} onDelete={deleteMatch} />
          </section>
          <aside className="aside">
            <h2>Admin</h2>
            <AdminPanel onCreate={addMatch} />
          </aside>
        </div>
      ) : (
        <div className="grid">
          <section className="section">
            <h2>Matches</h2>
            <div className="list">
              {matches.map(m => (
                <div key={m.id} className={`list-item ${selectedId === m.id ? 'selected' : ''}`} onClick={() => setSelectedId(m.id)}>
                  <div className="card row">
                    <div style={{ fontSize: 18 }}>
                      <strong>{m.team1}</strong> vs <strong>{m.team2}</strong>
                    </div>
                  </div>
                </div>
              ))}
              {matches.length === 0 && <div className="muted">No matches yet</div>}
            </div>
          </section>
          <aside className="aside">
            <h2>Selected Match</h2>
            {selected ? (
              <div className="card">
                <h3 style={{ marginTop: 0 }}>{selected.team1} vs {selected.team2}</h3>
                <div className="score">{selected.score}</div>
                <p className="muted">Live updates via SSE.</p>
                <button className="btn btn-ghost" onClick={() => setSelectedId(null)}>Clear</button>
              </div>
            ) : <p className="muted">Select a match to view its live score.</p>}
          </aside>
        </div>
      )}
    </div>
  )
}
