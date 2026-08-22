import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Map, GitBranch, LogOut, Brain,
  MessageCircle, Menu, X, Bell, Settings, ChevronDown, RefreshCcw
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import ChatOverlay from './ChatOverlay'
import { chatApi } from '../services/api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/skill-gap',  icon: GitBranch,       label: 'Skill Gap'  },
  { to: '/roadmap',    icon: Map,              label: 'My Roadmap' },
]

function Avatar({ name, size = 'md' }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [chatOpen, setChatOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const handleReOnboard = async () => {
    setMobileMenuOpen(false)
    try {
      await chatApi.reset()
    } catch {
      // Non-critical — proceed even if reset fails
    }
    navigate('/onboarding')
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex min-h-screen bg-surface">

      {/* ── Sidebar ── */}
      <>
        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-60 flex flex-col bg-white border-r border-surface-200
          shadow-card lg:shadow-none
          transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand-sm">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-sm leading-tight">PathMind AI</h1>
              <p className="text-xs text-text-muted">Your learning guide</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 py-2 mb-1">Menu</p>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to} to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}

            <div className="pt-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 py-2 mb-1">Tools</p>
              <button
                onClick={() => { setChatOpen(true); setMobileMenuOpen(false) }}
                className="nav-item w-full text-left"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                AI Assistant
              </button>
              <button
                onClick={handleReOnboard}
                className="nav-item w-full text-left"
              >
                <RefreshCcw className="w-4 h-4 flex-shrink-0" />
                Re-onboard
              </button>
            </div>
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-surface-200">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-100 cursor-pointer transition-colors"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <Avatar name={user?.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            </div>
            {userMenuOpen && (
              <div className="mt-1 py-1 rounded-xl bg-white border border-surface-200 shadow-card-md">
                <button
                  onClick={handleLogout}
                  className="btn-danger w-full justify-start rounded-none px-4 py-2"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </aside>
      </>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-card">
          {/* Left: hamburger (mobile) + greeting */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden btn-ghost p-2 -ml-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-text-muted">{greeting()},</p>
              <h2 className="font-bold text-text-primary text-sm leading-tight">
                {user?.name?.split(' ')[0]} 👋
              </h2>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatOpen(true)}
              className="btn-primary hidden sm:inline-flex"
            >
              <MessageCircle className="w-4 h-4" />
              AI Assistant
            </button>
            <button className="btn-ghost p-2 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
            </button>
            <div className="hidden sm:block">
              <Avatar name={user?.name} size="sm" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Chat overlay */}
      {chatOpen && <ChatOverlay onClose={() => setChatOpen(false)} />}
    </div>
  )
}
