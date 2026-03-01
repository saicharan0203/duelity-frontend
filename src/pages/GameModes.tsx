// src/pages/GameModes.tsx
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { connectSocket } from '../services/socket'

const MODES = [
  { id: 'ranked',   label: 'RANKED',       desc: 'Affects rating',        icon: '⚔️',  color: '#e63946', angle: 0,   orbitR: 180, available: true },
  { id: 'casual',   label: 'CASUAL',       desc: 'No rating change',      icon: '🎮',  color: '#60a5fa', angle: 90,  orbitR: 180, available: true },
  { id: 'friend',   label: 'FRIEND',       desc: 'Battle a friend',       icon: '🤝',  color: '#22c55e', angle: 180, orbitR: 180, available: true },
  { id: 'practice', label: 'PRACTICE',     desc: 'Coming soon',           icon: '📚',  color: '#f59e0b', angle: 270, orbitR: 180, available: false },
]

export default function GameModes() {
  const navigate = useNavigate()
  const [searching, setSearching] = useState(false)
  const [searchMode, setSearchMode] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)

  // Slow orbital rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => (r + 0.15) % 360)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  async function handleMode(modeId: string) {
    if (modeId === 'friend') { navigate('/room'); return }
    if (modeId === 'practice') return
    setSearchMode(modeId)
    setSearching(true)
    const socket = await connectSocket()
    socket.emit('queue:join', { mode: modeId })
    socket.once('match:found', ({ matchId, questions }: any) => {
      ;(window as any).__matchState = { questions }
      setSearching(false)
      navigate(`/battle/${matchId}`)
    })
  }

  function cancelSearch() {
    setSearching(false)
    setSearchMode('')
    import('../services/socket').then(({ getSocket }) => getSocket()?.emit('queue:leave'))
  }

  if (searching) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s both' }}>
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 40px' }}>
          <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(230,57,70,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, border: '3px solid transparent', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 12, border: '2px solid rgba(230,57,70,0.1)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 12, border: '2px solid transparent', borderTopColor: 'rgba(230,57,70,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite reverse' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>⚔️</div>
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 4, marginBottom: 8 }}>FINDING OPPONENT</div>
        <div style={{ color: 'var(--muted2)', marginBottom: 40, fontSize: 15 }}>Searching for a {searchMode} match...</div>
        <button onClick={cancelSearch} style={{ padding: '12px 32px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )

  const cx = 300
  const cy = 300

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(230,57,70,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,70,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', animation: 'gridMove 20s linear infinite' }} />

      <button onClick={() => navigate('/dashboard')} style={{ position: 'absolute', top: 32, left: 40, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>← Back</button>

      <div style={{ textAlign: 'center', marginBottom: 8, position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 14, letterSpacing: 6, color: 'var(--muted)', textTransform: 'uppercase' }}>Choose Your Battle</div>
      </div>

      {/* Orbital SVG */}
      <div style={{ position: 'relative', width: 600, height: 600, zIndex: 2 }}>
        <svg width="600" height="600" style={{ position: 'absolute', inset: 0 }}>
          {/* Orbit ring */}
          <circle cx={cx} cy={cy} r={180} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx={cx} cy={cy} r={180} fill="none" stroke="rgba(230,57,70,0.08)" strokeWidth="1" />

          {/* Inner ring */}
          <circle cx={cx} cy={cy} r={60} fill="none" stroke="rgba(230,57,70,0.1)" strokeWidth="1" />

          {/* Glow lines to hovered */}
          {hovered && MODES.filter(m => m.id === hovered).map(m => {
            const rad = ((m.angle + rotation) * Math.PI) / 180
            const x = cx + m.orbitR * Math.cos(rad)
            const y = cy + m.orbitR * Math.sin(rad)
            return <line key={m.id} x1={cx} y1={cy} x2={x} y2={y} stroke={m.color} strokeWidth="1" strokeOpacity="0.3" />
          })}
        </svg>

        {/* Center */}
        <div style={{ position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)', zIndex: 3, textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,57,70,0.2) 0%, rgba(230,57,70,0.05) 70%)', border: '1px solid rgba(230,57,70,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2, color: 'var(--red)' }}>
              {hovered ? MODES.find(m => m.id === hovered)?.label : 'PLAY'}
            </div>
            {!hovered && <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>SELECT</div>}
          </div>
        </div>

        {/* Orbital mode nodes */}
        {MODES.map((mode) => {
          const rad = ((mode.angle + rotation) * Math.PI) / 180
          const x = cx + mode.orbitR * Math.cos(rad)
          const y = cy + mode.orbitR * Math.sin(rad)
          const isHovered = hovered === mode.id

          return (
            <div
              key={mode.id}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                zIndex: 4,
                cursor: mode.available ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={() => setHovered(mode.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => mode.available && handleMode(mode.id)}
            >
              {/* Node */}
              <div style={{
                width: isHovered ? 88 : 72,
                height: isHovered ? 88 : 72,
                borderRadius: '50%',
                background: isHovered ? `${mode.color}22` : 'rgba(15,21,32,0.9)',
                border: `2px solid ${isHovered ? mode.color : 'rgba(255,255,255,0.08)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: isHovered ? `0 0 24px ${mode.color}44` : 'none',
                opacity: mode.available ? 1 : 0.4,
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ fontSize: isHovered ? 28 : 24, transition: 'all 0.2s' }}>{mode.icon}</div>
              </div>

              {/* Label below node */}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                opacity: isHovered ? 1 : 0.6,
                transition: 'opacity 0.2s',
              }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, letterSpacing: 2, color: isHovered ? mode.color : 'var(--muted2)', textTransform: 'uppercase', fontWeight: 600 }}>{mode.label}</div>
                {isHovered && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{mode.desc}</div>}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 8, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: 1 }}>Hover to preview · Click to enter</div>
      </div>
    </div>
  )
}
