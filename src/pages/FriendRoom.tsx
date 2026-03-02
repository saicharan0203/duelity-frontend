import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Step = 'choose'|'create'|'join'|'countdown'

export default function FriendRoom() {
  const [step, setStep] = useState<Step>('choose')
  const [roomCode] = useState(() => Array.from({length:8},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join(''))
  const [joinCode, setJoinCode] = useState(Array(8).fill(''))
  const [countdown, setCountdown] = useState(3)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  function startCountdown() {
    setStep('countdown')
    let c = 3
    setCountdown(3)
    const i = setInterval(()=>{
      c--
      if (c <= 0) { clearInterval(i); navigate('/battle?mode=friend') }
      else setCountdown(c)
    }, 1000)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',position:'relative',overflow:'hidden'}}>
      <div className="bg-grid"/>
      <div className="orb" style={{width:500,height:500,background:'rgba(230,57,70,0.08)',top:-150,right:-100,animation:'pulse 7s ease-in-out infinite'}}/>
      <div className="orb" style={{width:300,height:300,background:'rgba(230,57,70,0.05)',bottom:-100,left:'10%',animation:'pulse 9s ease-in-out infinite reverse'}}/>

      <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:720,padding:'40px 24px',display:'flex',flexDirection:'column',alignItems:'center',animation:'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both'}}>

        {step==='choose' && (
          <>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:3,marginBottom:12}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:5,textTransform:'uppercase',color:'var(--red)',border:'1px solid rgba(230,57,70,0.3)',padding:'6px 16px',borderRadius:2,marginBottom:24}}>👥 Friend Match</div>
            <h1 style={{fontFamily:"'Bebas Neue'",fontSize:72,letterSpacing:2,lineHeight:0.95,textAlign:'center',marginBottom:16}}>Challenge a<br/><span style={{color:'var(--red)',textShadow:'0 0 40px var(--red-glow)'}}>Friend</span></h1>
            <p style={{fontSize:15,color:'var(--muted2)',textAlign:'center',lineHeight:1.7,marginBottom:40}}>Create a private room and share the code, or join using a code your friend sent you.</p>
            <div style={{display:'flex',alignItems:'center',gap:20,width:'100%'}}>
              {[['🏠','Create Room','Generate a code and wait for your friend',()=>setStep('create')],['🔑','Join Room','Enter a code from your friend to jump in',()=>setStep('join')]].map(([icon,name,sub,fn]: any,i)=>(
                <>
                  {i>0 && <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:4,color:'var(--muted)',flexShrink:0}}>OR</div>}
                  <div key={name} onClick={fn} style={{flex:1,background:'var(--panel)',border:'1px solid var(--border)',borderRadius:12,padding:'32px 28px',cursor:'pointer',transition:'all 0.25s',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:10}}>
                    <div style={{fontSize:40}}>{icon}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3}}>{name}</div>
                    <div style={{fontSize:13,color:'var(--muted2)',lineHeight:1.5}}>{sub}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:'var(--red)',marginTop:8}}>→</div>
                  </div>
                </>
              ))}
            </div>
          </>
        )}

        {step==='create' && (
          <>
            <div style={{width:'100%',textAlign:'center',background:'var(--panel)',border:'1px solid rgba(230,57,70,0.2)',borderRadius:12,padding:'32px 40px',marginBottom:24,position:'relative'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,var(--red),transparent)',borderRadius:'12px 12px 0 0'}}/>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:5,textTransform:'uppercase',color:'var(--muted)',marginBottom:16}}>Your Room Code</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:72,letterSpacing:12,color:'var(--red)',textShadow:'0 0 40px var(--red-glow)',lineHeight:1,marginBottom:20}}>{roomCode}</div>
              <div style={{display:'flex',gap:12,justifyContent:'center'}}>
                <button onClick={()=>{navigator.clipboard?.writeText(roomCode);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{padding:'10px 20px',background:'rgba(255,255,255,0.04)',border:`1px solid ${copied?'#22c55e':'var(--border)'}`,borderRadius:6,fontSize:13,color:copied?'#22c55e':'var(--muted2)',cursor:'pointer'}}>{copied?'✅ Copied!':'📋 Copy Code'}</button>
                <button style={{padding:'10px 20px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:6,fontSize:13,color:'var(--muted2)',cursor:'pointer'}}>🔗 Share Link</button>
              </div>
            </div>
            <div style={{width:'100%',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:10,marginBottom:24}}>
              <div style={{display:'flex',gap:10}}>
                {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:'50%',background:'var(--red)',animation:`wdotPulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
              </div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:3}}>Waiting for opponent to join...</div>
              <div style={{fontSize:13,color:'var(--muted)'}}>Share your room code or invite link</div>
              <button onClick={startCountdown} style={{marginTop:16,padding:'10px 24px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:4,fontSize:13,color:'var(--muted2)',cursor:'pointer'}}>▶ Simulate Friend Joining</button>
            </div>
            <button onClick={()=>setStep('choose')} style={{background:'none',border:'none',color:'var(--muted)',fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:3,textTransform:'uppercase',cursor:'pointer'}}>← Back</button>
          </>
        )}

        {step==='join' && (
          <>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:3,marginBottom:12}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:5,textTransform:'uppercase',color:'var(--red)',border:'1px solid rgba(230,57,70,0.3)',padding:'6px 16px',borderRadius:2,marginBottom:24}}>🔑 Join Room</div>
            <h1 style={{fontFamily:"'Bebas Neue'",fontSize:56,letterSpacing:2,marginBottom:8,textAlign:'center'}}>Enter the Code</h1>
            <p style={{fontSize:15,color:'var(--muted2)',textAlign:'center',marginBottom:40}}>Type the 8-character room code your friend shared with you.</p>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:32}}>
              {Array(8).fill(0).map((_,i)=>(
                <>
                  {i===4 && <div key="dash" style={{fontFamily:"'Bebas Neue'",fontSize:28,color:'var(--muted)'}}>—</div>}
                  <input key={i} id={`fci${i}`} maxLength={1} value={joinCode[i]} onChange={e=>{const v=e.target.value.toUpperCase();const c=[...joinCode];c[i]=v;setJoinCode(c);if(v&&i<7)document.getElementById(`fci${i+1}`)?.focus()}} style={{width:52,height:60,background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:6,textAlign:'center',fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,color:'var(--red)',outline:'none',textTransform:'uppercase'}}/>
                </>
              ))}
            </div>
            <button onClick={startCountdown} style={{padding:'16px 48px',background:'var(--red)',border:'none',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:4,color:'white',cursor:'pointer',marginBottom:16}}>Join Room →</button>
            <button onClick={()=>setStep('choose')} style={{background:'none',border:'none',color:'var(--muted)',fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:3,textTransform:'uppercase',cursor:'pointer'}}>← Back</button>
          </>
        )}

        {step==='countdown' && (
          <div style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:6,textTransform:'uppercase',color:'var(--red)'}}>Opponent Found</div>
            <div style={{display:'flex',alignItems:'center',gap:32,margin:'8px 0'}}>
              {[['Me','AK','linear-gradient(135deg,#e63946,#c1121f)','👑 Diamond'],['OP','RK','linear-gradient(135deg,#1a2a4a,#0f1a2e)','🥇 Gold']].map(([label,init,bg,tier],i)=>(
                <>
                  {i>0&&<div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:6,color:'var(--muted)'}}>VS</div>}
                  <div key={label} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                    <div style={{width:72,height:72,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:24,color:'white',border:'2px solid rgba(230,57,70,0.4)',boxShadow:'0 0 24px rgba(230,57,70,0.3)'}}>{init}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2}}>{label}</div>
                    <div style={{fontSize:14,color:'var(--muted2)'}}>{tier}</div>
                  </div>
                </>
              ))}
            </div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:120,letterSpacing:4,color:'var(--red)',textShadow:'0 0 60px var(--red-glow)',lineHeight:1,animation:'countPop 1s cubic-bezier(0.16,1,0.3,1) infinite'}} key={countdown}>{countdown}</div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:14,letterSpacing:4,textTransform:'uppercase',color:'var(--muted)'}}>Match starts in...</div>
          </div>
        )}
      </div>
    </div>
  )
}
