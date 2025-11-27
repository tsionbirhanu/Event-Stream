import React, { useState } from 'react'

export default function AdminPanel({ onCreate }: {
  onCreate: (team1: string, team2: string) => void | Promise<void>
}) {
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDone(false)
    if (!team1 || !team2) {
      setError('Both team names required')
      return
    }
    try {
      setLoading(true)
      await onCreate(team1, team2)
      setTeam1('')
      setTeam2('')
      setDone(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: 'grid', gap: 10 }}>
      <input className="input" value={team1} onChange={e => setTeam1(e.target.value)} placeholder="Team 1" disabled={loading} />
      <input className="input" value={team2} onChange={e => setTeam2(e.target.value)} placeholder="Team 2" disabled={loading} />
      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding…' : 'Add Match'}</button>
        {error && <p className="status-error">{error}</p>}
        {done && !error && <p className="status-success">Match added.</p>}
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 12 }}>Tip: live list updates via SSE.</p>
    </form>
  )
}
