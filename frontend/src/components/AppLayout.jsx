import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Map, GitBranch, LogOut, Brain,
  MessageCircle, Menu, X, Sun, Moon, RefreshCcw, Shield, BookOpen, ChevronDown, LifeBuoy
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import ChatOverlay from './ChatOverlay'
import NotificationBell from './NotificationBell'
import { chatApi } from '../services/api'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/skill-gap',  icon: GitBranch,       label: 'Skill Gap'  },
  { to: '/roadmap',    icon: Map,              label: 'Roadmap' },
]

function Avatar({ name, size = 'md' }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center font-bold text-white flex-shrink-0 shadow-subtle`}>
      {initials}
    </div>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [chatOpen, setChatOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Listen for quick-action tile trigger
  useState(() => {
    const handler = () => setChatOpen(true)
    window.addEventListener('open-advisor-chat', handler)
    return () => window.removeEventListener('open-advisor-chat', handler)
  })

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
    <div className="flex min-h-screen bg-slate-100/80 dark:bg-darkBg-canvas text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white pb-16 lg:pb-0">

      {/* ── Mobile Sidebar Backdrop ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Studio Left Sidebar (Inspired by SETO studio) ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60 flex flex-col bg-white dark:bg-darkBg-card border-r border-slate-200/80 dark:border-darkBg-border
        shadow-card-lg lg:shadow-none
        transform transition-transform duration-200 ease-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-darkBg-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white shadow-subtle">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight tracking-tight">PathMind AI</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Curriculum Studio</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1.5 mb-1">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1.5 mb-1">Studio AI</p>
            <button
              onClick={() => { setChatOpen(true); setMobileMenuOpen(false) }}
              className="nav-item w-full text-left"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0 text-brand-600 dark:text-brand-400" />
              <span>AI Advisor</span>
            </button>
            <button
              onClick={handleReOnboard}
              className="nav-item w-full text-left"
            >
              <RefreshCcw className="w-4 h-4 flex-shrink-0 text-slate-500" />
              <span>Re-Onboard Goal</span>
            </button>
            <NavLink
              to="/help"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LifeBuoy className="w-4 h-4 flex-shrink-0 text-brand-600 dark:text-brand-400" />
              <span>Help & Support</span>
            </NavLink>
          </div>

          {/* Admin Portal Link */}
          {(user?.role === 'admin' || user?.email === 'er.adityasah@gmail.com') && (
            <div className="pt-3">
              <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider px-3 py-1 mb-1">Administration</p>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-item ${isActive ? 'active bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="w-4 h-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                <span>Admin Portal</span>
              </NavLink>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-darkBg-border">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1 mb-1">Legal</p>
            <Link
              to="/privacy"
              className="nav-item text-xs"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="nav-item text-xs"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              Terms of Service
            </Link>
            
            <div className="px-3 pt-3 mt-2 border-t border-slate-200/60 dark:border-darkBg-border text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
              <span>Built with ❤️ in Bharat 🇮🇳</span>
            </div>
          </div>
        </nav>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-darkBg-border">
          <div
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-darkBg-cardSub cursor-pointer transition-colors"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <Avatar name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">{user?.email}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </div>

          {userMenuOpen && (
            <div className="mt-1 py-1 rounded-xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-card-lg animate-scale-in">
              <button
                onClick={handleLogout}
                className="btn-danger w-full justify-start rounded-none px-3.5 py-2 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Floating Studio Top Header */}
        <header className="bg-white/80 dark:bg-darkBg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-darkBg-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          
          {/* Left: Hamburger & Greeting */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub rounded-xl"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{greeting()},</p>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                {user?.name?.split(' ')[0]}
              </h2>
            </div>
          </div>

          {/* Right: Notification Bell, Theme Toggle & Assistant */}
          <div className="flex items-center gap-2.5">
            {/* System Broadcast Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border transition-colors shadow-subtle"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setChatOpen(true)}
              className="btn-primary text-xs py-2 px-3.5 hidden sm:inline-flex"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              AI Advisor
            </button>

            <div className="hidden sm:block">
              <Avatar name={user?.name} size="sm" />
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar (Inspired by Image 3) ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-darkBg-card/95 backdrop-blur-md border-t border-slate-200/80 dark:border-darkBg-border py-2 px-6 flex items-center justify-around z-30 shadow-card-lg">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2.5 rounded-xl transition-colors ${
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400"
        >
          <MessageCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Advisor</span>
        </button>
      </div>

      {/* Chat Overlay */}
      {chatOpen && <ChatOverlay onClose={() => setChatOpen(false)} />}
    </div>
  )
}
