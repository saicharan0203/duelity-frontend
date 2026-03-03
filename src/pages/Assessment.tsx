import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const QUESTIONS = [
  {q:"What is 15 × 8?", opts:["100","120","110","130"], ans:"120", d:1},
  {q:"Solve: x + 14 = 31", opts:["17","15","18","16"], ans:"17", d:1},
  {q:"What is 25% of 200?", opts:["40","50","60","25"], ans:"50", d:1},
  {q:"What is √144?", opts:["11","14","12","13"], ans:"12", d:2},
  {q:"If 3x − 7 = 14, what is x?", opts:["5","7","9","3"], ans:"7", d:2},
  {q:"What is 12² − 5²?", opts:["109","119","99","129"], ans:"119", d:2},
  {q:"Simplify: (2³ × 2⁴) ÷ 2²", opts:["32","16","64","8"], ans:"32", d:3},
  {q:"A train covers 240km in 3hrs. Speed in km/h?", opts:["70","80","90","60"], ans:"80", d:3},
  {q:"What is 3! + 4!?", opts:["24","30","36","18"], ans:"30", d:3},
  {q:"Find x: 2x² − 8 = 0", opts:["x=±4","x=±2","x=±3","x=±1"], ans:"x=±2", d:3},
]

export default function Assessment() {
  const [phase, setPhase] = useState<'intro'|'quiz'|'result'>('intro')
  const [cur, setCur] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [timings, setTimings] = useState<number[]>([])
  const [selected, setSelected] = useState<string|null>(null)
  const [qStart, setQStart] = useState(Date.now())
  const [tier, setTier] = useState<any>(null)
  const navigate = useNavigate()
  const { firebaseUser: user } = useAuth()

  function startQuiz() { setPhase('quiz'); setQStart(Date.now()) }

  function selectOpt(opt: string) {
    if (selected !== null) return
    setSelected(opt)
    setTimings(t => [...t, (Date.now()-qStart)/1000])
    setAnswers(a => [...a, opt])
  }

  function nextQ() {
    if (cur + 1 >= QUESTIONS.length) { showResult(); return }
    setCur(c => c+1); setSelected(null); setQStart(Date.now())
  }

  function showResult() {
    const correct = answers.filter((a,i) => a === QUESTIONS[i].ans).length
    const accuracy = correct / QUESTIONS.length
    const avgTime = timings.reduce((a,b)=>a+b,0) / timings.length
    let t
    if (accuracy >= 0.9 && avgTime < 15) t = {label:'👑 Diamond', pts:800, color:'#f59e0b', desc:"You're elite. Welcome to the top."}
    else if (accuracy >= 0.7) t = {label:'🥇 Gold', pts:600, color:'#e63946', desc:"Strong skills. You're ready to climb."}
    else if (accuracy >= 0.5) t = {label:'🥈 Silver', pts:400, color:'#9ca3af', desc:"Solid foundation. Keep grinding."}
    else t = {label:'🥉 Bronze', pts:200, color:'#cd7f32', desc:"Everyone starts somewhere. Let's go."}
    const totalTime = timings.reduce((a,b)=>a+b,0)
    setTier({...t, correct, accuracy: Math.round(accuracy*100), totalTime: Math.round(totalTime)})
    setPhase('result')
    // Save to backend
    if (user) {
      api.post('/api/auth/complete-assessment', {
        correct,
        timeSecs: Math.max(1, Math.round(totalTime)),
      }).catch(console.error)
    }
  }

  const q = QUESTIONS[cur]
  const LABELS = ['','Easy','Medium','Hard']

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',background:'var(--bg)'}}>
      <div className="bg-grid"/>
      <div className="orb" style={{width:500,height:500,background:'rgba(230,57,70,0.1)',top:-150,right:-100,animation:'pulse 6s ease-in-out infinite'}}/>
      <div className="orb" style={{width:300,height:300,background:'rgba(230,57,70,0.05)',bottom:-100,left:'20%',animation:'pulse 8s ease-in-out infinite reverse'}}/>

      {phase==='intro' && (
        <div style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:680,padding:'40px 24px',animation:'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both'}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:42,letterSpacing:3,marginBottom:8}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
          <div style={{display:'inline-block',fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:5,textTransform:'uppercase',color:'var(--red)',border:'1px solid rgba(230,57,70,0.3)',padding:'6px 16px',borderRadius:2,marginBottom:28}}>⚡ Skill Assessment</div>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:'clamp(60px,8vw,96px)',lineHeight:0.95,letterSpacing:2,marginBottom:24}}>
            Let's See<br/><span style={{color:'var(--red)',textShadow:'0 0 60px rgba(230,57,70,0.4)'}}>What You've Got</span>
          </h1>
          <p style={{fontSize:16,color:'var(--muted2)',lineHeight:1.8,marginBottom:40}}>10 math questions. No timer — take your time.<br/>We'll place you in the right tier based on your accuracy and speed.</p>
          <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:40,flexWrap:'wrap'}}>
            {[['🥉 Bronze','#cd7f32','200 pts'],['🥈 Silver','#9ca3af','400 pts'],['🥇 Gold','#e63946','600 pts'],['👑 Diamond','#f59e0b','800 pts']].map(([name,color,pts])=>(
              <div key={name} style={{background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:6,padding:'16px 20px',minWidth:100,textAlign:'center'}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,fontWeight:700,marginBottom:4,color}}>{name}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{pts}</div>
              </div>
            ))}
          </div>
          <button onClick={startQuiz} style={{padding:'18px 48px',background:'var(--red)',border:'none',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:4,color:'white',cursor:'pointer'}}>Start Assessment →</button>
          <p style={{marginTop:16,fontSize:12,color:'var(--muted)'}}>Takes about 3–5 minutes</p>
        </div>
      )}

      {phase==='quiz' && (
        <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:720,padding:'40px 24px',animation:'fadeUp 0.4s ease both'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:14,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)'}}>Question {cur+1} of {QUESTIONS.length}</div>
          </div>
          <div style={{width:'100%',height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,marginBottom:24,overflow:'hidden'}}>
            <div style={{height:'100%',background:'var(--red)',borderRadius:2,transition:'width 0.5s',width:`${(cur/QUESTIONS.length)*100}%`,boxShadow:'0 0 10px rgba(230,57,70,0.6)'}}/>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:32}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:i<q.d?'var(--red)':'rgba(255,255,255,0.1)'}}/>)}
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginLeft:6}}>{LABELS[q.d]}</span>
          </div>
          <div style={{marginBottom:36}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:4,color:'var(--red)',marginBottom:12}}>Q{cur+1}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:'clamp(32px,5vw,52px)',lineHeight:1.1,letterSpacing:1}}>{q.q}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
            {q.opts.map((opt,i)=>{
              let bg='rgba(255,255,255,0.03)', border='1px solid var(--border)', opacity=1
              if (selected !== null) {
                if (opt === q.ans) { bg='rgba(34,197,94,0.1)'; border='1px solid rgba(34,197,94,0.4)' }
                else if (opt === selected && opt !== q.ans) { bg='rgba(230,57,70,0.1)'; border='1px solid rgba(230,57,70,0.4)' }
                else { opacity=0.35 }
              }
              return (
                <button key={opt} onClick={()=>selectOpt(opt)} disabled={selected!==null} style={{position:'relative',display:'flex',alignItems:'center',gap:14,padding:'18px 20px',background:bg,border,borderRadius:6,color:'var(--text)',fontSize:16,fontWeight:500,cursor:selected?'default':'pointer',textAlign:'left',transition:'all 0.2s',opacity}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:18,color:'var(--muted)',minWidth:20}}>{String.fromCharCode(65+i)}</span>
                  <span style={{flex:1}}>{opt}</span>
                  {selected && opt===q.ans && <span style={{color:'#22c55e',fontWeight:'bold'}}>✓</span>}
                  {selected && opt===selected && opt!==q.ans && <span style={{color:'var(--red)',fontWeight:'bold'}}>✗</span>}
                </button>
              )
            })}
          </div>
          {selected && (
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button onClick={nextQ} style={{padding:'14px 32px',background:'var(--red)',border:'none',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:3,color:'white',cursor:'pointer'}}>
                {cur+1===QUESTIONS.length?'See My Results →':'Next Question →'}
              </button>
            </div>
          )}
        </div>
      )}

      {phase==='result' && tier && (
        <div style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:600,padding:'40px 24px',animation:'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both'}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3,marginBottom:32}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
          <div style={{display:'inline-block',fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:5,textTransform:'uppercase',color:'var(--muted)',border:'1px solid var(--border)',padding:'6px 16px',borderRadius:2,marginBottom:24}}>Assessment Complete</div>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:48,letterSpacing:3,color:'var(--muted)',marginBottom:8}}>You Are A</h1>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:'clamp(64px,10vw,96px)',letterSpacing:3,lineHeight:1,marginBottom:8,color:tier.color,animation:'tierPop 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both'}}>{tier.label}</div>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:20,letterSpacing:4,marginBottom:12,color:tier.color}}>+{tier.pts} Starting Points</div>
          <p style={{fontSize:15,color:'var(--muted2)',marginBottom:36,lineHeight:1.6}}>{tier.desc}</p>
          <div style={{display:'flex',justifyContent:'center',gap:48,padding:28,background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)',borderRadius:8}}>
            {[[`${tier.correct}/10`,'Correct'],[`${tier.totalTime}s`,'Total Time'],[`${tier.accuracy}%`,'Accuracy']].map(([num,label])=>(
              <div key={label}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:42,letterSpacing:2,lineHeight:1}}>{num}</div>
                <div style={{fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginTop:6}}>{label}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>navigate('/college')} style={{marginTop:40,padding:'18px 48px',background:'var(--red)',border:'none',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:4,color:'white',cursor:'pointer'}}>Enter the Arena →</button>
        </div>
      )}
    </div>
  )
}