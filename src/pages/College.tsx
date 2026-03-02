import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const COLLEGES = [
  {icon:'🏛️', name:'IIT Bombay', loc:'Mumbai, Maharashtra'},
  {icon:'🏛️', name:'IIT Delhi', loc:'New Delhi, Delhi'},
  {icon:'🏛️', name:'IIT Madras', loc:'Chennai, Tamil Nadu'},
  {icon:'🏛️', name:'IIT Kanpur', loc:'Kanpur, Uttar Pradesh'},
  {icon:'🏛️', name:'IIT Kharagpur', loc:'Kharagpur, West Bengal'},
  {icon:'🎓', name:'NIT Trichy', loc:'Tiruchirappalli, Tamil Nadu'},
  {icon:'🎓', name:'NIT Warangal', loc:'Warangal, Telangana'},
  {icon:'🏫', name:'BITS Pilani', loc:'Pilani, Rajasthan'},
  {icon:'🏫', name:'BITS Hyderabad', loc:'Hyderabad, Telangana'},
  {icon:'🏫', name:'VIT Vellore', loc:'Vellore, Tamil Nadu'},
  {icon:'🏫', name:'SRM Chennai', loc:'Chennai, Tamil Nadu'},
  {icon:'🎓', name:'Manipal Institute', loc:'Manipal, Karnataka'},
  {icon:'🏛️', name:'Delhi University', loc:'New Delhi, Delhi'},
  {icon:'🏛️', name:'Mumbai University', loc:'Mumbai, Maharashtra'},
  {icon:'🏛️', name:'Anna University', loc:'Chennai, Tamil Nadu'},
  {icon:'🎓', name:'Jadavpur University', loc:'Kolkata, West Bengal'},
  {icon:'🏫', name:'Amity University', loc:'Noida, Uttar Pradesh'},
  {icon:'🎓', name:'Thapar University', loc:'Patiala, Punjab'},
  {icon:'🎓', name:'PSG College of Technology', loc:'Coimbatore, Tamil Nadu'},
  {icon:'🏛️', name:'IIT Guwahati', loc:'Guwahati, Assam'},
  {icon:'🏛️', name:'IIT Roorkee', loc:'Roorkee, Uttarakhand'},
  {icon:'🎓', name:'NIT Surathkal', loc:'Mangalore, Karnataka'},
  {icon:'🏛️', name:'IISc Bangalore', loc:'Bangalore, Karnataka'},
  {icon:'🏫', name:'Symbiosis', loc:'Pune, Maharashtra'},
  {icon:'🎓', name:'COEP Pune', loc:'Pune, Maharashtra'},
]

export default function College() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof COLLEGES[0]|null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const filtered = search ? COLLEGES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.loc.toLowerCase().includes(search.toLowerCase())) : []
  const popular = COLLEGES.slice(0, 6)

  async function confirm() {
    if (!selected && !search) { navigate('/dashboard'); return }
    setLoading(true)
    try {
      if (user && selected) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/users/set-college`, { uid: user.uid, collegeName: selected.name })
      }
      navigate('/dashboard')
    } catch(e) { navigate('/dashboard') }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',position:'relative',overflow:'hidden',padding:24}}>
      <div className="bg-grid"/>
      <div className="orb" style={{width:500,height:500,background:'rgba(230,57,70,0.08)',top:-150,right:-100,animation:'pulse 7s ease-in-out infinite'}}/>
      <div className="orb" style={{width:300,height:300,background:'rgba(230,57,70,0.05)',bottom:-100,left:'10%',animation:'pulse 9s ease-in-out infinite reverse'}}/>

      <div style={{position:'relative',zIndex:2,background:'var(--panel)',border:'1px solid var(--border)',borderRadius:16,padding:'40px 48px',width:'100%',maxWidth:580,animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',overflow:'visible'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,var(--red),transparent)',borderRadius:'16px 16px 0 0'}}/>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:4,textTransform:'uppercase',color:'var(--muted)',border:'1px solid var(--border)',padding:'5px 12px',borderRadius:2}}>🎓 Optional Step</div>
        </div>

        <h1 style={{fontFamily:"'Bebas Neue'",fontSize:52,letterSpacing:2,lineHeight:0.95,marginBottom:14}}>
          Which College<br/><span style={{color:'var(--red)'}}>Are You From?</span>
        </h1>
        <p style={{fontSize:13,color:'var(--muted2)',lineHeight:1.7,marginBottom:28}}>Join your college leaderboard and compete with your classmates. You can always set this later from your dashboard.</p>

        {/* Search */}
        <div style={{position:'relative',display:'flex',alignItems:'center',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:8,marginBottom:0,transition:'all 0.2s'}}>
          <span style={{padding:'0 14px',fontSize:16,color:'var(--muted)'}}>🔍</span>
          <input value={search} onChange={e=>{setSearch(e.target.value);if(!e.target.value)setSelected(null)}} placeholder="Search your college..." style={{flex:1,background:'none',border:'none',outline:'none',padding:'14px 0',fontFamily:'Barlow,sans-serif',fontSize:15,color:'var(--text)'}}/>
          {search && <button onClick={()=>{setSearch('');setSelected(null)}} style={{padding:'0 16px',fontSize:14,color:'var(--muted)',background:'none',border:'none',cursor:'pointer'}}>✕</button>}
        </div>

        {/* Dropdown */}
        {search && filtered.length > 0 && !selected && (
          <div style={{background:'#0d1117',border:'1px solid var(--border)',borderTop:'none',borderRadius:'0 0 8px 8px',maxHeight:250,overflowY:'auto',zIndex:10,position:'relative'}}>
            {filtered.map(c=>(
              <div key={c.name} onClick={()=>{setSelected(c);setSearch(c.name)}} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.03)',transition:'all 0.15s'}}>
                <span style={{fontSize:24}}>{c.icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{c.name}</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>📍 {c.loc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected display */}
        {selected && (
          <div style={{display:'flex',alignItems:'center',gap:16,background:'rgba(230,57,70,0.06)',border:'1px solid rgba(230,57,70,0.3)',borderRadius:8,padding:'16px 20px',marginTop:12,animation:'fadeUp 0.3s ease both'}}>
            <span style={{fontSize:36}}>{selected.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:2}}>{selected.name}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>📍 {selected.loc}</div>
            </div>
            <button onClick={()=>{setSelected(null);setSearch('')}} style={{background:'none',border:'1px solid var(--border)',borderRadius:4,padding:'7px 14px',fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'var(--muted2)',cursor:'pointer'}}>Change</button>
          </div>
        )}

        {/* Popular colleges */}
        {!search && (
          <div style={{marginTop:20}}>
            <div style={{fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginBottom:12}}>Popular Colleges</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {popular.map(c=>(
                <div key={c.name} onClick={()=>{setSelected(c);setSearch(c.name)}} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:6,cursor:'pointer',transition:'all 0.2s'}}>
                  <span style={{fontSize:20}}>{c.icon}</span>
                  <span style={{fontSize:13,color:'var(--muted2)',fontWeight:500}}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{marginTop:28,display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={confirm} disabled={loading} style={{width:'100%',padding:16,background:'var(--red)',border:'none',borderRadius:6,fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:4,color:'white',cursor:'pointer',opacity:loading?0.7:1}}>
            {loading?'ENTERING...':'Confirm & Enter Arena →'}
          </button>
          <button onClick={()=>navigate('/dashboard')} style={{background:'none',border:'none',fontSize:13,color:'var(--muted)',cursor:'pointer',padding:'4px 0',textAlign:'center'}}>Skip for now — I'll add later</button>
        </div>
      </div>
    </div>
  )
}
