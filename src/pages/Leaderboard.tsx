// src/pages/Leaderboard.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const TIER_COLORS: Record<string, string> = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700', platinum: '#E5E4E2', diamond: '#B9F2FF' }

export default function Leaderboard() {
  const [tab, setTab] = useState<'india' | 'college'>('india')
  const [players, setPlayers] = useState<any[]>([])
  const [myRank, setMyRank] = useState<any>(null)
  const navigate = useNavigate()
  const { profile } = useAuth()

  useEffect(() => {
    if (tab === 'india') {
      api.get('/api/leaderboard/india').then(r => setPlayers(r.data)).catch(() => {})
      api.get('/api/leaderboard/india/me').then(r => setMyRank(r.data)).catch(() => {})
    } else if (profile?.college?.id) {
      api.get(`/api/leaderboard/college/${profile.college.id}`).then(r => setPlayers(r.data)).catch(() => {})
      api.get(`/api/leaderboard/college/${profile.college.id}/me`).then(r => setMyRank(r.data)).catch(() => {})
    }
  }, [tab])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 48px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, marginBottom: 32, cursor: 'pointer' }}>← Back</button>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 52, letterSpacing: 3, marginBottom: 32 }}>
          LEADER<span style={{ color: 'var(--red)' }}>BOARD</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--panel)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
          {['india', 'college'].map(t => (
            <button key={t} onClick={() => setTab(t as any)} style={{ padding: '10px 28px', background: tab === t ? 'var(--red)' : 'none', border: 'none', borderRadius: 8, color: tab === t ? 'white' : 'var(--muted)', fontFamily: "'Barlow Condensed'", fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>
              {t === 'india' ? '🇮🇳 India' : `🏫 ${profile?.college?.name || 'College'}`}
            </button>
          ))}
        </div>

        {/* My rank */}
        {myRank?.rank && (
          <div style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid var(--border-red)', borderRadius: 12, padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, color: 'var(--muted2)' }}>Your rank</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: 'var(--red)', letterSpacing: 2 }}>#{myRank.rank}</div>
          </div>
        )}

        {/* Top 3 Podium */}
        {players.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            {[players[1], players[0], players[2]].map((p, i) => {
              const heights = [120, 160, 100]
              const medals = ['🥈', '🥇', '🥉']
              const ranks = [2, 1, 3]
              if (!p) return null
              return (
                <div key={p.id} style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
                  <div style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: TIER_COLORS[p.tier], marginBottom: 8 }}>{p.rating}</div>
                  <div style={{ height: heights[i], background: i === 1 ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i === 1 ? 'var(--border-red)' : 'var(--border)'}`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    {medals[i]}
                  </div>
                  <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: '8px', fontFamily: "'Bebas Neue'", fontSize: 20 }}>#{ranks[i]}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* List */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px', gap: 0, padding: '12px 24px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>
            <div>#</div><div>Player</div><div style={{ textAlign: 'right' }}>Rating</div><div style={{ textAlign: 'right' }}>Wins</div>
          </div>
          {players.slice(3).map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px', gap: 0, padding: '14px 24px', borderBottom: '1px solid var(--border)', background: p.id === profile?.id ? 'rgba(230,57,70,0.05)' : 'none', transition: 'background 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseOut={e => (e.currentTarget.style.background = p.id === profile?.id ? 'rgba(230,57,70,0.05)' : 'none')}>
              <div style={{ color: 'var(--muted)', fontFamily: "'Barlow Condensed'", fontSize: 15 }}>{i + 4}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${TIER_COLORS[p.tier]}22`, border: `1px solid ${TIER_COLORS[p.tier]}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {p.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: TIER_COLORS[p.tier] }}>{p.tier}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1, color: 'var(--red)' }}>{p.rating}</div>
              <div style={{ textAlign: 'right', fontSize: 14, color: 'var(--muted2)' }}>{p.wins || 0}</div>
            </div>
          ))}
          {players.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>No players yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
