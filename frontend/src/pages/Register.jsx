import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, User, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
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

const fields = [
  { key: 'name',     label: 'Full name',      type: 'text',     placeholder: 'Alex Johnson',     icon: User },
  { key: 'email',    label: 'Email address',  type: 'email',    placeholder: 'you@example.com',  icon: Mail },
  { key: 'password', label: 'Password',       type: 'password', placeholder: '8+ characters',    icon: Lock },
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      login(data.user, data.access_token)
      toast.success(`Welcome to PathMind, ${data.user.name}! 🎉`)
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">

      {/* ── Left: Brand panel ───────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-brand-600 to-violet-700 px-16 text-white">
        <div className="max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl font-black leading-tight mb-4">
            Your personalized learning journey starts here
          </h2>
          <p className="text-brand-200 text-lg mb-10 leading-relaxed">
            Real ML algorithms. Real results. PathMind builds a roadmap that adapts
            as you learn.
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
          {/* Mini step list */}
          <div className="mt-10 pt-8 border-t border-white/20 space-y-4">
            {[
              ['1', 'Create your account'],
              ['2', 'Chat with PathMind AI'],
              ['3', 'Get your ML roadmap'],
            ].map(([n, label]) => (
              <div key={n} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white text-brand-700 text-xs font-black flex items-center justify-center flex-shrink-0">{n}</div>
                <span className="text-sm text-white/80">{label}</span>
                {n !== '3' && <ArrowRight className="w-3 h-3 text-white/40 ml-auto" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ────────────────────────── */}
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
          <h1 className="text-3xl font-black text-text-primary mb-1">Create your account</h1>
          <p className="text-text-secondary mb-8">Start building your learning path today — free forever</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    type={type} required
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="input pl-10"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : <>Create account — free <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-text-muted mt-4">
            By creating an account you agree to our Terms of Service
          </p>
        </div>
      </div>

    </div>
  )
}
