import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'

const TIERS = [{min:1400,label:'👑 Diamond',color:'#f59e0b'},{min:1000,label:'💎 Platinum',color:'#60a5fa'},{min:700,label:'🥇 Gold',color:'#e63946'},{min:400,label:'🥈 Silver',color:'#9ca3af'},{min:0,label:'🥉 Bronze',color:'#cd7f32'}]
function getTier(r:number){return TIERS.find(t=>r>=t.min)||TIERS[4]}

const INDIA = [
  {init:'PK',name:'ProKiller007',college:'IIT Madras',rating:2140,wins:187,me:false},
  {init:'RK',name:'RajKumar99',college:'IIT Delhi',rating:1890,wins:162,me:false},
  {init:'MS',name:'MathStar23',college:'BITS Pilani',rating:1754,wins:144,me:false},
  {init:'NK',name:'NitroKing',college:'IIT Bombay',rating:1680,wins:138,me:false},
  {init:'QM',name:'QuizMaster',college:'NIT Trichy',rating:1620,wins:129,me:false},
  {init:'ZS',name:'ZeroSec',college:'VIT Vellore',rating:1540,wins:118,me:false},
  {init:'BG',name:'BrainGod',college:'IIT Kanpur',rating:1490,wins:112,me:false},
  {init:'CF',name:'CalcFire',college:'NIT Warangal',rating:1460,wins:107,me:false},
  {init:'SS',name:'SpeedSolve',college:'IIT Kharagpur',rating:1380,wins:99,me:false},
  {init:'AK',name:'Arjun Kumar',college:'IIT Bombay',rating:1240,wins:61,me:true},
]
const COLLEGE = [
  {init:'SK',name:'SpeedKing',college:'ECE • 4th Year',rating:1680,wins:138,me:false},
  {init:'VR',name:'VRocker',college:'CSE • 3rd Year',rating:1420,wins:112,me:false},
  {init:'NP',name:'NerdPower',college:'MECH • 2nd Year',rating:1380,wins:99,me:false},
  {init:'NK',name:'NitroKing',college:'CSE • 4th Year',rating:1340,wins:95,me:false},
  {init:'RS',name:'RocketSci',college:'EE • 3rd Year',rating:1290,wins:88,me:false},
  {init:'AK',name:'Arjun Kumar',college:'CSE • 2nd Year',rating:1240,wins:61,me:true},
]

