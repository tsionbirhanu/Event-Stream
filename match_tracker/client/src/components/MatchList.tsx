import React, { useMemo, useState } from 'react'
import type { Match } from '../App'

export default function MatchList({ matches, onUpdate, onDelete }: {
  matches: Match[]
  onUpdate: (id: number, patch: Partial<Pick<Match, 'team1' | 'team2' | 'score'>>) => void | Promise<void>
  onDelete: (id: number) => void | Promise<void>
}) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const editing = useMemo(() => matches.find(m => m.id === editingId) ?? null, [editingId, matches])
  const [form, setForm] = useState({ team1: '', team2: '', score: '' })
  const [scoreA, setScoreA] = useState<number>(0)
  const [scoreB, setScoreB] = useState<number>(0)

  const parseScore = (s: string) => {
    const m = s.match(/^(\s*)(\d+)(\s*):(\s*)(\d+)(\s*)$/)
    if (!m) return { a: 0, b: 0 }
    return { a: Number(m[2]), b: Number(m[5]) }
  }

  const startEdit = (m: Match) => {
    setEditingId(m.id)
    setForm({ team1: m.team1, team2: m.team2, score: m.score })
    const { a, b } = parseScore(m.score)
    setScoreA(a)
    setScoreB(b)
  }
  const cancel = () => {
    setEditingId(null)
  }
  const save = async () => {
    if (!editing) return
    const normalized = `${Number.isFinite(scoreA) ? scoreA : 0} : ${Number.isFinite(scoreB) ? scoreB : 0}`
    await onUpdate(editing.id, { score: normalized })
    setEditingId(null)
  }

  return (
    <div className="list">
      {matches.length === 0 && <div className="muted">No matches yet</div>}
      {matches.map(m => (
        <div key={m.id} className="card">
          {editingId === m.id ? (
            <div className="row wrap" style={{ gap: 12 }}>
              <div style={{ fontSize: 18 }}>
                <strong>{m.team1}</strong> vs <strong>{m.team2}</strong>
              </div>
              <div className="row" style={{ gap: 8, marginLeft: 'auto' }}>
                <button className="btn" type="button" onClick={() => setScoreA(v => Math.max(0, (v ?? 0) - 1))}>-</button>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={Number.isFinite(scoreA) ? scoreA : 0}
                  onChange={e => setScoreA(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: 68, textAlign: 'center' }}
                />
                <span className="score" style={{ lineHeight: '1' }}>:</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={Number.isFinite(scoreB) ? scoreB : 0}
                  onChange={e => setScoreB(Math.max(0, Number(e.target.value) || 0))}
                  style={{ width: 68, textAlign: 'center' }}
                />
                <button className="btn" type="button" onClick={() => setScoreB(v => (v ?? 0) + 1)}>+</button>
                <button className="btn btn-primary" type="button" onClick={save}>Save</button>
                <button className="btn btn-ghost" type="button" onClick={cancel}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="row">
              <div style={{ fontSize: 18 }}>
                <strong>{m.team1}</strong> vs <strong>{m.team2}</strong>
              </div>
              <div className="row" style={{ gap: 16 }}>
                <span className="score">{m.score}</span>
                <button className="btn" onClick={() => startEdit(m)}>Edit</button>
                <button className="btn btn-danger" onClick={() => onDelete(m.id)}>Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
