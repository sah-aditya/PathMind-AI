import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, User, Loader2, ArrowRight, Compass, Cpu, Layers, Sun, Moon, AlertTriangle } from 'lucide-react'
import { authApi, systemApi } from '../services/api'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import toast from 'react-hot-toast'

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: 'Topological Prerequisite Ordering',
    desc: 'Dependencies sequenced using graph algorithms so foundations precede advanced concepts.'
  },
  {
    icon: Cpu,
    title: 'Hybrid Multi-Factor Recommendation',
    desc: 'Combines TF-IDF semantic relevance and collaborative signals for gap-closure efficiency.'
  },
  {
    icon: Layers,
    title: 'Adaptive Learning Feedback',
    desc: 'Evaluates mastery via knowledge checks and continuously adjusts your curriculum.'
  },
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [signupsEnabled, setSignupsEnabled] = useState(true)
  const { login } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    systemApi.getServiceFlags()
      .then(res => {
        if (res.data && res.data.new_signups === false) {
          setSignupsEnabled(false)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!signupsEnabled) {
      toast.error('New learner registrations are temporarily paused by administration.')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      login(data.user, data.access_token)
      toast.success(`Account created. Welcome, ${data.user.name}!`)
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-darkBg-canvas flex text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* ── Left: Brand capability panel ─────────────── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-slate-900 px-14 xl:px-20 text-white border-r border-slate-800">
        <div className="max-w-md space-y-8">
          <div>
            <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">Get Started Free</span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-2 leading-tight">
              Precision Learning Paths for Any Career Goal
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Join learners building adaptive curricula powered by topological graph sequencing and machine learning.
            </p>
          </div>

          <div className="space-y-3.5">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-brand-400">
                  <item.icon className="w-4 h-4" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wide">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-800">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-white dark:bg-darkBg-card">
        
        {/* Header row with Theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white shadow-subtle">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">PathMind AI</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border transition-colors shadow-subtle"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6">Build your personalized learning roadmap.</p>

          {!signupsEnabled && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold">New Registrations Paused</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                  New learner signups are temporarily paused for maintenance. If you already have an account, please sign in.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="input-label" htmlFor="register-name">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="register-name"
                  type="text" required
                  disabled={!signupsEnabled}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Johnson"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="input-label" htmlFor="register-email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="register-email"
                  type="email" required
                  disabled={!signupsEnabled}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label" htmlFor="register-password">Password (minimum 8 characters)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="register-password"
                  type="password" required
                  disabled={!signupsEnabled}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !signupsEnabled}
              className={`btn-primary w-full justify-center py-2.5 text-sm font-semibold mt-2 ${!signupsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</>
                : !signupsEnabled
                ? 'Signups Temporarily Paused'
                : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[11px] text-slate-400 mt-4">
            By registering, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300">Terms</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</Link>.
          </p>
        </div>
      </div>

    </div>
  )
}
