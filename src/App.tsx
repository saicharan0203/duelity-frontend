// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Assessment from './pages/Assessment'
import College from './pages/College'
import Dashboard from './pages/Dashboard'
import GameModes from './pages/GameModes'
import Battle from './pages/Battle'
import FriendRoom from './pages/FriendRoom'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080a0f' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(230,57,70,0.2)', borderTop: '3px solid #e63946', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}

// For logged-in users — redirects new users through onboarding
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (!firebaseUser) return <Navigate to="/login" replace />
  // Must complete assessment first
  if (profile?.isNewUser) return <Navigate to="/assessment" replace />
  // Must complete college selection
  if (profile && !profile.collegeSelected) return <Navigate to="/college" replace />
  return <>{children}</>
}

// Only for logged-out users
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (firebaseUser && profile && !profile.isNewUser && profile.collegeSelected) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

// Assessment and College pages — accessible during onboarding only
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return <Spinner />
  if (!firebaseUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/assessment" element={<OnboardingRoute><Assessment /></OnboardingRoute>} />
          <Route path="/college" element={<OnboardingRoute><College /></OnboardingRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/play" element={<ProtectedRoute><GameModes /></ProtectedRoute>} />
          <Route path="/battle/:matchId" element={<ProtectedRoute><Battle /></ProtectedRoute>} />
          <Route path="/room/:code?" element={<ProtectedRoute><FriendRoom /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