function Podium({data,collegiate}:{data:typeof INDIA,collegiate?:boolean}) {
  const top3 = [data[1],data[0],data[2]]
  const heights = [50,70,40]
  return (
    <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:12,marginBottom:28,padding:'0 20px'}}>
      {top3.map((p,i)=>{
        if(!p)return null
        const rank=i===0?2:i===1?1:3
        const colors=['#9ca3af','#f59e0b','#cd7f32']
        const c=colors[rank-1]
        return (
          <div key={p.name} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flex:1,maxWidth:180,textAlign:'center'}}>
            {rank===1&&<div style={{fontSize:24,animation:'float 2s ease-in-out infinite'}}>👑</div>}
            <div style={{width:rank===1?64:52,height:rank===1?64:52,borderRadius:'50%',background:'linear-gradient(135deg,#1a2a3a,#0d1520)',border:`2px solid ${c}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:rank===1?22:18,color:'var(--text)',boxShadow:rank===1?`0 0 24px ${c}40`:'none'}}>{p.init}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:1}}>{p.name}</div>
            <div style={{fontSize:11,color:'var(--muted)'}}>{p.college}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:18,letterSpacing:2,color:c}}>{p.rating.toLocaleString()}</div>
            <div style={{width:'100%',borderRadius:'6px 6px 0 0',display:'flex',alignItems:'center',justifyContent:'center',padding:'10px 0',height:heights[rank-1],background:`linear-gradient(180deg,${c}25,${c}08)`,border:`1px solid ${c}40`}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:2,color:c}}>{'🥇🥈🥉'[rank-1]} #{rank}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Leaderboard() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { profile } = useAuth()
  const initials = (profile?.name||'U').split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2)
  const tier = (profile?.tier||'bronze').toLowerCase()
  const TIER_COLORS: Record<string,string> = {diamond:'#f59e0b',platinum:'#60a5fa',gold:'#e63946',silver:'#9ca3af',bronze:'#cd7f32'}
  const TIER_ICONS: Record<string,string> = {diamond:'👑',platinum:'💎',gold:'🥇',silver:'🥈',bronze:'🥉'}

  const filter = (d: typeof INDIA) => search ? d.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.college.toLowerCase().includes(search.toLowerCase())) : d

  const tableStyle = {background:'var(--panel)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}
  const headCols = '60px 1fr 1fr 100px 100px 80px'

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)',position:'relative'}}>
      <div className="bg-grid" style={{opacity:0.3}}/>

      {/* Sidebar */}
      <aside style={{width:240,background:'var(--panel)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',padding:'32px 20px',position:'sticky',top:0,height:'100vh',flexShrink:0,zIndex:1}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:3,marginBottom:40}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
        <nav style={{display:'flex',flexDirection:'column',gap:4,flex:1}}>
          {[['⚡','Dashboard','/dashboard'],['🎮','Play','/play'],['🏆','Leaderboard','/leaderboard'],['👤','Profile','/profile'],['⚙️','Settings','#']].map(([icon,label,path])=>(
            <a key={label} onClick={()=>path!=='#'&&navigate(path)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:6,color:path==='/leaderboard'?'var(--red)':'var(--muted2)',fontSize:14,fontWeight:500,cursor:'pointer',background:path==='/leaderboard'?'rgba(230,57,70,0.1)':'none',border:path==='/leaderboard'?'1px solid rgba(230,57,70,0.2)':'1px solid transparent',transition:'all 0.2s'}}>
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
          <div style={{fontSize:18,color:TIER_COLORS[tier]||'#cd7f32'}}>{TIER_ICONS[tier]||'🥉'}</div>
        </div>
        <button onClick={()=>signOut(auth)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:12,letterSpacing:2,fontFamily:"'Barlow Condensed'",textTransform:'uppercase',cursor:'pointer',padding:'8px 0',textAlign:'left'}}>← Logout</button>
      </aside>

      <main style={{flex:1,padding:'36px 40px',overflowY:'auto',position:'relative',zIndex:1}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:32,gap:20,flexWrap:'wrap'}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:40,letterSpacing:3,lineHeight:1}}>🏆 Leaderboard</div>
            <div style={{fontSize:13,color:'var(--muted)',marginTop:4}}>See where you stand across India and your college</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,background:'var(--panel)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 16px',minWidth:240}}>
            <span>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search player..." style={{background:'none',border:'none',outline:'none',fontFamily:'Barlow,sans-serif',fontSize:14,color:'var(--text)',width:'100%'}}/>
          </div>
        </div>

        {/* India Rankings */}
        {[{title:'🇮🇳 India Rankings',count:'18,492 Players',data:filter(INDIA),cols:'College'},{title:'🏫 IIT Bombay Rankings',count:'312 Players',data:filter(COLLEGE),cols:'Branch'}].map(({title,count,data,cols})=>(
          <div key={title} style={{marginBottom:32,animation:'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:3}}>{title}</div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)'}}>{count}</div>
            </div>

            {/* Podium */}
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:12,marginBottom:28,padding:'0 20px'}}>
              {[1,0,2].map(ri=>{
                const p=data[ri]
                if(!p)return null
                const rank=ri===1?1:ri===0?2:3
                const cs=['#f59e0b','#9ca3af','#cd7f32']
                const c=cs[rank-1]
                const hs=[70,50,40]
                return (
                  <div key={p.name} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flex:1,maxWidth:180,textAlign:'center'}}>
                    {rank===1&&<div style={{fontSize:24,animation:'float 2s ease-in-out infinite'}}>👑</div>}
                    <div style={{width:rank===1?64:52,height:rank===1?64:52,borderRadius:'50%',background:'linear-gradient(135deg,#1a2a3a,#0d1520)',border:`2px solid ${c}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:rank===1?22:18,color:'var(--text)',boxShadow:rank===1?`0 0 24px ${c}40`:'none'}}>{p.init}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:16}}>{p.name}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{p.college}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:c}}>{p.rating.toLocaleString()}</div>
                    <div style={{width:'100%',borderRadius:'6px 6px 0 0',display:'flex',alignItems:'center',justifyContent:'center',height:hs[rank-1],background:`linear-gradient(180deg,${c}25,${c}08)`,border:`1px solid ${c}40`}}>
                      <span style={{fontFamily:"'Bebas Neue'",fontSize:16,color:c}}>{['🥇','🥈','🥉'][rank-1]} #{rank}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Table */}
            <div style={tableStyle}>
              <div style={{display:'grid',gridTemplateColumns:headCols,padding:'12px 20px',borderBottom:'1px solid var(--border)',fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)'}}>
                <span>Rank</span><span>Player</span><span>{cols}</span><span>Tier</span><span>Rating</span><span>Wins</span>
              </div>
              {data.map((p,i)=>{
                const t=getTier(p.rating)
                const rc=i===0?'#f59e0b':i===1?'#9ca3af':i===2?'#cd7f32':'var(--muted2)'
                return (
                  <div key={p.name} style={{display:'grid',gridTemplateColumns:headCols,padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,0.03)',alignItems:'center',background:p.me?'rgba(230,57,70,0.06)':'transparent',borderLeft:p.me?'2px solid var(--red)':'2px solid transparent'}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:rc}}>#{i+1}</div>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:p.me?'linear-gradient(135deg,#e63946,#c1121f)':'linear-gradient(135deg,#1a2a3a,#0d1520)',border:`1px solid ${p.me?'var(--red)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue'",fontSize:13,flexShrink:0}}>{p.init}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600}}>{p.name} 🇮🇳 {p.me&&<span style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--red)',background:'rgba(230,57,70,0.1)',borderRadius:2,padding:'2px 6px',marginLeft:6}}>YOU</span>}</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:'var(--muted2)'}}>{p.college}</div>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:2,textTransform:'uppercase',color:t.color}}>{t.label}</div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:20}}>{p.rating.toLocaleString()}</div>
                    <div style={{fontSize:13,color:'var(--muted2)'}}>{p.wins}W</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
