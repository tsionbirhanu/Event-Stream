import React, { useMemo, useState } from 'react'
import type { Match } from '../App'

export default function MatchList({ matches, onUpdate, onDelete }: {
  matches: Match[]
  onUpdate: (id: number, patch: Partial<Pick<Match, 'team1' | 'team2' | 'score'>>) => void | Promise<void>
  onDelete: (id: number) => void | Promise<void>
}) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const editing = useMemo(() => matches.find(m => m.id === editingId) ?? null, [editingId, matches])
  const [scoreA, setScoreA] = useState<number>(0)
  const [scoreB, setScoreB] = useState<number>(0)

  const parseScore = (s: string) => {
    const m = s.match(/^(\s*)(\d+)(\s*):(\s*)(\d+)(\s*)$/)
    if (!m) return { a: 0, b: 0 }
    return { a: Number(m[2]), b: Number(m[5]) }
  }

  const startEdit = (m: Match) => {
    setEditingId(m.id)
    const { a, b } = parseScore(m.score)
    setScoreA(a)
    setScoreB(b)
  }
  
  const cancel = () => setEditingId(null)
  
  const save = async () => {
    if (!editing) return
    const normalized = `${Number.isFinite(scoreA) ? scoreA : 0} : ${Number.isFinite(scoreB) ? scoreB : 0}`
    await onUpdate(editing.id, { score: normalized })
    setEditingId(null)
  }

  return (
    <div className="match-list">
      {matches.length === 0 && (
        <div className="panel" style={{padding: 60, textAlign: 'center', color: '#444'}}>
          <div style={{fontSize: 40, marginBottom: 10, opacity: 0.3}}>⚽</div>
          <div style={{textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600}}>No Live Matches</div>
        </div>
      )}
      
      {matches.map(m => (
        <div key={m.id} className="match-card">
          {/* Main Broadcast View */}
          <div className="match-content">
            <div className="team-name team-left">{m.team1}</div>
            
            <div className="score-container">
              <div className="score-display">
                {editingId === m.id ? 'PENDING' : m.score}
              </div>
              <div className="live-badge">
                 <span className="pulsar"></span> LIVE
              </div>
            </div>
            
            <div className="team-name team-right">{m.team2}</div>
          </div>

          {/* Admin / Edit Drawer */}
          {editingId === m.id ? (
            <div className="control-panel">
               <div className="input-row">
                  <button className="btn btn-dark btn-icon" onClick={() => setScoreA(v => Math.max(0, (v ?? 0) - 1))}>-</button>
                  <input
                    className="modern-input score-input"
                    type="number"
                    min={0}
                    value={Number.isFinite(scoreA) ? scoreA : 0}
                    onChange={e => setScoreA(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <span style={{color: '#666', fontWeight: 'bold'}}>:</span>
                  <input
                    className="modern-input score-input"
                    type="number"
                    min={0}
                    value={Number.isFinite(scoreB) ? scoreB : 0}
                    onChange={e => setScoreB(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <button className="btn btn-dark btn-icon" onClick={() => setScoreB(v => (v ?? 0) + 1)}>+</button>
               </div>
               
               <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
                 <button className="btn btn-primary" onClick={save}>UPDATE BOARD</button>
                 <button className="btn btn-ghost" onClick={cancel}>CANCEL</button>
               </div>
            </div>
          ) : (
            <div className="control-panel" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#111'}}>
              <span className="muted" style={{fontSize: 10}}>MATCH ID: #{m.id}</span>
              <div style={{display: 'flex', gap: 8}}>
                 <button className="btn btn-dark" style={{padding: '6px 12px', fontSize: 11}} onClick={() => startEdit(m)}>MANAGE SCORE</button>
                 <button className="btn btn-danger" style={{padding: '6px 12px', fontSize: 11}} onClick={() => onDelete(m.id)}>END MATCH</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}