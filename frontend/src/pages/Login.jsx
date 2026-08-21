import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle, Sparkles } from 'lucide-react'
import { authApi } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const PERKS = [
  'AI-powered personalized roadmap',
  'TF-IDF + SVD recommendation engine',
  'Bayesian skill mastery tracking',
  'Real-time path adaptation',
  'Knowledge graph prerequisite ordering',
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login(data.user, data.access_token)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">

      {/* ── Left: Form panel ─────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white">
        {/* Logo */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand-sm">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-text-primary text-base">PathMind AI</span>
          </Link>
        </div>

        <div className="max-w-sm w-full">
          <h1 className="text-3xl font-black text-text-primary mb-1">Welcome back</h1>
          <p className="text-text-secondary mb-8">Continue your learning journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="input-label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
                <input
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
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-3.5 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700">
              Create one free
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100">
            <p className="text-xs font-semibold text-brand-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Demo credentials
            </p>
            <p className="text-xs text-brand-600">
              <span className="font-medium">Email:</span> demo@pathmind.ai
              <br />
              <span className="font-medium">Password:</span> Demo@1234
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: Brand panel ───────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-brand-600 to-violet-700 px-16 text-white">
        <div className="max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl font-black leading-tight mb-4">
            Learn smarter with AI-powered paths
          </h2>
          <p className="text-brand-200 text-lg mb-10 leading-relaxed">
            PathMind's ML engine uses TF-IDF, SVD, and Bayesian algorithms to create
            a roadmap that's truly yours.
          </p>
          <div className="space-y-3">
            {PERKS.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-white/90">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
