// src/pages/Battle.tsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSocket } from '../services/socket'
import { useAuth } from '../contexts/AuthContext'

interface Question { question: string; options: string[] }

export default function Battle() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const [myScore, setMyScore] = useState(0)
  const [oppScore, setOppScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [countdown, setCountdown] = useState<number | null>(3)
  const [opponentAnswered, setOpponentAnswered] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [startTime, setStartTime] = useState(0)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !matchId) return

    socket.emit('game:ready', { matchId })

    socket.on('game:countdown', ({ seconds }: { seconds: number }) => setCountdown(seconds))

    socket.on('game:start', () => {
      setCountdown(null)
      setStartTime(Date.now())
      startTimer()
    })

    socket.on('game:opponent_answered', () => setOpponentAnswered(true))

    socket.on('game:question_result', ({ questionIndex, correctAnswer: ca, p1Score, p2Score }: any) => {
      setCorrectAnswer(ca)
      const isP1 = questions.length > 0
      setMyScore(profile?.id ? p1Score : p2Score)
      setOppScore(profile?.id ? p2Score : p1Score)
      clearInterval(timerRef.current)
    })

    socket.on('game:next_question', ({ questionIndex }: { questionIndex: number }) => {
      setCurrentQ(questionIndex)
      setSelected(null)
      setCorrectAnswer(null)
      setOpponentAnswered(false)
      setTimeLeft(10)
      setStartTime(Date.now())
      startTimer()
    })

    socket.on('game:end', (data: any) => {
      clearInterval(timerRef.current)
      setResult(data)
    })

    // Get match questions from state passed via navigation
    const state = (window as any).__matchState
    if (state?.questions) setQuestions(state.questions)

    return () => {
      socket.off('game:countdown')
      socket.off('game:start')
      socket.off('game:opponent_answered')
      socket.off('game:question_result')
      socket.off('game:next_question')
      socket.off('game:end')
      clearInterval(timerRef.current)
    }
  }, [matchId])

  function startTimer() {
    clearInterval(timerRef.current)
    setTimeLeft(10)
    let t = 10
    timerRef.current = setInterval(() => {
      t--
      setTimeLeft(t)
      if (t <= 0) clearInterval(timerRef.current)
    }, 1000)
  }

  function handleAnswer(answer: string) {
    if (selected || correctAnswer) return
    setSelected(answer)
    const timeTakenMs = Date.now() - startTime
    getSocket()?.emit('game:answer', { matchId, questionIndex: currentQ, answer, timeTakenMs })
  }

  // Countdown screen
  if (countdown !== null) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 160, color: 'var(--red)', lineHeight: 1, animation: 'timerPulse 0.5s ease-in-out infinite' }}>{countdown}</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, letterSpacing: 4, color: 'var(--muted2)', textTransform: 'uppercase' }}>Get Ready</div>
      </div>
    </div>
  )

  // Result screen
  if (result) {
    const won = result.winnerId === profile?.id
    const isDraw = result.isDraw
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s both' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>{isDraw ? '🤝' : won ? '🏆' : '💀'}</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 72, letterSpacing: 4, color: isDraw ? '#f59e0b' : won ? '#22c55e' : 'var(--red)', marginBottom: 8 }}>
            {isDraw ? 'DRAW' : won ? 'VICTORY' : 'DEFEAT'}
          </div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 3, marginBottom: 8 }}>
            {result.p1Score} <span style={{ color: 'var(--muted)' }}>—</span> {result.p2Score}
          </div>
          {result.p1RatingChange !== 0 && (
            <div style={{ fontSize: 18, color: result.p1RatingChange > 0 ? '#22c55e' : 'var(--red)', marginBottom: 40 }}>
              {result.p1RatingChange > 0 ? '+' : ''}{result.p1RatingChange} rating
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button onClick={() => navigate('/play')} style={{ padding: '14px 32px', background: 'var(--red)', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: "'Barlow Condensed'", letterSpacing: 2 }}>
              PLAY AGAIN
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 15 }}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!questions.length) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(230,57,70,0.2)', borderTop: '3px solid var(--red)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const q = questions[currentQ]
  const timerPct = (timeLeft / 10) * 100
  const timerColor = timeLeft <= 3 ? 'var(--red)' : timeLeft <= 6 ? '#f59e0b' : '#22c55e'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px', display: 'flex', flexDirection: 'column', maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, color: '#22c55e' }}>{myScore}</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>Question {currentQ + 1}/{questions.length}</div>
          <div style={{ width: 200, height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, transition: 'width 1s linear, background 0.3s' }} />
          </div>
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, color: 'var(--red)' }}>{oppScore}</div>
      </div>

      {/* Timer */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', border: `3px solid ${timerColor}`, fontFamily: "'Bebas Neue'", fontSize: 36, color: timerColor, animation: timeLeft <= 3 ? 'timerPulse 0.5s ease-in-out infinite' : 'none', transition: 'border-color 0.3s, color 0.3s' }}>
          {timeLeft}
        </div>
      </div>

      {/* Question */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 36px', marginBottom: 24, flex: 'none' }}>
        <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5 }}>{q?.question}</div>
      </div>

      {/* Opponent indicator */}
      {opponentAnswered && !correctAnswer && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#f59e0b', marginBottom: 12 }}>⚡ Opponent answered!</div>
      )}

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {q?.options.map((opt, i) => {
          const isSelected = selected === opt
          const isCorrect = correctAnswer && opt === correctAnswer
          const isWrong = correctAnswer && isSelected && opt !== correctAnswer
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={!!selected || !!correctAnswer} style={{ padding: '20px 16px', background: isCorrect ? 'rgba(34,197,94,0.15)' : isWrong ? 'rgba(230,57,70,0.15)' : isSelected ? 'rgba(230,57,70,0.08)' : 'rgba(255,255,255,0.03)', border: `2px solid ${isCorrect ? '#22c55e' : isWrong ? 'var(--red)' : isSelected ? 'rgba(230,57,70,0.5)' : 'var(--border)'}`, borderRadius: 12, color: 'var(--text)', fontSize: 16, fontWeight: 500, cursor: selected || correctAnswer ? 'default' : 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', fontFamily: "'Barlow Condensed'", fontSize: 13, letterSpacing: 1, flexShrink: 0 }}>
                {['A', 'B', 'C', 'D'][i]}
              </span>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
