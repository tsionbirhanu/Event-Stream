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
      setError('Please enter names for both teams')
      return
    }
    try {
      setLoading(true)
      await onCreate(team1, team2)
      setTeam1('')
      setTeam2('')
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } catch (err: any) {
      setError(err?.message || 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">CREATE NEW MATCH</h3>
      </div>
      <div style={{ padding: 20 }}>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="muted" style={{fontSize: 10, textTransform: 'uppercase', marginBottom: 4, display:'block'}}>Team Name 1</label>
              <input 
                className="modern-input" 
                value={team1} 
                onChange={e => setTeam1(e.target.value)} 
                placeholder="e.g. Manchester City" 
                disabled={loading} 
              />
            </div>
            
            <div>
              <label className="muted" style={{fontSize: 10, textTransform: 'uppercase', marginBottom: 4, display:'block'}}>Team Name 2</label>
              <input 
                className="modern-input" 
                value={team2} 
                onChange={e => setTeam2(e.target.value)} 
                placeholder="e.g. Real Madrid" 
                disabled={loading} 
              />
            </div>
            
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                {loading ? 'Creating...' : 'Create Match'}
              </button>
            </div>
          </div>
          
          <div style={{ height: 20, marginTop: 12, textAlign: 'center' }}>
            {error && <span style={{color: 'var(--danger-color)', fontSize: 12}}>{error}</span>}
            {done && !error && <span style={{color: 'var(--live-color)', fontSize: 12}}>Match created successfully</span>}
          </div>
        </form>
      </div>
    </div>
  )
}