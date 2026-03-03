import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { connectSocket } from '../services/socket'
import { useAuth } from '../contexts/AuthContext'

export default function Battle() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const mode = params.get('mode') || 'ranked'

  const matchState = (location.state as any)?.match
  const [questions] = useState(() => matchState?.questions || [])
  const [matchId] = useState<string | null>(() => matchState?.matchId || null)
  const [playerIndex] = useState<1 | 2 | null>(() => matchState?.playerIndex ?? null)

  const [cur, setCur] = useState(0)
  const [myScore, setMyScore] = useState(0)
  const [oppScore, setOppScore] = useState(0)
  const [selected, setSelected] = useState<string|null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [ended, setEnded] = useState(false)
  const [myStreak, setMyStreak] = useState(0)
  const timerRef = useRef<any>(null)
  const questionStartRef = useRef<number>(Date.now())
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!matchId || !questions.length || !user) {
      navigate('/play')
      return
    }

    let cancelled = false

    async function setup() {
      const socket = await connectSocket()
      if (cancelled) return

      socket.emit('game:ready', { matchId })

      socket.off('game:countdown')
      socket.off('game:start')
      socket.off('game:next_question')
      socket.off('game:question_result')
      socket.off('game:end')

      socket.on('game:countdown', (data: { seconds: number }) => {
        setCountdown(data.seconds)
      })

      socket.on('game:start', ({ questionIndex }: { matchId: string; questionIndex: number }) => {
        setCountdown(null)
        startTimer()
        setCur(questionIndex)
      })

      socket.on('game:next_question', ({ questionIndex }: { questionIndex: number }) => {
        setSelected(null)
        setCur(questionIndex)
        startTimer()
      })

      socket.on('game:question_result', (payload: { questionIndex: number; correctAnswer: string; p1Score: number; p2Score: number }) => {
        if (!playerIndex) return
        setMyScore(playerIndex === 1 ? payload.p1Score : payload.p2Score)
        setOppScore(playerIndex === 1 ? payload.p2Score : payload.p1Score)
      })

      socket.on('game:end', (payload: { winnerId: string | null; p1Score: number; p2Score: number; isDraw: boolean }) => {
        if (!playerIndex || !user) return
        const myFinalScore = playerIndex === 1 ? payload.p1Score : payload.p2Score
        const oppFinalScore = playerIndex === 1 ? payload.p2Score : payload.p1Score
        setMyScore(myFinalScore)
        setOppScore(oppFinalScore)
        setEnded(true)
      })
    }

    setup()

    return () => {
      cancelled = true
      clearInterval(timerRef.current)
    }
  }, [matchId, questions.length, playerIndex, navigate, user])

  function startTimer() {
    clearInterval(timerRef.current)
    setTimeLeft(10)
    questionStartRef.current = Date.now()
    timerRef.current = setInterval(()=>{
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); timeUp(); return 0 }
        return t - 1
      })
    }, 1000)
  }

  function selectAnswer(opt: string) {
    if (selected || !matchId) return
    clearInterval(timerRef.current)
    setSelected(opt)
    const timeTakenMs = Date.now() - questionStartRef.current

    connectSocket().then(socket => {
      socket.emit('game:answer', {
        matchId,
        questionIndex: cur,
        answer: opt,
        timeTakenMs,
      })
    })
  }

  function timeUp() {
    if (selected) return
    setSelected('__timeout__')
    setMyStreak(0)
  }

  if (!questions.length || !matchId) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
        <div style={{color:'var(--muted)'}}>No active match. Redirecting...</div>
      </div>
    )
  }

  const q = questions[cur]
  const myWin = myScore > oppScore, draw = myScore === oppScore

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'var(--bg)',position:'relative',overflow:'hidden'}}>
      <div className="bg-grid" style={{opacity:0.5}}/>

      {/* TOP BAR */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',position:'relative',zIndex:2,borderBottom:'1px solid var(--border)'}}>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:4,textTransform:'uppercase',color:'var(--red)',border:'1px solid rgba(230,57,70,0.3)',padding:'5px 14px',borderRadius:2}}>⚡ {mode.toUpperCase()} MATCH</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:3,color:'var(--muted2)'}}>Q {cur+1} / 10</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:2,color:timeLeft<=3?'#ff4444':'var(--red)',minWidth:40,textAlign:'right'}}>
          {countdown !== null ? countdown : timeLeft}
        </div>
      </div>

      {/* TIMER BAR */}
      <div style={{width:'100%',height:4,background:'rgba(255,255,255,0.05)',position:'relative',zIndex:2}}>
        <div style={{height:'100%',background:timeLeft<=3?'linear-gradient(90deg,#ff0000,#ff4444)':'linear-gradient(90deg,#e63946,#ff6b6b)',boxShadow:'0 0 10px rgba(230,57,70,0.6)',transition:'width 1s linear',width:`${(timeLeft/10)*100}%`}}/>
      </div>

      {/* ARENA */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px 32px',position:'relative',zIndex:2,gap:16}}>
        {/* MY SCORE */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,minWidth:120}}>
          <div style={{width:56,height:56,background:'linear-gradient(135deg,#e63946,#c1121f)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:20,color:'white',border:'2px solid rgba(230,57,70,0.4)'}}>ME</div>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:3,textTransform:'uppercase',color:'var(--muted2)'}}>You</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:64,letterSpacing:2,color:'var(--text)',lineHeight:1}}>{myScore}</div>
          <div style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)'}}>Points</div>
          {myStreak >= 3 && <div style={{fontSize:18}}>{'🔥'.repeat(Math.min(myStreak,5))}</div>}
        </div>

        {/* CENTRE */}
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24,position:'relative',maxWidth:640}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:8,color:'var(--muted)',opacity:0.5}}>VS</div>
          <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:12,padding:'32px 40px',width:'100%',textAlign:'center',transition:'all 0.3s'}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:'clamp(28px,4vw,44px)',letterSpacing:2,color:'var(--text)',lineHeight:1.2}}>{q.question}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,width:'100%'}}>
            {q.options.map((opt:string,i:number)=>{
              let bg='rgba(255,255,255,0.03)', border='1px solid var(--border)', opacity=1
              return (
                <button key={opt} onClick={()=>selectAnswer(opt)} disabled={!!selected} style={{padding:'14px 20px',background:bg,border,borderRadius:8,display:'flex',alignItems:'center',gap:12,color:'var(--text)',fontSize:15,fontWeight:500,cursor:selected?'default':'pointer',transition:'all 0.2s',textAlign:'left',opacity}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:18,color:'var(--muted)',minWidth:20}}>{String.fromCharCode(65+i)}</span>
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* OPP SCORE */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,minWidth:120}}>
          <div style={{width:56,height:56,background:'linear-gradient(135deg,#1a2a4a,#0f1a2e)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:20,color:'var(--text)',border:'2px solid rgba(100,120,180,0.4)'}}>OP</div>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:3,textTransform:'uppercase',color:'var(--muted2)'}}>Opponent</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:64,letterSpacing:2,color:'var(--text)',lineHeight:1}}>{oppScore}</div>
          <div style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)'}}>Points</div>
        </div>
      </div>

      {/* END OVERLAY */}
      {ended && (
        <div style={{position:'fixed',inset:0,background:'rgba(8,10,15,0.95)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,animation:'fadeUp 0.5s ease both'}}>
          <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:16,padding:'48px 56px',textAlign:'center',maxWidth:480,width:'90%',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,var(--red),transparent)'}}/>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:72,letterSpacing:6,lineHeight:1,marginBottom:8,color:draw?'var(--muted2)':myWin?'#22c55e':'var(--red)',textShadow:draw?'none':myWin?'0 0 40px rgba(34,197,94,0.4)':'0 0 40px var(--red-glow)'}}>{draw?'DRAW':myWin?'VICTORY':'DEFEAT'}</div>
            <div style={{fontSize:14,color:'var(--muted2)',marginBottom:36}}>{draw?'An equal battle — well played':myWin?'You outdueled your opponent':'Train harder and come back stronger'}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:24,marginBottom:16}}>
              {[[myScore,'You'],[oppScore,'Opponent']].map(([s,l],i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:64,letterSpacing:2,lineHeight:1}}>{s}</div>
                  <div style={{fontSize:12,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)'}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:22,letterSpacing:4,color:draw?'var(--muted2)':myWin?'#22c55e':'var(--red)',marginBottom:32}}>{draw?'+0':myWin?'+24':'−12'} Rating</div>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <button onClick={()=>{setCur(0);setMyScore(0);setOppScore(0);setSelected(null);setResults([]);setEnded(false);setMyStreak(0)}} style={{padding:'13px 28px',background:'var(--red)',border:'none',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:3,color:'white',cursor:'pointer'}}>Play Again</button>
              <button onClick={()=>navigate('/play')} style={{padding:'13px 28px',background:'transparent',border:'1px solid var(--border)',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:3,color:'var(--muted2)',cursor:'pointer'}}>Back to Modes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
