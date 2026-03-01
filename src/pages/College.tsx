// src/pages/College.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface College { id: string; name: string; city: string; state: string; icon: string }

export default function College() {
  const [search, setSearch] = useState('')
  const [colleges, setColleges] = useState<College[]>([])
  const [selected, setSelected] = useState<College | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get(`/api/colleges?q=${search}`)
        setColleges(res.data)
      } catch {}
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  async function handleSubmit(collegeId: string | null) {
    setLoading(true)
    try {
      await api.post('/api/auth/set-college', { collegeId })
      await refreshProfile()
      // Force navigate regardless of profile state
      navigate('/dashboard', { replace: true })
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const popular = ['IIT Bombay', 'IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'VIT Vellore']

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 560, animation: 'fadeUp 0.4s both' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 3 }}>SELECT YOUR <span style={{ color: 'var(--red)' }}>COLLEGE</span></div>
          <p style={{ color: 'var(--muted2)', fontSize: 15, marginTop: 8 }}>Compete on your college leaderboard and represent your institution</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null) }} placeholder="Search colleges..." style={{ width: '100%', padding: '16px 20px', background: 'var(--panel)', border: `1px solid ${selected ? 'var(--red)' : 'var(--border)'}`, borderRadius: 10, color: 'var(--text)', fontSize: 15, outline: 'none' }} />
          {selected && <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: 20 }}>✓</div>}
        </div>

        {/* Selected */}
        {selected && (
          <div style={{ padding: '16px 20px', background: 'rgba(230,57,70,0.1)', border: '1px solid var(--border-red)', borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{selected.icon}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{selected.city}, {selected.state}</div>
            </div>
          </div>
        )}

        {/* Dropdown */}
        {search && !selected && colleges.length > 0 && (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 20, maxHeight: 240, overflowY: 'auto' }}>
            {colleges.map(c => (
              <button key={c.id} onClick={() => { setSelected(c); setSearch(c.name) }} style={{ width: '100%', padding: '14px 20px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseOut={e => (e.currentTarget.style.background = 'none')}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.city}, {c.state}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Popular */}
        {!search && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>Popular</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {popular.map(name => (
                <button key={name} onClick={() => setSearch(name)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--muted2)', fontSize: 13, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted2)' }}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => handleSubmit(selected?.id || null)} disabled={loading} style={{ width: '100%', padding: '16px', background: 'var(--red)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: "'Barlow Condensed'", letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
          {loading ? 'SAVING...' : selected ? `JOIN WITH ${selected.name.toUpperCase()}` : 'CONTINUE'}
        </button>
        <button onClick={() => handleSubmit(null)} disabled={loading} style={{ width: '100%', padding: '14px', background: 'none', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--muted)', fontSize: 14 }}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
