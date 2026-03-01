// src/pages/Profile.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const TIER_COLORS: Record<string, string> = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700', platinum: '#E5E4E2', diamond: '#B9F2FF' }
const TIER_ICONS: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '⚡', diamond: '💎' }

export default function Profile() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [indiaRank, setIndiaRank] = useState<number | null>(null)

  useEffect(() => {
    api.get('/api/users/me/matches').then(r => setMatches(r.data)).catch(() => {})
    api.get('/api/leaderboard/india/me').then(r => setIndiaRank(r.data.rank)).catch(() => {})
  }, [])

  async function saveName() {
    setSaving(true)
    try {
      await api.patch('/api/users/me', { name })
      await refreshProfile()
      setEditing(false)
    } catch {}
    setSaving(false)
  }

  const winRate = profile?.totalMatches ? Math.round(((profile.wins || 0) / profile.totalMatches) * 100) : 0
  const tierColor = TIER_COLORS[profile?.tier || 'bronze']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 48px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, marginBottom: 32, cursor: 'pointer' }}>← Back</button>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${tierColor}15 0%, rgba(255,255,255,0.02) 100%)`, border: `1px solid ${tierColor}30`, borderRadius: 20, padding: '40px 48px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue'", fontSize: 120, color: `${tierColor}15`, letterSpacing: 4, lineHeight: 1 }}>
            {TIER_ICONS[profile?.tier || 'bronze']}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${tierColor}22`, border: `2px solid ${tierColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", fontSize: 36, color: tierColor }}>
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 24, fontWeight: 700, outline: 'none', width: 240 }} />
                  <button onClick={saveName} disabled={saving} style={{ padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600 }}>
                    {saving ? '...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14 }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2 }}>{profile?.name}</div>
                  <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, cursor: 'pointer', padding: 4 }}>✏️</button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: tierColor, fontWeight: 600 }}>{TIER_ICONS[profile?.tier || 'bronze']} {profile?.tier?.toUpperCase()}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)' }} />
                <span style={{ fontSize: 14, color: 'var(--muted2)' }}>{profile?.college?.name || 'No college'}</span>
                {indiaRank && <><span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)' }} /><span style={{ fontSize: 14, color: 'var(--muted2)' }}>Rank #{indiaRank}</span></>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'RATING', value: profile?.rating || 1000 },
            { label: 'WINS', value: profile?.wins || 0 },
            { label: 'LOSSES', value: profile?.losses || 0 },
            { label: 'WIN RATE', value: `${winRate}%` },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2, color: 'var(--red)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Match history */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 28px' }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20, color: 'var(--muted2)' }}>Match History</div>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--muted)' }}>No matches yet</div>
          ) : (
            matches.map((m: any) => {
              const isP1 = m.player1Id === profile?.id
              const won = m.winnerId === profile?.id
              const opponent = isP1 ? m.player2 : m.player1
              const myScore = isP1 ? m.p1Score : m.p2Score
              const oppScore = isP1 ? m.p2Score : m.p1Score
              const ratingChange = isP1 ? m.p1RatingChange : m.p2RatingChange
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: won ? '#22c55e' : m.winnerId ? 'var(--red)' : '#f59e0b', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>vs {opponent?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.mode} · {new Date(m.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 2 }}>{myScore}–{oppScore}</div>
                    {ratingChange !== 0 && (
                      <div style={{ fontSize: 13, fontWeight: 600, color: ratingChange > 0 ? '#22c55e' : 'var(--red)', minWidth: 40, textAlign: 'right' }}>
                        {ratingChange > 0 ? '+' : ''}{ratingChange}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
