// src/pages/Login.tsx
import { useState } from 'react'
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../services/firebase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.message?.replace('Firebase: ', '').replace(/\(.*\)/, '').trim())
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(230,57,70,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(230,57,70,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', animation: 'gridMove 20s linear infinite' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, background: 'rgba(230,57,70,0.12)', borderRadius: '50%', filter: 'blur(100px)', top: -150, right: -100, animation: 'pulse 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, background: 'rgba(230,57,70,0.06)', borderRadius: '50%', filter: 'blur(100px)', bottom: -100, left: '30%', animation: 'pulse 8s ease-in-out infinite reverse' }} />

      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 3, lineHeight: 1, marginBottom: 6 }}>
          DUEL<span style={{ color: 'var(--red)' }}>ITY</span>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: 6, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 80 }}>
          1V1 MATH BATTLES
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 8vw, 120px)', lineHeight: 0.9, letterSpacing: 2, marginBottom: 32 }}>
          <div style={{ color: 'var(--text)' }}>PROVE</div>
          <div style={{ color: 'var(--red)', textShadow: '0 0 60px var(--red-glow)' }}>YOUR</div>
          <div style={{ color: 'var(--muted2)', fontSize: '0.6em' }}>INTELLECT</div>
        </div>
        <p style={{ fontSize: 16, color: 'var(--muted2)', lineHeight: 1.7, maxWidth: 420, marginBottom: 48 }}>
          Battle students across India in real-time math duels. Climb the ranks, represent your college, dominate the leaderboard.
        </p>
        <div style={{ display: 'flex', gap: 40 }}>
          {[['10K+', 'STUDENTS'], ['500+', 'COLLEGES'], ['1M+', 'BATTLES']].map(([num, label]) => (
            <div key={label} style={{ borderLeft: '2px solid var(--red)', paddingLeft: 16 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2, lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: 480, background: 'var(--panel)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', position: 'relative', zIndex: 1, animation: 'slideIn 0.5s cubic-bezier(0.16,1,0.3,1) both', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--red), transparent)', animation: 'scanline 3s ease-in-out infinite' }} />

        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, marginBottom: 8 }}>
          {mode === 'login' ? 'WELCOME BACK' : 'JOIN THE ARENA'}
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted2)', marginBottom: 36 }}>
          {mode === 'login' ? 'Sign in to continue your battle streak' : 'Create your account and start competing'}
        </p>

        {/* Google Button */}
        <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '14px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24, transition: 'all 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
          onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 2 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, outline: 'none' }} />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, outline: 'none' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 15, outline: 'none' }} />

          {error && <div style={{ fontSize: 13, color: 'var(--red)', padding: '10px 14px', background: 'rgba(230,57,70,0.1)', borderRadius: 6, border: '1px solid var(--border-red)' }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 20px', background: 'var(--red)', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>
            {loading ? 'LOADING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 600, fontSize: 14, padding: 0 }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
