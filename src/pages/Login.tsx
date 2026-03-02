import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../services/firebase'

export default function Login() {
  const [tab, setTab] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch(err: any) { setError(err.message) }
    setLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      navigate('/assessment')
    } catch(err: any) { setError(err.message) }
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true); setError('')
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate('/dashboard')
    } catch(err: any) { setError(err.message) }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',overflow:'hidden',position:'relative',background:'var(--bg)'}}>
      <div className="bg-grid"/>
      <div className="orb" style={{width:500,height:500,background:'rgba(230,57,70,0.12)',top:-150,right:-100,animation:'pulse 6s ease-in-out infinite'}}/>
      <div className="orb" style={{width:300,height:300,background:'rgba(230,57,70,0.06)',bottom:-100,left:'30%',animation:'pulse 8s ease-in-out infinite reverse'}}/>

      {/* LEFT PANEL */}
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px 80px',position:'relative',zIndex:1,animation:'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both'}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:52,letterSpacing:3,lineHeight:1,marginBottom:6}}>duelity<span style={{color:'var(--red)'}}>.</span>in</div>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,letterSpacing:6,color:'var(--muted)',textTransform:'uppercase',marginBottom:80}}>Math. Speed. Domination.</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:'clamp(72px,8vw,120px)',lineHeight:0.9,letterSpacing:2,marginBottom:32}}>
          <div style={{color:'var(--text)'}}>PROVE</div>
          <div style={{color:'var(--red)',textShadow:'0 0 60px var(--red-glow)'}}>YOU'RE</div>
          <div style={{color:'var(--muted2)',fontSize:'0.6em'}}>THE SMARTEST</div>
        </div>
        <p style={{fontSize:16,color:'var(--muted2)',lineHeight:1.7,maxWidth:420,marginBottom:48}}>Real-time 1v1 math battles. Ranked leaderboards. College rivalries. 10 seconds per question. No mercy.</p>
        <div style={{display:'flex',gap:40}}>
          {[['4','Game Modes'],['10s','Per Question'],['∞','AI Questions']].map(([n,l])=>(
            <div key={l} style={{borderLeft:'2px solid var(--red)',paddingLeft:16}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:2,lineHeight:1}}>{n}</div>
              <div style={{fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{width:480,background:'var(--panel)',borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px 48px',position:'relative',zIndex:1,overflow:'hidden',animation:'slideIn 0.5s cubic-bezier(0.16,1,0.3,1) both'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,var(--red),transparent)',animation:'scanline 3s ease-in-out infinite'}}/>
        <div style={{position:'absolute',bottom:-20,right:-20,fontFamily:"'Bebas Neue'",fontSize:260,color:'rgba(230,57,70,0.04)',lineHeight:1,pointerEvents:'none',userSelect:'none'}}>D</div>

        <div style={{display:'flex',borderBottom:'1px solid var(--border)',marginBottom:32}}>
          {(['login','signup'] as const).map((t,i)=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'14px 0',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:15,letterSpacing:3,textTransform:'uppercase',color:tab===t?'var(--red)':'var(--muted)',background:'none',border:'none',borderBottom:`2px solid ${tab===t?'var(--red)':'transparent'}`,marginBottom:-1,cursor:'pointer',transition:'all 0.2s'}}>
              {i===0?'Login':'Sign Up'}
            </button>
          ))}
        </div>

        {error && <div style={{padding:'10px 14px',background:'rgba(230,57,70,0.1)',border:'1px solid var(--border-red)',borderRadius:4,color:'var(--red)',fontSize:13,marginBottom:16}}>{error}</div>}

        {tab==='login' ? (
          <form onSubmit={handleLogin}>
            {[['Email Address','email',email,setEmail],['Password','password',password,setPassword]].map(([label,type,val,setter]: any)=>(
              <div key={label} style={{marginBottom:20}}>
                <label style={{display:'block',fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>{label}</label>
                <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={type==='email'?'you@college.edu':'••••••••'} style={{width:'100%',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:4,padding:'14px 16px',fontFamily:'Barlow,sans-serif',fontSize:15,color:'var(--text)',outline:'none'}} required/>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{width:'100%',padding:16,background:'var(--red)',border:'none',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:4,color:'white',cursor:'pointer',marginTop:8,opacity:loading?0.7:1}}>
              {loading?'ENTERING...':'ENTER THE ARENA'}
            </button>
            <div style={{display:'flex',alignItems:'center',gap:12,margin:'24px 0'}}>
              <div style={{flex:1,height:1,background:'var(--border)'}}/>
              <span style={{fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>or</span>
              <div style={{flex:1,height:1,background:'var(--border)'}}/>
            </div>
            <button type="button" onClick={handleGoogle} style={{width:'100%',padding:14,background:'transparent',border:'1px solid var(--border)',borderRadius:4,fontSize:14,fontWeight:500,color:'var(--muted2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.63 4.6 1.67l3.43-3.43A11.94 11.94 0 0 0 12 .9C8.02.9 4.58 3.02 2.7 6.18l2.57 3.58z"/><path fill="#34A853" d="M16.04 18.01A7.06 7.06 0 0 1 12 19.1a7.08 7.08 0 0 1-6.72-4.82L2.7 17.82A11.94 11.94 0 0 0 12 23.1c3.24 0 6.18-1.22 8.38-3.21l-4.34-1.88z"/><path fill="#FBBC05" d="M19.1 12c0-.66-.06-1.3-.17-1.91H12v3.63h3.97a3.4 3.4 0 0 1-1.47 2.22l4.34 1.88A11.93 11.93 0 0 0 19.1 12z"/><path fill="#4285F4" d="M5.28 14.28A7.12 7.12 0 0 1 4.9 12c0-.8.14-1.57.38-2.29L2.71 6.13A11.94 11.94 0 0 0 .1 12c0 1.96.47 3.8 1.3 5.43l3.88-3.15z"/></svg>
              Continue with Google
            </button>
            <p style={{marginTop:28,fontSize:12,color:'var(--muted)',textAlign:'center'}}>No account? <a onClick={()=>setTab('signup')} style={{color:'var(--red)',cursor:'pointer'}}>Create one — it's free</a></p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            {[['Full Name','text',name,setName],['Email Address','email',email,setEmail],['Password','password',password,setPassword]].map(([label,type,val,setter]: any)=>(
              <div key={label} style={{marginBottom:20}}>
                <label style={{display:'block',fontSize:11,letterSpacing:3,textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>{label}</label>
                <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={type==='email'?'you@college.edu':type==='password'?'Min 8 characters':'Your name'} style={{width:'100%',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:4,padding:'14px 16px',fontFamily:'Barlow,sans-serif',fontSize:15,color:'var(--text)',outline:'none'}} required/>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{width:'100%',padding:16,background:'var(--red)',border:'none',borderRadius:4,fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:4,color:'white',cursor:'pointer',marginTop:8,opacity:loading?0.7:1}}>
              {loading?'CREATING...':'CREATE ACCOUNT & ENTER'}
            </button>
            <div style={{display:'flex',alignItems:'center',gap:12,margin:'24px 0'}}>
              <div style={{flex:1,height:1,background:'var(--border)'}}/>
              <span style={{fontSize:11,letterSpacing:2,color:'var(--muted)',textTransform:'uppercase'}}>or</span>
              <div style={{flex:1,height:1,background:'var(--border)'}}/>
            </div>
            <button type="button" onClick={handleGoogle} style={{width:'100%',padding:14,background:'transparent',border:'1px solid var(--border)',borderRadius:4,fontSize:14,fontWeight:500,color:'var(--muted2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.63 4.6 1.67l3.43-3.43A11.94 11.94 0 0 0 12 .9C8.02.9 4.58 3.02 2.7 6.18l2.57 3.58z"/><path fill="#34A853" d="M16.04 18.01A7.06 7.06 0 0 1 12 19.1a7.08 7.08 0 0 1-6.72-4.82L2.7 17.82A11.94 11.94 0 0 0 12 23.1c3.24 0 6.18-1.22 8.38-3.21l-4.34-1.88z"/><path fill="#FBBC05" d="M19.1 12c0-.66-.06-1.3-.17-1.91H12v3.63h3.97a3.4 3.4 0 0 1-1.47 2.22l4.34 1.88A11.93 11.93 0 0 0 19.1 12z"/><path fill="#4285F4" d="M5.28 14.28A7.12 7.12 0 0 1 4.9 12c0-.8.14-1.57.38-2.29L2.71 6.13A11.94 11.94 0 0 0 .1 12c0 1.96.47 3.8 1.3 5.43l3.88-3.15z"/></svg>
              Sign up with Google
            </button>
            <p style={{marginTop:28,fontSize:12,color:'var(--muted)',textAlign:'center'}}>Already have an account? <a onClick={()=>setTab('login')} style={{color:'var(--red)',cursor:'pointer'}}>Login here</a></p>
          </form>
        )}
      </div>
    </div>
  )
}
