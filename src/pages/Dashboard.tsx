import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import api from '../services/api'

const TIER_COLORS: Record<string,string> = {diamond:'#f59e0b',platinum:'#60a5fa',gold:'#e63946',silver:'#9ca3af',bronze:'#cd7f32'}
const TIER_ICONS: Record<string,string> = {diamond:'👑',platinum:'💎',gold:'🥇',silver:'🥈',bronze:'🥉'}

export default function Dashboard() {
  const { profile } = useAuth()
  const [indiaRank, setIndiaRank] = useState<number | null>(null)
  const [collegeRank, setCollegeRank] = useState<number | null>(null)
  const navigate = useNavigate()
  const tier = (profile?.tier || 'bronze').toLowerCase()
  const tierColor = TIER_COLORS[tier] || '#cd7f32'
  const tierIcon = TIER_ICONS[tier] || '🥉'
  const initials = (profile?.name || 'U').split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2)
  const wins = profile?.wins || 0
  const losses = profile?.losses || 0
  const totalMatches = profile?.totalMatches || 0
  const winRate = totalMatches > 0 ? Math.round((wins/totalMatches)*100) : 0
  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening'
  const circumference = 2 * Math.PI * 50
  const dashArr = (winRate / 100) * circumference

  useEffect(() => {
    let cancelled = false
    async function loadRanks() {
      try {
        const res = await api.get('/api/users/me')
        if (cancelled) return
        setIndiaRank(res.data.indiaRank ?? null)
        setCollegeRank(res.data.collegeRank ?? null)
      } catch {
        // ignore rank errors; keep placeholders
      }
    }
    loadRanks()
    return () => { cancelled = true }
  }, [])

  const Sidebar = () => (
    <aside style={{width:240,background:'var(--panel)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',padding:'32px 20px',position:'sticky',top:0,height:'100vh',flexShrink:0}}>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:3,marginBottom:40}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
      <nav style={{display:'flex',flexDirection:'column',gap:4,flex:1}}>
        {[['⚡','Dashboard','/dashboard'],['🎮','Play','/play'],['🏆','Leaderboard','/leaderboard'],['👤','Profile','/profile'],['⚙️','Settings','#']].map(([icon,label,path])=>(
          <a key={label} onClick={()=>path!=='#'&&navigate(path)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:6,color:path==='/dashboard'?'var(--red)':'var(--muted2)',fontSize:14,fontWeight:500,cursor:'pointer',background:path==='/dashboard'?'rgba(230,57,70,0.1)':'none',border:path==='/dashboard'?'1px solid rgba(230,57,70,0.2)':'1px solid transparent',transition:'all 0.2s',textDecoration:'none'}}>
            <span style={{fontSize:16}}>{icon}</span>{label}
          </a>
        ))}
      </nav>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:14,background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:8,marginBottom:16}}>
        <div style={{width:38,height:38,background:'linear-gradient(135deg,#e63946,#c1121f)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:16,color:'white',flexShrink:0}}>{initials}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.name || 'User'}</div>
          <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{profile?.college?.name || 'No college'}</div>
        </div>
        <div style={{fontSize:18,color:tierColor}}>{tierIcon}</div>
      </div>
      <button onClick={()=>signOut(auth)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:12,letterSpacing:2,fontFamily:"'Barlow Condensed'",textTransform:'uppercase',cursor:'pointer',padding:'8px 0',textAlign:'left',transition:'color 0.2s'}}>← Logout</button>
    </aside>
  )

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <Sidebar/>
      <main style={{flex:1,padding:'36px 40px',overflowY:'auto',position:'relative'}}>
        <div className="bg-grid" style={{opacity:0.5}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32,position:'relative',zIndex:1}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:2,lineHeight:1}}>{greeting}, {(profile?.name||'User').split(' ')[0]} 👋</div>
            <div style={{fontSize:12,color:'var(--muted)',letterSpacing:2,marginTop:4}}>{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
          </div>
          <button onClick={()=>navigate('/play')} style={{padding:'14px 32px',background:'var(--red)',border:'none',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:3,color:'white',cursor:'pointer'}}>⚡ Play Now</button>
        </div>

        {/* STATS ROW */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16,marginBottom:24,position:'relative',zIndex:1}}>
          {[
            ['👑',tierIcon+' '+tier.charAt(0).toUpperCase()+tier.slice(1),'Current Tier',tierColor],
            ['⚡',profile?.rating||1000,'Rating Points','var(--red)'],
            ['🎯',(profile?.accuracy||0)+'%','Accuracy','#22c55e'],
            ['🎮',totalMatches,'Total Matches','var(--muted2)'],
            ['🔥',`${wins} / ${losses}`,'Wins / Losses','var(--red)'],
          ].map(([icon,val,label,color]: any)=>(
            <div key={label} style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:8,padding:'20px 16px',textAlign:'center'}}>
              <div style={{fontSize:22,marginBottom:8,color}}>{icon}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,lineHeight:1,marginBottom:4,color}}>{val}</div>
              <div style={{fontSize:11,letterSpacing:2,textTransform:'uppercase',color:'var(--muted)'}}>{label}</div>
            </div>
          ))}
        </div>

        {/* MID ROW */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 200px',gap:16,marginBottom:24,position:'relative',zIndex:1}}>
          <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:8,padding:24}}>
            <div style={{fontSize:12,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginBottom:12}}>🇮🇳 India Rank</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:56,letterSpacing:2,lineHeight:1,color:'var(--red)',textShadow:'0 0 30px var(--red-glow)',marginBottom:4}}>
              {indiaRank ? `#${indiaRank}` : '#—'}
            </div>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:16}}>
              {indiaRank ? 'Your current position in India' : 'Play ranked to get your rank'}
            </div>
            <div style={{width:'100%',height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
              <div style={{height:'100%',width:'0%',background:'var(--red)',borderRadius:2}}/>
            </div>
          </div>
          <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:8,padding:24}}>
            <div style={{fontSize:12,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginBottom:12}}>🏫 College Rank</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:56,letterSpacing:2,lineHeight:1,color:'#f59e0b',textShadow:'0 0 30px rgba(245,158,11,0.3)',marginBottom:4}}>
              {collegeRank ? `#${collegeRank}` : '#—'}
            </div>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:16}}>
              {profile?.college?.name || 'No college selected'}
            </div>
            <div style={{width:'100%',height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
              <div style={{height:'100%',width:'0%',background:'#f59e0b',borderRadius:2}}/>
            </div>
          </div>
          <div style={{background:'var(--panel)',border:'1px solid var(--border)',borderRadius:8,padding:24,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:12,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginBottom:12,alignSelf:'flex-start'}}>Win Rate</div>
            <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',marginTop:12}}>
              <svg viewBox="0 0 120 120" width="110" height="110" style={{transform:'rotate(-90deg)'}}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e63946" strokeWidth="12" strokeDasharray={`${dashArr} ${circumference}`} strokeLinecap="round" style={{filter:'drop-shadow(0 0 6px rgba(230,57,70,0.6))'}}/>
              </svg>
              <div style={{position:'absolute',textAlign:'center'}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:'var(--red)',letterSpacing:2}}>{winRate}%</div>
                <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--muted)'}}>Win Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* PLAY BANNER */}
        <div onClick={()=>navigate('/play')} style={{display:'flex',alignItems:'center',gap:24,padding:'24px 32px',background:'linear-gradient(135deg,rgba(230,57,70,0.12),rgba(230,57,70,0.04))',border:'1px solid rgba(230,57,70,0.25)',borderRadius:10,cursor:'pointer',position:'relative',zIndex:1,transition:'all 0.2s'}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2}}>Ready for a duel?</div>
            <div style={{fontSize:13,color:'var(--muted2)',marginTop:4}}>Jump into ranked and climb the leaderboard</div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {['⚡ Ranked','👥 Friend','🎯 Practice','🎲 Casual'].map(m=>(
              <span key={m} style={{padding:'6px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',borderRadius:20,fontSize:12,color:'var(--muted2)'}}>{m}</span>
            ))}
          </div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:'var(--red)',opacity:0.6}}>→</div>
        </div>
      </main>
    </div>
  )
}
