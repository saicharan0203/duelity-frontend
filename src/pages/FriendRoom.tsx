// src/pages/FriendRoom.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { connectSocket, getSocket } from '../services/socket'
import { useAuth } from '../contexts/AuthContext'

export default function FriendRoom() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [view, setView] = useState<'menu' | 'waiting' | 'joined'>(code ? 'joined' : 'menu')
  const [roomCode, setRoomCode] = useState(code || '')
  const [joinCode, setJoinCode] = useState('')
  const [room, setRoom] = useState<any>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!room) return
    const socket = getSocket()
    if (!socket) return

    socket.emit('room:join', { roomCode: room.roomCode })

    socket.on('room:state', (r: any) => setRoom(r))
    socket.on('room:guest_joined', ({ guest }: any) => {
      setRoom((prev: any) => ({ ...prev, guest }))
    })
    socket.on('room:countdown', ({ seconds }: any) => setCountdown(seconds))
    socket.on('room:match_start', ({ matchId, questions }: any) => {
      ;(window as any).__matchState = { questions }
      navigate(`/battle/${matchId}`)
    })
    socket.on('room:error', ({ message }: any) => setError(message))

    return () => {
      socket.off('room:state')
      socket.off('room:guest_joined')
      socket.off('room:countdown')
      socket.off('room:match_start')
      socket.off('room:error')
    }
  }, [room?.roomCode])

  async function createRoom() {
    setLoading(true)
    setError('')
    try {
      await connectSocket()
      const res = await api.post('/api/rooms/create')
      setRoom(res.data)
      setRoomCode(res.data.roomCode)
      setView('waiting')
    } catch { setError('Failed to create room') }
    setLoading(false)
  }

  async function joinRoom() {
    if (!joinCode.trim()) return
    setLoading(true)
    setError('')
    try {
      await connectSocket()
      const res = await api.post('/api/rooms/join', { roomCode: joinCode.toUpperCase() })
      setRoom(res.data)
      setView('joined')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Room not found')
    }
    setLoading(false)
  }

  function startMatch() {
    getSocket()?.emit('room:start', { roomCode: room.roomCode })
  }

  const isHost = room?.hostId === profile?.id

  if (countdown !== null) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 160, color: 'var(--red)', lineHeight: 1, animation: 'timerPulse 0.5s ease-in-out infinite' }}>{countdown}</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, letterSpacing: 4, color: 'var(--muted2)' }}>MATCH STARTING</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 500, animation: 'fadeUp 0.4s both' }}>
        <button onClick={() => navigate('/play')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, marginBottom: 32, cursor: 'pointer' }}>← Back</button>

        {view === 'menu' && (
          <>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 3, marginBottom: 40 }}>
              FRIEND <span style={{ color: 'var(--red)' }}>MATCH</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button onClick={createRoom} disabled={loading} style={{ padding: '20px', background: 'rgba(230,57,70,0.1)', border: '1px solid var(--border-red)', borderRadius: 12, color: 'var(--text)', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                🏟️ Create Room
              </button>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={8} style={{ flex: 1, padding: '16px 20px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 18, fontFamily: "'Bebas Neue'", letterSpacing: 4, outline: 'none', textTransform: 'uppercase' }} />
                <button onClick={joinRoom} disabled={loading || !joinCode} style={{ padding: '16px 24px', background: 'var(--red)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 700 }}>
                  JOIN
                </button>
              </div>
              {error && <div style={{ color: 'var(--red)', fontSize: 14, textAlign: 'center' }}>{error}</div>}
            </div>
          </>
        )}

        {(view === 'waiting' || view === 'joined') && room && (
          <>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 3, marginBottom: 8 }}>
              {isHost ? 'YOUR ROOM' : 'JOINED ROOM'}
            </div>

            {isHost && (
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border-red)', borderRadius: 12, padding: '24px', marginBottom: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 12, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Room Code</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 52, letterSpacing: 8, color: 'var(--red)' }}>{room.roomCode}</div>
                <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 8 }}>Share this code with your friend</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              <div style={{ flex: 1, padding: '20px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Host</div>
                <div style={{ fontWeight: 600 }}>{room.host?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{room.host?.tier}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontFamily: "'Bebas Neue'", fontSize: 24, color: 'var(--muted)' }}>VS</div>
              <div style={{ flex: 1, padding: '20px', background: 'var(--panel)', border: `1px solid ${room.guest ? 'var(--border-red)' : 'var(--border)'}`, borderRadius: 12, textAlign: 'center' }}>
                {room.guest ? (
                  <>
                    <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Guest</div>
                    <div style={{ fontWeight: 600 }}>{room.guest.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{room.guest.tier}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>⏳</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Waiting...</div>
                  </>
                )}
              </div>
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{error}</div>}

            {isHost && (
              <button onClick={startMatch} disabled={!room.guest} style={{ width: '100%', padding: '16px', background: room.guest ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, color: room.guest ? 'white' : 'var(--muted)', fontSize: 16, fontWeight: 700, fontFamily: "'Barlow Condensed'", letterSpacing: 3 }}>
                {room.guest ? 'START MATCH' : 'WAITING FOR OPPONENT...'}
              </button>
            )}

            {!isHost && (
              <div style={{ textAlign: 'center', color: 'var(--muted2)', fontSize: 15 }}>Waiting for host to start the match...</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
