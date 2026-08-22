import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, Loader2, Eye, EyeOff, GitBranch, Cpu, Compass, Sun, Moon } from 'lucide-react'
import { authApi } from '../services/api'
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
    icon: GitBranch,
    title: 'Bayesian Adaptive Updates',
    desc: 'Evaluates mastery via knowledge checks and continuously adjusts your curriculum.'
  },
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login(data.user, data.access_token)
      toast.success(`Welcome back, ${data.user.name}!`)
      if (data.user?.role === 'admin' || data.user?.email === 'er.adityasah@gmail.com') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-darkBg-canvas flex text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* ── Left: Form panel ─────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-white dark:bg-darkBg-card border-r border-slate-200/80 dark:border-darkBg-border">
        
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">Sign In</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6">Continue your personalized curriculum.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="input-label" htmlFor="email-input">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="email-input"
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label" htmlFor="password-input">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="password-input"
                  type={showPw ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm font-semibold mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* Demo account banner */}
          <div className="mt-6 p-3.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub/60 border border-slate-200/80 dark:border-darkBg-border">
            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Sample Exploration Account
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 font-mono">
              <p><span className="font-sans font-normal">Email:</span> demo@pathmind.ai</p>
              <p><span className="font-sans font-normal">Password:</span> Demo@1234</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Technical Capability panel ──────────── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-slate-900 px-14 xl:px-20 text-white border-l border-slate-800">
        <div className="max-w-md space-y-8">
          <div>
            <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">Engine Architecture</span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-2 leading-tight">
              Adaptive Curriculum Engineering
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              PathMind pairs topological graph ordering with probabilistic Bayesian estimation to deliver precision learning roadmaps.
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

    </div>
  )
}
