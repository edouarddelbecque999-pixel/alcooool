import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthScreen from './screens/AuthScreen'
import DashboardScreen from './screens/DashboardScreen'
import HistoryScreen from './screens/HistoryScreen'
import StatsScreen from './screens/StatsScreen'
import CoachScreen from './screens/CoachScreen'
import ProfileScreen from './screens/ProfileScreen'
import Layout from './components/Layout'

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardScreen />} />
          <Route path="history" element={<HistoryScreen />} />
          <Route path="stats" element={<StatsScreen />} />
          <Route path="coach" element={<CoachScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
