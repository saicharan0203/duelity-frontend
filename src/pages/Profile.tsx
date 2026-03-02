import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'

const RECENT = [
  {opp:'RajKumar99',oppTier:'🥇',result:'win',myScore:90,oppScore:60,rating:'+18',mode:'Ranked',time:'2 hrs ago'},
  {opp:'MathStar23',oppTier:'🥇',result:'loss',myScore:50,oppScore:80,rating:'-10',mode:'Ranked',time:'5 hrs ago'},
  {opp:'QuizMaster',oppTier:'💎',result:'win',myScore:100,oppScore:70,rating:'+22',mode:'Ranked',time:'Yesterday'},
  {opp:'ZeroSec',oppTier:'👑',result:'loss',myScore:60,oppScore:90,rating:'-14',mode:'Ranked',time:'Yesterday'},
  {opp:'BrainGod',oppTier:'🥇',result:'win',myScore:80,oppScore:50,rating:'+16',mode:'Casual',time:'2 days ago'},
]

const TIER_COLORS: Record<string,string> = {diamond:'#f59e0b',platinum:'#60a5fa',gold:'#e63946',silver:'#9ca3af',bronze:'#cd7f32'}
const TIER_ICONS: Record<string,string> = {diamond:'👑',platinum:'💎',gold:'🥇',silver:'🥈',bronze:'🥉'}

