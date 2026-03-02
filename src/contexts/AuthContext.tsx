import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../services/firebase'
import api from '../services/api'

export interface UserProfile {
  id: string
  name: string
  email: string
  rating: number
  tier: string
  isNewUser: boolean
  collegeSelected: boolean
  totalMatches: number
  wins: number
  losses: number
  bestStreak: number
  accuracy: number
  college: { id: string; name: string; icon: string } | null
}

interface AuthContextType {
  firebaseUser: User | null
  user: User | null  // alias for firebaseUser
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshProfile() {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await api.post('/api/auth/verify-token', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(res.data)
    } catch {}
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        try {
          const token = await user.getIdToken()
          const res = await api.post('/api/auth/verify-token', {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setProfile(res.data)
        } catch {
          // If backend fails, still allow access - don't block the user
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ firebaseUser, user: firebaseUser, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
