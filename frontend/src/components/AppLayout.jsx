import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Map, GitBranch, LogOut, Brain,
  MessageCircle, Menu, X, Sun, Moon, RefreshCcw, Shield, BookOpen,
  ChevronDown, LifeBuoy, User as UserIcon, Key, Lock, Check, AlertCircle
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import ChatOverlay from './ChatOverlay'
import NotificationBell from './NotificationBell'
import ServicePausedScreen from './ServicePausedScreen'
import { chatApi, profileApi, systemApi } from '../services/api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', service: 'dashboard' },
  { to: '/skill-gap',  icon: GitBranch,       label: 'Skill Gap',  service: 'skill_gap' },
  { to: '/roadmap',    icon: Map,              label: 'Roadmap',    service: 'roadmap' },
]

function Avatar({ name, size = 'md', className = '' }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center font-bold text-white flex-shrink-0 shadow-subtle ${className}`}>
      {initials}
    </div>
  )
}

export default function AppLayout() {
  const { user, logout, updateUser } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [chatOpen, setChatOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  
  // Modals for Name & Password update
  const [nameModalOpen, setNameModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  // Name form state
  const [newName, setNewName] = useState(user?.name || '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState('')

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Service switchboard flags
  const [serviceFlags, setServiceFlags] = useState({
    support_page: true,
    ai_chatbot: true,
    onboarding: true,
    dashboard: true,
    roadmap: true,
    skill_gap: true,
    re_onboard: true,
    new_signups: true,
    login: true,
  })

  const profileRef = useRef(null)

  // Listen for quick-action tile trigger
  useEffect(() => {
    const handler = () => {
      if (serviceFlags.ai_chatbot !== false || user?.role === 'admin') {
        setChatOpen(true)
      } else {
        alert('AI Advisor service is temporarily paused for routine maintenance.')
      }
    }
    window.addEventListener('open-advisor-chat', handler)
    return () => window.removeEventListener('open-advisor-chat', handler)
  }, [serviceFlags, user])

  // Fetch service flags
  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const res = await systemApi.getServiceFlags()
        if (res.data) setServiceFlags(res.data)
      } catch {
        // Fallback default
      }
    }
    fetchFlags()
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setProfileMenuOpen(false)
    logout()
    navigate('/login')
  }

  const handleReOnboard = async () => {
    setMobileMenuOpen(false)
    if (serviceFlags.re_onboard === false && !isMasterAdmin) {
      toast.error('Goal Re-Onboarding is temporarily paused by the administration.', {
        icon: '⏸️',
      })
      return
    }
    try {
      await chatApi.reset()
    } catch {
      // Non-critical
    }
    navigate('/onboarding')
  }

  const handleUpdateName = async (e) => {
    e.preventDefault()
    setNameError('')
    setNameSuccess('')
    if (!newName.trim() || newName.trim().length < 2) {
      setNameError('Name must be at least 2 characters.')
      return
    }
    setNameLoading(true)
    try {
      const res = await profileApi.updateName(newName.trim())
      updateUser({ name: res.data?.user?.name || newName.trim() })
      setNameSuccess('Name updated successfully!')
      setTimeout(() => {
        setNameModalOpen(false)
        setNameSuccess('')
      }, 1200)
    } catch (err) {
      setNameError(err.response?.data?.detail || 'Failed to update name.')
    } finally {
      setNameLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (!currentPassword) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    setPasswordLoading(true)
    try {
      await profileApi.updatePassword(currentPassword, newPassword)
      setPasswordSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPasswordModalOpen(false)
        setPasswordSuccess('')
      }, 1200)
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const canEditName = user?.can_change_name !== false
  const canEditPassword = user?.can_change_password !== false
  const isMasterAdmin = user?.role === 'admin' || user?.email === 'er.adityasah@gmail.com'

  // Route-level service mapping & active guard check
  const location = useLocation()
  const pathname = location.pathname

  let currentRouteService = null
  if (pathname === '/dashboard' || pathname.startsWith('/resource/')) {
    currentRouteService = 'dashboard'
  } else if (pathname.startsWith('/skill-gap')) {
    currentRouteService = 'skill_gap'
  } else if (pathname.startsWith('/roadmap')) {
    currentRouteService = 'roadmap'
  } else if (pathname.startsWith('/help')) {
    currentRouteService = 'support_page'
  } else if (pathname.startsWith('/onboarding')) {
    currentRouteService = 'onboarding'
  }

  const isCurrentServicePaused = currentRouteService && serviceFlags[currentRouteService] === false && !isMasterAdmin

  return (
    <div className="flex min-h-screen bg-slate-100/80 dark:bg-darkBg-canvas text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white pb-16 lg:pb-0">

      {/* ── Mobile Sidebar Backdrop ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Studio Left Sidebar ── */}
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
          {navItems.map(({ to, icon: Icon, label, service }) => {
            const isServiceDisabled = serviceFlags[service] === false && !isMasterAdmin
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${isServiceDisabled ? 'opacity-50' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isServiceDisabled && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
                    Paused
                  </span>
                )}
              </NavLink>
            )
          })}

          <div className="pt-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1.5 mb-1">Studio AI</p>
            
            {/* AI Advisor Trigger */}
            <button
              onClick={() => {
                if (serviceFlags.ai_chatbot !== false || isMasterAdmin) {
                  setChatOpen(true)
                  setMobileMenuOpen(false)
                } else {
                  alert('AI Advisor service is temporarily paused by the administration.')
                }
              }}
              className={`nav-item w-full text-left ${serviceFlags.ai_chatbot === false && !isMasterAdmin ? 'opacity-50' : ''}`}
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0 text-brand-600 dark:text-brand-400" />
              <span className="flex-1">AI Advisor</span>
              {serviceFlags.ai_chatbot === false && !isMasterAdmin && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
                  Paused
                </span>
              )}
            </button>

            {/* Re-Onboard Goal */}
            <button
              onClick={handleReOnboard}
              className={`nav-item w-full text-left ${serviceFlags.re_onboard === false && !isMasterAdmin ? 'opacity-50' : ''}`}
            >
              <RefreshCcw className="w-4 h-4 flex-shrink-0 text-slate-500" />
              <span className="flex-1">Re-Onboard Goal</span>
              {serviceFlags.re_onboard === false && !isMasterAdmin && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
                  Paused
                </span>
              )}
            </button>

            {/* Help & Support */}
            <NavLink
              to="/help"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${serviceFlags.support_page === false && !isMasterAdmin ? 'opacity-50' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LifeBuoy className="w-4 h-4 flex-shrink-0 text-brand-600 dark:text-brand-400" />
              <span className="flex-1">Help & Support</span>
              {serviceFlags.support_page === false && !isMasterAdmin && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
                  Paused
                </span>
              )}
            </NavLink>
          </div>

          {/* Admin Portal Link */}
          {isMasterAdmin && (
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

        {/* Learner Identity Footer Pill (No logout here, moved to top right) */}
        <div className="p-3 border-t border-slate-200/80 dark:border-darkBg-border">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub/50 border border-slate-200/60 dark:border-darkBg-border">
            <Avatar name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <span className="inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 capitalize">
                {user?.role || 'Learner'}
              </span>
            </div>
          </div>
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

          {/* Right: Notification Bell, Theme Toggle, AI Advisor & Profile Avatar Menu */}
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
              onClick={() => {
                if (serviceFlags.ai_chatbot !== false || isMasterAdmin) {
                  setChatOpen(true)
                } else {
                  toast.error('AI Advisor service is temporarily paused by the administration.', {
                    icon: '⏸️',
                  })
                }
              }}
              className={`text-xs py-2 px-3.5 hidden sm:inline-flex items-center gap-1.5 rounded-2xl font-bold transition-all shadow-subtle ${
                serviceFlags.ai_chatbot === false && !isMasterAdmin
                  ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'btn-primary'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
              {serviceFlags.ai_chatbot === false && !isMasterAdmin && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 uppercase font-mono font-bold">
                  Paused
                </span>
              )}
            </button>

            {/* ── Top-Right Interactive Profile Avatar Dropdown ── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-darkBg-cardSub border border-slate-200/80 dark:border-darkBg-border transition-all shadow-subtle group"
                aria-label="User profile menu"
              >
                <Avatar name={user?.name} size="sm" />
                <span className="hidden md:inline text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-card-xl z-50 p-4 animate-scale-in">
                  
                  {/* User Profile Card Header */}
                  <div className="flex items-center gap-3 pb-3.5 border-b border-slate-200/80 dark:border-darkBg-border">
                    <Avatar name={user?.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{user?.email}</p>
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          user?.role === 'admin' || user?.email === 'er.adityasah@gmail.com'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                        }`}>
                          {user?.role === 'admin' || user?.email === 'er.adityasah@gmail.com' ? 'Superadmin' : 'Learner'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Self-Service Actions */}
                  <div className="py-2.5 space-y-1">
                    {/* Edit Name Button */}
                    <button
                      onClick={() => {
                        if (canEditName) {
                          setProfileMenuOpen(false)
                          setNameModalOpen(true)
                        }
                      }}
                      disabled={!canEditName}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        canEditName
                          ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub'
                          : 'text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-darkBg-cardSub/40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <UserIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span>Change Name</span>
                      </div>
                      {!canEditName && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-darkBg-border text-slate-500 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </button>

                    {/* Change Password Button */}
                    <button
                      onClick={() => {
                        if (canEditPassword) {
                          setProfileMenuOpen(false)
                          setPasswordModalOpen(true)
                        }
                      }}
                      disabled={!canEditPassword}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        canEditPassword
                          ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub'
                          : 'text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-darkBg-cardSub/40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Key className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span>Change Password</span>
                      </div>
                      {!canEditPassword && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-darkBg-border text-slate-500 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-darkBg-border">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {isCurrentServicePaused ? (
            <ServicePausedScreen serviceKey={currentRouteService} serviceFlags={serviceFlags} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
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
          onClick={() => {
            if (serviceFlags.ai_chatbot !== false || isMasterAdmin) {
              setChatOpen(true)
            } else {
              toast.error('AI Advisor service is temporarily paused by the administration.', {
                icon: '⏸️',
              })
            }
          }}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400"
        >
          <MessageCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Advisor</span>
        </button>
      </div>

      {/* ── Modal: Change Name ── */}
      {nameModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border rounded-3xl p-6 w-full max-w-md shadow-card-xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-darkBg-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Update Your Name</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Change your display name on PathMind AI</p>
                </div>
              </div>
              <button
                onClick={() => setNameModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateName} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Aditya Sah"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-darkBg-border bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {nameError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}

              {nameSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{nameSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setNameModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={nameLoading}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {nameLoading ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Change Password ── */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border rounded-3xl p-6 w-full max-w-md shadow-card-xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-darkBg-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Change Password</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your account uses a secure password</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-darkBg-border bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-darkBg-border bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-darkBg-border bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Overlay */}
      {chatOpen && (
        <ChatOverlay
          onClose={() => setChatOpen(false)}
          isPaused={serviceFlags.ai_chatbot === false && !isMasterAdmin}
        />
      )}
    </div>
  )
}
