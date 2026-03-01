// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../services/firebase'
import api from '../services/api'

const TIER_COLORS: Record<string, string> = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700', platinum: '#E5E4E2', diamond: '#B9F2FF' }
const TIER_ICONS: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '⚡', diamond: '💎' }

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState<any[]>([])
  const [rank, setRank] = useState<number | null>(null)

  useEffect(() => {
    api.get('/api/users/me/matches').then(r => setMatches(r.data)).catch(() => {})
    api.get('/api/leaderboard/india/me').then(r => setRank(r.data.rank)).catch(() => {})
  }, [])

  const winRate = profile?.totalMatches ? Math.round((profile.wins / profile.totalMatches) * 100) : 0

  const navItems = [
    { label: 'DASHBOARD', path: '/dashboard', active: true },
    { label: 'PLAY', path: '/play' },
    { label: 'LEADERBOARD', path: '/leaderboard' },
    { label: 'PROFILE', path: '/profile' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: 'var(--panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        <div style={{ padding: '0 24px', marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 3 }}>DUEL<span style={{ color: 'var(--red)' }}>ITY</span></div>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ width: '100%', padding: '13px 24px', background: item.active ? 'rgba(230,57,70,0.1)' : 'none', border: 'none', borderLeft: item.active ? '3px solid var(--red)' : '3px solid transparent', color: item.active ? 'var(--text)' : 'var(--muted)', fontFamily: "'Barlow Condensed'", fontSize: 14, letterSpacing: 2, textAlign: 'left', cursor: 'pointer', textTransform: 'uppercase' }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name}</div>
            <div style={{ fontSize: 12, color: TIER_COLORS[profile?.tier || 'bronze'] }}>{TIER_ICONS[profile?.tier || 'bronze']} {profile?.tier?.toUpperCase()}</div>
          </div>
          <button onClick={() => { auth.signOut(); navigate('/login') }} style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', fontSize: 13 }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, padding: '40px 48px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 40, letterSpacing: 2, marginBottom: 4 }}>
            WELCOME BACK, <span style={{ color: 'var(--red)' }}>{profile?.name?.split(' ')[0]?.toUpperCase()}</span>
          </div>
          <div style={{ color: 'var(--muted2)', fontSize: 15 }}>Ready for today's battles?</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'RATING', value: profile?.rating || 1000, color: 'var(--red)' },
            { label: 'RANK', value: rank ? `#${rank}` : '—', color: '#60a5fa' },
            { label: 'WIN RATE', value: `${winRate}%`, color: '#22c55e' },
            { label: 'MATCHES', value: profile?.totalMatches || 0, color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 20px' }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 40, letterSpacing: 2, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Play Banner */}
        <div onClick={() => navigate('/play')} style={{ background: 'linear-gradient(135deg, rgba(230,57,70,0.2) 0%, rgba(230,57,70,0.05) 100%)', border: '1px solid var(--border-red)', borderRadius: 16, padding: '40px 48px', marginBottom: 40, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--red)')}
          onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border-red)')}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 3, marginBottom: 8 }}>
            START A <span style={{ color: 'var(--red)' }}>BATTLE</span>
          </div>
          <div style={{ color: 'var(--muted2)', fontSize: 15 }}>Find an opponent and prove your skills</div>
          <div style={{ position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue'", fontSize: 72, color: 'rgba(230,57,70,0.15)', letterSpacing: 4 }}>FIGHT</div>
        </div>

        {/* Recent Matches */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 28px' }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20, color: 'var(--muted2)' }}>Recent Matches</div>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>No matches yet — play your first battle!</div>
          ) : (
            matches.slice(0, 5).map((m: any) => {
              const isP1 = m.player1Id === profile?.id
              const won = m.winnerId === profile?.id
              const opponent = isP1 ? m.player2 : m.player1
              const myScore = isP1 ? m.p1Score : m.p2Score
              const oppScore = isP1 ? m.p2Score : m.p1Score
              const ratingChange = isP1 ? m.p1RatingChange : m.p2RatingChange
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: won ? '#22c55e' : m.winnerId ? 'var(--red)' : '#f59e0b' }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>vs {opponent?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.mode} · {new Date(m.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2 }}>{myScore} <span style={{ color: 'var(--muted)' }}>—</span> {oppScore}</div>
                    {ratingChange !== 0 && (
                      <div style={{ fontSize: 13, fontWeight: 600, color: ratingChange > 0 ? '#22c55e' : 'var(--red)' }}>
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
