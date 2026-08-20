import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, User, Loader2 } from 'lucide-react'
import { authApi } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

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

  const fields = [
    { key: 'name', label: 'Full name', type: 'text', placeholder: 'Alex Johnson', icon: User },
    { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com', icon: Mail },
    { key: 'password', label: 'Password', type: 'password', placeholder: '8+ characters', icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 mb-4 shadow-lg shadow-brand-500/30">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start building your learning path today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type={type} required
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="input pl-10"
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create account — free'}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
