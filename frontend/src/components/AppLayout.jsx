import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Map, GitBranch, LogOut, Brain,
  MessageCircle, Menu, X, Bell, ChevronDown, RefreshCcw, Shield, BookOpen
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import ChatOverlay from './ChatOverlay'
import { chatApi } from '../services/api'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/skill-gap',  icon: GitBranch,       label: 'Skill Gap'  },
  { to: '/roadmap',    icon: Map,              label: 'My Roadmap' },
]

function Avatar({ name, size = 'md' }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white flex-shrink-0 shadow-subtle`}>
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
      // Non-critical
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
    <div className="flex min-h-screen bg-surface selection:bg-brand-500 selection:text-white">

      {/* ── Sidebar ── */}
      <>
        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-56 flex flex-col bg-white border-r border-surface-200
          shadow-card lg:shadow-none
          transform transition-transform duration-200 ease-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-200">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center text-white shadow-subtle">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">PathMind AI</h1>
                <p className="text-[10px] text-text-muted">Learning Platform</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-text-muted hover:text-text-primary rounded-md"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-2.5 py-1.5 mb-0.5">Core</p>
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

            <div className="pt-3">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-2.5 py-1.5 mb-0.5">AI Tools</p>
              <button
                onClick={() => { setChatOpen(true); setMobileMenuOpen(false) }}
                className="nav-item w-full text-left"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0 text-brand-600" />
                AI Assistant
              </button>
              <button
                onClick={handleReOnboard}
                className="nav-item w-full text-left"
              >
                <RefreshCcw className="w-4 h-4 flex-shrink-0" />
                Re-Onboard Goal
              </button>
            </div>

            <div className="pt-4 mt-4 border-t border-surface-200/80">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-2.5 py-1.5 mb-0.5">Legal</p>
              <Link
                to="/privacy"
                className="nav-item text-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="w-3.5 h-3.5 flex-shrink-0 text-text-muted" />
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="nav-item text-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-text-muted" />
                Terms of Service
              </Link>
            </div>
          </nav>

          {/* User section */}
          <div className="p-2.5 border-t border-surface-200">
            <div
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-100 cursor-pointer transition-colors"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <Avatar name={user?.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-text-muted flex-shrink-0" />
            </div>

            {userMenuOpen && (
              <div className="mt-1 py-1 rounded-lg bg-white border border-surface-200 shadow-card-md animate-scale-in">
                <button
                  onClick={handleLogout}
                  className="btn-danger w-full justify-start rounded-none px-3 py-1.5 text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </aside>
      </>

      {/* ── Main Content Container ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="bg-white border-b border-surface-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          {/* Left: Mobile Toggle & Greeting */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden btn-ghost p-1.5 -ml-1 text-slate-700"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[11px] text-text-muted">{greeting()},</p>
              <h2 className="font-bold text-slate-900 text-sm leading-tight">
                {user?.name?.split(' ')[0]}
              </h2>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatOpen(true)}
              className="btn-primary text-xs hidden sm:inline-flex py-2 px-3"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              AI Assistant
            </button>
            <div className="hidden sm:block">
              <Avatar name={user?.name} size="sm" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-surface">
          <Outlet />
        </main>
      </div>

      {/* Chat overlay */}
      {chatOpen && <ChatOverlay onClose={() => setChatOpen(false)} />}
    </div>
  )
}
