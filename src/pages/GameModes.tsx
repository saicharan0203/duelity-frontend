import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { connectSocket, getSocket } from '../services/socket'
import { useAuth } from '../contexts/AuthContext'

const MODES = [
  { icon:'🎯', name:'Practice', desc:'Train solo. Pick your difficulty and sharpen your skills.', d1:'Easy–Hard', d2:'No Limit', d3:'Not Affected', d4:'Solo' },
  { icon:'⚡', name:'Ranked', desc:'Compete for rating. Win to climb. Lose to fall. No mercy.', d1:'Auto-scaled', d2:'10 Seconds', d3:'±Rating', d4:'1v1 Competitive' },
  { icon:'🎲', name:'Casual', desc:'Quick match with a random player. Just for fun, no stakes.', d1:'Mixed', d2:'10 Seconds', d3:'Not Affected', d4:'1v1 Random' },
  { icon:'👥', name:'Friends', desc:'Create a room and challenge your friend with a private code.', d1:'Mixed', d2:'10 Seconds', d3:'Not Affected', d4:'1v1 Private' },
]

export default function GameModes() {
  const [active, setActive] = useState(0)
  const [orbitAngle, setOrbitAngle] = useState(-180)
  const [searching, setSearching] = useState(false)
  const nodesRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  function selectMode(index: number) {
    if (index === active) return
    const stepsClockwise = ((index - active) % 4 + 4) % 4
    const stepsCounter = (4 - stepsClockwise) % 4
    const delta = stepsClockwise <= stepsCounter ? -(stepsClockwise * 90) : stepsCounter * 90
    const newAngle = orbitAngle + delta
    setOrbitAngle(newAngle)
    setActive(index)
  }

  useEffect(() => {
    if (nodesRef.current) {
      nodesRef.current.style.transition = 'none'
      nodesRef.current.style.transform = `rotate(${orbitAngle}deg)`
    }
  }, [])

  useEffect(() => {
    if (nodesRef.current) {
      nodesRef.current.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)'
      nodesRef.current.style.transform = `rotate(${orbitAngle}deg)`
    }
  }, [orbitAngle])

  async function enterMode() {
    const m = MODES[active]
    if (m.name === 'Friends') { navigate('/friend'); return }
    if (m.name === 'Practice') { navigate('/battle?mode=practice'); return }
    if (!user) return
    setSearching(true)
    const socket = await connectSocket()
    socket.emit('joinMatchmaking', { userId: user.uid, mode: m.name.toLowerCase(), tier: profile?.tier || 'bronze' })
    socket.on('matchFound', (data: any) => {
      setSearching(false)
      navigate(`/battle?matchId=${data.matchId}&mode=${m.name.toLowerCase()}`)
    })
    setTimeout(() => { setSearching(false); navigate('/battle?mode='+m.name.toLowerCase()) }, 30000)
  }

  const m = MODES[active]

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',background:'var(--bg)',gap:0}}>
      <div className="bg-grid"/>
      <div className="orb" style={{width:600,height:600,background:'rgba(230,57,70,0.07)',top:-200,left:-200,animation:'pulse 7s ease-in-out infinite'}}/>
      <div className="orb" style={{width:400,height:400,background:'rgba(230,57,70,0.05)',bottom:-150,right:-100,animation:'pulse 9s ease-in-out infinite reverse'}}/>

      {/* Header */}
      <div style={{position:'relative',zIndex:2,textAlign:'center',marginBottom:24}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:6,textTransform:'uppercase',color:'var(--muted)',marginTop:4}}>Choose Your Battle</div>
      </div>

      {/* Orbital Arena */}
      <div style={{position:'relative',zIndex:2,width:480,height:480,display:'flex',alignItems:'center',justifyContent:'center',marginTop:20}}>
        {/* Orbit rings */}
        <div style={{position:'absolute',width:380,height:380,borderRadius:'50%',border:'1px solid rgba(230,57,70,0.15)',animation:'orbitSpin 30s linear infinite'}}/>
        <div style={{position:'absolute',width:340,height:340,borderRadius:'50%',border:'1px dashed rgba(255,255,255,0.04)',animation:'orbitSpin 20s linear infinite reverse'}}/>

        {/* Orbit dots */}
        {[45,135,225,315].map(a=>(
          <div key={a} style={{position:'absolute',width:5,height:5,background:'rgba(230,57,70,0.4)',borderRadius:'50%',top:'50%',left:'50%',transform:`rotate(${a}deg) translateX(190px) translateY(-50%)`,boxShadow:'0 0 6px rgba(230,57,70,0.6)'}}/>
        ))}

        {/* Centre */}
        <div style={{position:'absolute',width:200,height:200,background:'var(--panel)',border:'1px solid rgba(230,57,70,0.3)',borderRadius:'50%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',zIndex:3,boxShadow:'0 0 60px rgba(230,57,70,0.12), inset 0 0 40px rgba(0,0,0,0.4)',padding:20,top:'50%',left:'50%',transform:'translate(-50%,-35%)'}}>
          <div style={{fontSize:32,marginBottom:6,animation:'iconPop 0.4s cubic-bezier(0.16,1,0.3,1)'}} key={active}>{m.icon}</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:3,color:'var(--red)',lineHeight:1,marginBottom:6}}>{m.name}</div>
          <div style={{fontSize:10,color:'var(--muted2)',lineHeight:1.4,marginBottom:10}}>{m.desc}</div>
          {searching ? (
            <div style={{fontSize:11,color:'var(--muted)',letterSpacing:2}}>SEARCHING...</div>
          ) : (
            <button onClick={enterMode} style={{padding:'7px 16px',background:'var(--red)',border:'none',borderRadius:3,fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:'white',cursor:'pointer'}}>Enter Mode →</button>
          )}
        </div>

        {/* Nodes */}
        <div ref={nodesRef} style={{position:'absolute',width:380,height:380}}>
          {MODES.map((mode,i)=>{
            const positions = [
              {top:'50%',left:'50%',transform:`translate(-50%,-50%) translateY(-190px)`},
              {top:'50%',left:'50%',transform:`translate(-50%,-50%) translateX(190px)`},
              {top:'50%',left:'50%',transform:`translate(-50%,-50%) translateY(190px)`},
              {top:'50%',left:'50%',transform:`translate(-50%,-50%) translateX(-190px)`},
            ]
            const pos = positions[i]
            const isActive = i === active
            return (
              <div key={mode.name} onClick={()=>selectMode(i)} style={{position:'absolute',width:isActive?100:84,height:isActive?100:84,background:isActive?'rgba(230,57,70,0.12)':'var(--panel)',border:`1px solid ${isActive?'var(--red)':'var(--border)'}`,borderRadius:'50%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)',opacity:isActive?1:0.4,boxShadow:isActive?'0 0 32px rgba(230,57,70,0.4)':'none',...pos}}>
                <div style={{fontSize:26,marginBottom:3,transform:`rotate(${-orbitAngle}deg)`,transition:'transform 0.7s cubic-bezier(0.16,1,0.3,1)'}}>{mode.icon}</div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:2,textTransform:'uppercase',color:isActive?'var(--red)':'var(--muted2)',transform:`rotate(${-orbitAngle}deg)`,transition:'transform 0.7s cubic-bezier(0.16,1,0.3,1)'}}>{mode.name}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail strip */}
      <div style={{display:'flex',alignItems:'center',background:'var(--panel)',border:'1px solid var(--border)',borderRadius:8,padding:'16px 32px',position:'relative',zIndex:2,marginTop:20,animation:'fadeUp 0.4s ease both'}}>
        {[[m.d1,'Difficulty'],[m.d2,'Time Per Question'],[m.d3,'Rating'],[m.d4,'Mode']].map(([val,key],i)=>(
          <div key={key} style={{display:'flex',alignItems:'center',gap:0}}>
            {i>0 && <div style={{width:1,height:40,background:'var(--border)',margin:'0 0'}}/>}
            <div style={{textAlign:'center',padding:'0 24px'}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:2,color:'var(--red)',marginBottom:4}}>{val}</div>
              <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--muted)'}}>{key}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
