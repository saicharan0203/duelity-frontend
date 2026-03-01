// src/pages/Assessment.tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../services/firebase'

const QUESTIONS = [
  { q: 'What is 15 × 8?',                            options: ['100', '120', '110', '130'],   answer: '120' },
  { q: 'What is 25% of 200?',                         options: ['40', '50', '60', '25'],       answer: '50'  },
  { q: 'Solve: x + 14 = 31',                          options: ['17', '15', '18', '16'],       answer: '17'  },
  { q: 'What is √144?',                               options: ['11', '14', '12', '13'],       answer: '12'  },
  { q: 'If 3x − 7 = 14, what is x?',                 options: ['5', '7', '9', '3'],           answer: '7'   },
  { q: 'What is 12² − 5²?',                           options: ['109', '119', '99', '129'],    answer: '119' },
  { q: 'Simplify: (2³ × 2⁴) ÷ 2²',                   options: ['32', '16', '64', '8'],        answer: '32'  },
  { q: 'What is 3! + 4!?',                            options: ['24', '30', '36', '18'],       answer: '30'  },
  { q: 'Sum of first 10 natural numbers?',            options: ['45', '50', '55', '60'],       answer: '55'  },
  { q: 'Solve: x² − 5x + 6 = 0',                     options: ['2,3', '1,6', '2,4', '3,4'],  answer: '2,3' },
]

export default function Assessment() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const [tier, setTier] = useState('')
  const [timeLeft, setTimeLeft] = useState(15)
  const [saving, setSaving] = useState(false)
  const startTimeRef = useRef(Date.now())
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (done) return
    setTimeLeft(15)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); advance(null, correct); return 15 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [current, done])

  function advance(ans: string | null, currentCorrect: number) {
    const isCorrect = ans === QUESTIONS[current].answer
    const newCorrect = isCorrect ? currentCorrect + 1 : currentCorrect

    setTimeout(async () => {
      if (current + 1 >= QUESTIONS.length) {
        clearInterval(timerRef.current)
        setCorrect(newCorrect)
        await submitAssessment(newCorrect)
      } else {
        if (isCorrect) setCorrect(c => c + 1)
        setCurrent(c => c + 1)
        setSelected(null)
      }
    }, 500)
  }

  function handleAnswer(ans: string) {
    if (selected) return
    clearInterval(timerRef.current)
    setSelected(ans)
    advance(ans, correct)
  }

  async function submitAssessment(finalCorrect: number) {
    setSaving(true)
    const timeSecs = Math.round((Date.now() - startTimeRef.current) / 1000)
    try {
      const user = auth.currentUser
      if (!user) return
      const token = await user.getIdToken()
      const res = await fetch('http://localhost:3001/api/auth/complete-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ correct: finalCorrect, timeSecs })
      })
      const data = await res.json()
      setTier(data.tier || 'bronze')
    } catch { setTier('bronze') }
    setSaving(false)
    setDone(true)
  }

  async function handleContinue() {
    await refreshProfile()
    navigate('/college', { replace: true })
  }

  const TIER_COLORS: Record<string, string> = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700', platinum: '#E5E4E2', diamond: '#B9F2FF' }
  const TIER_ICONS: Record<string, string>  = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '⚡', diamond: '💎' }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s both' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>{TIER_ICONS[tier] || '🥉'}</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 56, color: TIER_COLORS[tier] || '#fff', letterSpacing: 4 }}>{tier?.toUpperCase()}</div>
        <div style={{ fontSize: 18, color: 'var(--muted2)', marginBottom: 8 }}>Your starting tier</div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 40 }}>{correct}/10 correct</div>
        <button onClick={handleContinue} style={{ padding: '16px 48px', background: 'var(--red)', border: 'none', borderRadius: 8, color: 'white', fontSize: 16, fontWeight: 700, fontFamily: "'Barlow Condensed'", letterSpacing: 3, textTransform: 'uppercase', cursor: 'pointer' }}>
          CONTINUE →
        </button>
      </div>
    </div>
  )

  if (saving) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(230,57,70,0.2)', borderTop: '3px solid var(--red)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--muted2)' }}>Calculating your tier...</div>
      </div>
    </div>
  )

  const q = QUESTIONS[current]
  const progress = (current / QUESTIONS.length) * 100

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 600, animation: 'fadeUp 0.4s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2 }}>SKILL ASSESSMENT</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: 2 }}>Question {current + 1} of {QUESTIONS.length}</div>
          </div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: timeLeft <= 5 ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.04)', border: `2px solid ${timeLeft <= 5 ? 'var(--red)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", fontSize: 24, color: timeLeft <= 5 ? 'var(--red)' : 'var(--text)', animation: timeLeft <= 5 ? 'timerPulse 0.5s ease-in-out infinite' : 'none', transition: 'all 0.3s' }}>
            {timeLeft}
          </div>
        </div>

        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--red)', transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '32px 36px', marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.4 }}>{q.q}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === opt
            const isCorrect = selected && opt === q.answer
            const isWrong = isSelected && opt !== q.answer
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={!!selected} style={{ padding: '18px 16px', background: isCorrect ? 'rgba(34,197,94,0.15)' : isWrong ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isCorrect ? '#22c55e' : isWrong ? 'var(--red)' : 'var(--border)'}`, borderRadius: 8, color: 'var(--text)', fontSize: 16, fontWeight: 500, textAlign: 'left', cursor: selected ? 'default' : 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', fontFamily: "'Barlow Condensed'", fontSize: 13, letterSpacing: 1, flexShrink: 0 }}>
                  {['A', 'B', 'C', 'D'][i]}
                </span>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
