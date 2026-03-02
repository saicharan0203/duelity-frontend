import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const QUESTIONS = [
  {q:"What is 17 × 6?", opts:["92","102","112","98"], ans:"102"},
  {q:"Solve: 2x + 5 = 19", opts:["5","6","7","8"], ans:"7"},
  {q:"What is 15% of 300?", opts:["35","40","45","50"], ans:"45"},
  {q:"√225 = ?", opts:["13","14","15","16"], ans:"15"},
  {q:"What is 8³?", opts:["512","612","412","482"], ans:"512"},
  {q:"If 5x − 3 = 22, x = ?", opts:["4","5","6","7"], ans:"5"},
  {q:"What is 144 ÷ 12 × 3?", opts:["36","48","32","54"], ans:"36"},
  {q:"Simplify: 3² + 4²", opts:["20","25","30","35"], ans:"25"},
  {q:"A car goes 180km in 2hrs. Speed?", opts:["80","85","90","95"], ans:"90"},
  {q:"What is 11² − 9²?", opts:["38","40","42","44"], ans:"40"},
]

export default function Battle() {
  const [cur, setCur] = useState(0)
  const [myScore, setMyScore] = useState(0)
  const [oppScore, setOppScore] = useState(0)
  const [selected, setSelected] = useState<string|null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [results, setResults] = useState<string[]>([])
  const [ended, setEnded] = useState(false)
  const [myStreak, setMyStreak] = useState(0)
  const timerRef = useRef<any>(null)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode = params.get('mode') || 'ranked'

  useEffect(() => { startTimer(); return ()=>clearInterval(timerRef.current) }, [cur])

  function startTimer() {
    clearInterval(timerRef.current)
    setTimeLeft(10)
    timerRef.current = setInterval(()=>{
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); timeUp(); return 0 }
        return t - 1
      })
    }, 1000)
    // Simulate opponent
    const oppDelay = (Math.random() * 5 + 3) * 1000
    setTimeout(()=>{ setOppScore(s => s + (Math.random()>0.35?10:0)) }, oppDelay)
  }

  function selectAnswer(opt: string) {
    if (selected) return
    clearInterval(timerRef.current)
    setSelected(opt)
    const correct = opt === QUESTIONS[cur].ans
    if (correct) { setMyScore(s=>s+10); setMyStreak(s=>s+1) } else { setMyStreak(0) }
    setResults(r=>[...r, correct?'win':'loss'])
    setTimeout(()=>advance(), 1800)
  }

  function timeUp() {
    if (selected) return
    setSelected('__timeout__')
    setMyStreak(0)
    setResults(r=>[...r,'loss'])
    setTimeout(()=>advance(), 1800)
  }

  function advance() {
    if (cur + 1 >= QUESTIONS.length) { setEnded(true); return }
    setCur(c=>c+1); setSelected(null)
  }

  const q = QUESTIONS[cur]
  const myWin = myScore > oppScore, draw = myScore === oppScore

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'var(--bg)',position:'relative',overflow:'hidden'}}>
      <div className="bg-grid" style={{opacity:0.5}}/>

      {/* TOP BAR */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',position:'relative',zIndex:2,borderBottom:'1px solid var(--border)'}}>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:4,textTransform:'uppercase',color:'var(--red)',border:'1px solid rgba(230,57,70,0.3)',padding:'5px 14px',borderRadius:2}}>⚡ {mode.toUpperCase()} MATCH</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:3,color:'var(--muted2)'}}>Q {cur+1} / 10</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:2,color:timeLeft<=3?'#ff4444':'var(--red)',minWidth:40,textAlign:'right'}}>{timeLeft}</div>
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
            <div style={{fontFamily:"'Bebas Neue'",fontSize:'clamp(28px,4vw,44px)',letterSpacing:2,color:'var(--text)',lineHeight:1.2}}>{q.q}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,width:'100%'}}>
            {q.opts.map((opt,i)=>{
              let bg='rgba(255,255,255,0.03)', border='1px solid var(--border)', opacity=1
              if (selected) {
                if (opt===q.ans) { bg='rgba(34,197,94,0.12)'; border='1px solid #22c55e' }
                else if (opt===selected) { bg='rgba(230,57,70,0.1)'; border='1px solid rgba(230,57,70,0.5)' }
                else opacity=0.3
              }
              return (
                <button key={opt} onClick={()=>selectAnswer(opt)} disabled={!!selected} style={{padding:'14px 20px',background:bg,border,borderRadius:8,display:'flex',alignItems:'center',gap:12,color:'var(--text)',fontSize:15,fontWeight:500,cursor:selected?'default':'pointer',transition:'all 0.2s',textAlign:'left',opacity}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:18,color:opt===q.ans&&selected?'#22c55e':'var(--muted)',minWidth:20}}>{String.fromCharCode(65+i)}</span>
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

      {/* DOTS */}
      <div style={{padding:'12px 32px 20px',display:'flex',justifyContent:'center',position:'relative',zIndex:2}}>
        <div style={{display:'flex',gap:8}}>
          {QUESTIONS.map((_,i)=>(
            <div key={i} style={{width:28,height:6,borderRadius:3,background:i<results.length?(results[i]==='win'?'#22c55e':'var(--red)'):i===cur?'var(--red)':'rgba(255,255,255,0.08)',boxShadow:i===cur?'0 0 8px rgba(230,57,70,0.4)':'none',animation:i===cur?'dotPulse 1s ease-in-out infinite':'none'}}/>
          ))}
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
