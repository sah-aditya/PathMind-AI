import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import useAuthStore from './store/authStore'
import { notificationApi } from './services/api'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import SkillGap from './pages/SkillGap'
import Roadmap from './pages/Roadmap'
import Dashboard from './pages/Dashboard'
import ResourceDetail from './pages/ResourceDetail'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Admin from './pages/Admin'
import Maintenance from './pages/Maintenance'
import Help from './pages/Help'
import AppLayout from './components/AppLayout'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    if (user?.role === 'admin' || user?.email === 'er.adityasah@gmail.com') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const isAdmin = user?.role === 'admin' || user?.email === 'er.adityasah@gmail.com'
  return isAdmin ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { user, isAuthenticated } = useAuthStore()
  const isAdmin = user?.role === 'admin' || user?.email === 'er.adityasah@gmail.com'

  // Query global maintenance status every 20 seconds
  const { data: systemStatus } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: () => notificationApi.getSystemStatus().then((r) => r.data),
    refetchInterval: 20000,
  })

  const isMaintenance = systemStatus?.maintenance === true

  // Dynamically update Favicon when maintenance mode changes
  useEffect(() => {
    const faviconLink = document.querySelector("link[rel*='icon']")
    if (faviconLink) {
      faviconLink.href = isMaintenance ? '/maintenance-favicon.svg' : '/favicon.svg'
    }
  }, [isMaintenance])

  // If maintenance mode is active and user is NOT an admin, display the Maintenance Page
  if (isMaintenance && !isAdmin) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Maintenance message={systemStatus?.message} />} />
        </Routes>
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected Learner Workspace */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
          <Route path="/help" element={<Help />} />
          
          {/* Admin Command Portal */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  )
}