export default function Profile() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const tier = (profile?.tier||'bronze').toLowerCase()
  const tierColor = TIER_COLORS[tier]||'#cd7f32'
  const tierIcon = TIER_ICONS[tier]||'🥉'
  const initials = (profile?.name||'U').split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2)
  const wins = profile?.wins||61
  const losses = profile?.losses||23
  const total = profile?.totalMatches||84
  const winRate = total>0?Math.round((wins/total)*100):73
  const accuracy = profile?.accuracy||78
  const rating = profile?.rating||1240

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)',position:'relative'}}>
      <div className="bg-grid" style={{opacity:0.3}}/>

      {/* Sidebar */}
      <aside style={{width:240,background:'var(--panel)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',padding:'32px 20px',position:'sticky',top:0,height:'100vh',flexShrink:0,zIndex:1}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:3,marginBottom:40}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
        <nav style={{display:'flex',flexDirection:'column',gap:4,flex:1}}>
          {[['⚡','Dashboard','/dashboard'],['🎮','Play','/play'],['🏆','Leaderboard','/leaderboard'],['👤','Profile','/profile'],['⚙️','Settings','#']].map(([icon,label,path])=>(
            <a key={label} onClick={()=>path!=='#'&&navigate(path)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:6,color:path==='/profile'?'var(--red)':'var(--muted2)',fontSize:14,fontWeight:500,cursor:'pointer',background:path==='/profile'?'rgba(230,57,70,0.1)':'none',border:path==='/profile'?'1px solid rgba(230,57,70,0.2)':'1px solid transparent',transition:'all 0.2s'}}>
              <span style={{fontSize:16}}>{icon}</span>{label}
            </a>
          ))}
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:14,background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:8,marginBottom:16}}>
          <div style={{width:38,height:38,background:'linear-gradient(135deg,#e63946,#c1121f)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:16,color:'white',flexShrink:0}}>{initials}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.name||'User'}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{profile?.college?.name||'No college'}</div>
          </div>
          <div style={{fontSize:18,color:tierColor}}>{tierIcon}</div>
        </div>
        <button onClick={()=>signOut(auth)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:12,letterSpacing:2,fontFamily:"'Barlow Condensed'",textTransform:'uppercase',cursor:'pointer',padding:'8px 0',textAlign:'left'}}>← Logout</button>
      </aside>

      <main style={{flex:1,padding:'36px 40px',overflowY:'auto',position:'relative',zIndex:1}}>
        {!editing ? (
          <>
            {/* Hero */}
            <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:16,padding:'36px 40px',display:'flex',alignItems:'center',gap:32,marginBottom:24,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,#f59e0b,transparent)'}}/>
              <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',filter:'blur(80px)',background:'rgba(245,158,11,0.07)',top:-100,right:-50,pointerEvents:'none'}}/>
              <div style={{position:'relative',flexShrink:0}}>
                <div style={{width:100,height:100,borderRadius:'50%',background:'linear-gradient(135deg,#e63946,#c1121f)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:3,color:'white',border:'3px solid rgba(245,158,11,0.5)',boxShadow:'0 0 40px rgba(230,57,70,0.3)',position:'relative',zIndex:1}}>{initials}</div>
                <div style={{position:'absolute',inset:-6,borderRadius:'50%',border:'2px solid rgba(245,158,11,0.3)',animation:'orbitSpin 8s linear infinite'}}/>
                <div style={{position:'absolute',bottom:0,right:0,fontSize:22,zIndex:2,filter:'drop-shadow(0 0 8px rgba(245,158,11,0.6))'}}>{tierIcon}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:48,letterSpacing:3,lineHeight:1,marginBottom:6}}>{profile?.name||'Arjun Kumar'}</div>
                <div style={{fontSize:13,color:'var(--muted2)',marginBottom:8}}>🏫 {profile?.college?.name||'IIT Bombay'} &nbsp;•&nbsp; 🇮🇳 India</div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,letterSpacing:3,textTransform:'uppercase',marginBottom:12,color:tierColor}}>{tierIcon} {tier.charAt(0).toUpperCase()+tier.slice(1)} Tier</div>
                <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:14}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:44,letterSpacing:2,lineHeight:1}}>{rating.toLocaleString()}</div>
                  <div style={{fontSize:12,color:'var(--muted)',letterSpacing:2}}>Rating Points</div>
                  <div style={{fontSize:12,color:'#22c55e',background:'rgba(34,197,94,0.1)',borderRadius:3,padding:'3px 8px'}}>▲ +124 this week</div>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:2,background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:20,padding:'5px 14px',color:'var(--muted2)'}}>🇮🇳 India #342</div>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:2,background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:20,padding:'5px 14px',color:'var(--muted2)'}}>🏫 College #4</div>
                </div>
              </div>
              <button onClick={()=>setEditing(true)} style={{padding:'10px 20px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:6,fontSize:13,fontWeight:500,color:'var(--muted2)',cursor:'pointer',alignSelf:'flex-start',whiteSpace:'nowrap',marginLeft:'auto'}}>✏️ Edit Profile</button>
            </div>

            {/* Stats grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:28}}>
              {[['🎮','var(--text)',total,'Matches Played'],['🏆','#22c55e',wins,'Wins'],['💀','var(--red)',losses,'Losses'],['🎯','#f59e0b',winRate+'%','Win Rate'],['📐','#60a5fa',accuracy+'%','Accuracy'],['🔥','var(--red)',7,'Best Streak']].map(([icon,color,val,lbl])=>(
                <div key={lbl} style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:10,padding:'20px 16px',textAlign:'center'}}>
                  <div style={{fontSize:22,marginBottom:8,color}}>{icon}</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:2,lineHeight:1,marginBottom:4,color}}>{val}</div>
                  <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--muted)'}}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Recent matches */}
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:3,marginBottom:14}}>Recent Matches</div>
              <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
                {RECENT.map((m,i)=>(
                  <div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr 140px 90px 100px',alignItems:'center',padding:'14px 20px',borderBottom:i<RECENT.length-1?'1px solid rgba(255,255,255,0.03)':'none'}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:2,padding:'4px 10px',borderRadius:3,textAlign:'center',color:m.result==='win'?'#22c55e':'var(--red)',background:m.result==='win'?'rgba(34,197,94,0.1)':'rgba(230,57,70,0.1)'}}>{m.result==='win'?'✓ WIN':'✗ LOSS'}</div>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#1a2a3a,#0d1520)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:13,flexShrink:0}}>{m.opp.slice(0,2).toUpperCase()}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600}}>{m.opp} {m.oppTier}</div>
                        <div style={{fontSize:11,color:'var(--muted)'}}>{m.mode}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2}}>
                      <span>{m.myScore}</span><span style={{color:'var(--muted)',fontSize:16}}>—</span><span style={{color:'var(--muted2)'}}>{m.oppScore}</span>
                    </div>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:15,letterSpacing:2,fontWeight:600,color:m.result==='win'?'#22c55e':'var(--red)'}}>{m.rating} pts</div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>{m.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{maxWidth:560,background:'var(--panel)',border:'1px solid var(--border)',borderRadius:16,padding:40,animation:'fadeUp 0.3s ease both',position:'relative'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,var(--red),transparent)',borderRadius:'16px 16px 0 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:3}}>Edit Profile</div>
              <button onClick={()=>setEditing(false)} style={{background:'none',border:'1px solid var(--border)',borderRadius:4,padding:'6px 14px',fontSize:13,color:'var(--muted)',cursor:'pointer'}}>✕ Cancel</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,marginBottom:28}}>
              <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#e63946,#c1121f)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:28,color:'white'}}>{initials}</div>
              <div style={{fontSize:12,color:'var(--muted)'}}>Avatar is generated from your initials</div>
            </div>
            {[['Full Name','text',profile?.name||''],['Email','email',profile?.email||'']].map(([lbl,type,val])=>(
              <div key={lbl} style={{marginBottom:20}}>
                <label style={{display:'block',fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>{lbl}</label>
                <input type={type} defaultValue={val} disabled={type==='email'} style={{width:'100%',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:6,padding:'13px 16px',fontSize:15,color:'var(--text)',outline:'none',opacity:type==='email'?0.5:1}}/>
                {type==='email'&&<div style={{fontSize:11,color:'var(--muted)',marginTop:4}}>Email cannot be changed</div>}
              </div>
            ))}
            <div style={{display:'flex',gap:12,marginTop:28}}>
              <button onClick={()=>setEditing(false)} style={{flex:1,padding:14,background:'var(--red)',border:'none',borderRadius:6,fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:3,color:'white',cursor:'pointer'}}>Save Changes</button>
              <button onClick={()=>setEditing(false)} style={{padding:'14px 24px',background:'transparent',border:'1px solid var(--border)',borderRadius:6,fontSize:14,color:'var(--muted2)',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
