import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain, Send, Loader2, CheckCircle, ArrowRight,
  Sparkles, Clock, Target, BookOpen, Zap
} from 'lucide-react'
import { chatApi, pathApi } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const WELCOME_MSG = {
  role: 'assistant',
  content: "👋 Hi! I'm PathMind AI. I'm here to build your personalized learning roadmap.\n\nLet's start simple — **what do you want to achieve?** For example:\n- \"I want to become a Machine Learning Engineer\"\n- \"I want to learn full-stack web development\"\n- \"I want to transition into data science\"\n\nTell me in your own words!",
}

const STEPS = [
  { label: 'Learning goal',       icon: Target,   minTurns: 1 },
  { label: 'Experience level',    icon: Zap,      minTurns: 2 },
  { label: 'Current skills',      icon: BookOpen, minTurns: 3 },
  { label: 'Weekly availability', icon: Clock,    minTurns: 4 },
  { label: 'Interests & style',   icon: Sparkles, minTurns: 5 },
]

function AiAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-brand-sm">
      <Brain className="w-4 h-4 text-white" />
    </div>
  )
}

function UserAvatar({ name }) {
  const initials = (name || 'U')[0].toUpperCase()
  return (
    <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
      {initials}
    </div>
  )
}

function MessageContent({ content }) {
  // Render **bold** markdown safely
  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
  return (
    <p
      className="text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default function Onboarding() {
  const [messages, setMessages]           = useState([WELCOME_MSG])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [profileReady, setProfileReady]   = useState(false)
  const [generating, setGenerating]       = useState(false)
  const [extractedProfile, setExtractedProfile] = useState(null)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const navigate   = useNavigate()
  const { user }   = useAuthStore()

  const userTurns = messages.filter(m => m.role === 'user').length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const { data } = await chatApi.send(text, 'onboarding')
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])

      // Only accept profile_ready after at least 3 user turns
      if (data.profile_ready && userTurns + 1 >= 3) {
        setProfileReady(true)
        setExtractedProfile(data.profile)
      }
    } catch {
      toast.error('AI response failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePath = async () => {
    setGenerating(true)
    try {
      await pathApi.generate()
      toast.success('🎉 Your learning path is ready!')
      navigate('/skill-gap')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate path')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-65px)] bg-surface overflow-hidden">

      {/* ── Left: Chat panel ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="bg-white border-b border-surface-200 px-6 py-3 flex items-center gap-3">
          <AiAvatar />
          <div className="flex-1">
            <p className="font-bold text-text-primary text-sm">PathMind AI</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {profileReady ? 'Profile complete!' : 'Building your profile…'}
            </p>
          </div>
          {/* Turn progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  userTurns > i ? 'bg-brand-500 scale-110' : 'bg-surface-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-fade-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && <AiAvatar />}

              <div className={`max-w-[75%] ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3'
                  : 'bg-white border border-surface-200 shadow-card text-text-primary rounded-2xl rounded-tl-sm px-4 py-3'
              }`}>
                <MessageContent content={m.content} />
              </div>

              {m.role === 'user' && <UserAvatar name={user?.name} />}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <AiAvatar />
              <div className="bg-white border border-surface-200 shadow-card rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                <span className="text-text-muted text-sm">PathMind is thinking…</span>
              </div>
            </div>
          )}

          {/* Profile ready card */}
          {profileReady && (
            <div className="animate-slide-up">
              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5 shadow-card-md">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-700">Profile Complete!</p>
                    <p className="text-xs text-text-muted">Ready to generate your personalized roadmap</p>
                  </div>
                </div>

                {/* Profile summary grid */}
                {extractedProfile && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-surface-50 border border-surface-200 rounded-xl p-3">
                      <p className="text-xs text-text-muted mb-0.5">Goal</p>
                      <p className="text-sm font-semibold text-text-primary leading-tight line-clamp-2">
                        {extractedProfile.goal_text || '—'}
                      </p>
                    </div>
                    <div className="bg-surface-50 border border-surface-200 rounded-xl p-3">
                      <p className="text-xs text-text-muted mb-0.5">Level</p>
                      <p className="text-sm font-semibold text-text-primary capitalize">
                        {extractedProfile.experience_level || '—'}
                      </p>
                    </div>
                    <div className="bg-surface-50 border border-surface-200 rounded-xl p-3">
                      <p className="text-xs text-text-muted mb-0.5">Hours/week</p>
                      <p className="text-sm font-semibold text-text-primary">
                        {extractedProfile.hours_per_week || 8}h
                      </p>
                    </div>
                    <div className="bg-surface-50 border border-surface-200 rounded-xl p-3">
                      <p className="text-xs text-text-muted mb-0.5">Skills identified</p>
                      <p className="text-sm font-semibold text-text-primary">
                        {extractedProfile.known_skills?.length || 0} skills
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGeneratePath}
                  disabled={generating}
                  className="btn-primary w-full justify-center py-3.5"
                >
                  {generating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your roadmap…</>
                    : <><Sparkles className="w-4 h-4" /> Generate My Learning Path <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        {!profileReady && (
          <div className="bg-white border-t border-surface-200 px-4 sm:px-6 py-4">
            <div className="flex gap-3 max-w-3xl mx-auto">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Tell PathMind AI your goal…"
                className="input flex-1"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="btn-primary px-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2 text-center">
              Press Enter to send · PathMind will ask {Math.max(0, 4 - userTurns)} more question{Math.max(0, 4 - userTurns) !== 1 ? 's' : ''} to build your profile
            </p>
          </div>
        )}
      </div>

      {/* ── Right: Progress steps panel ──────────────── */}
      <div className="hidden lg:flex w-72 flex-col bg-white border-l border-surface-200 p-6">
        <h2 className="font-bold text-text-primary mb-1">Building your profile</h2>
        <p className="text-xs text-text-muted mb-6">Answer a few questions to get started</p>

        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const done    = userTurns >= step.minTurns
            const current = userTurns === step.minTurns - 1
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                done    ? 'bg-emerald-50 border border-emerald-100' :
                current ? 'bg-brand-50  border border-brand-100' :
                          'border border-transparent'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  done    ? 'bg-emerald-500 text-white' :
                  current ? 'bg-brand-600  text-white' :
                            'bg-surface-100 text-text-muted'
                }`}>
                  {done
                    ? <CheckCircle className="w-4 h-4" />
                    : <step.icon className="w-4 h-4" />
                  }
                </div>
                <span className={`text-sm font-medium ${
                  done    ? 'text-emerald-700' :
                  current ? 'text-brand-700' :
                            'text-text-muted'
                }`}>
                  {step.label}
                </span>
                {current && (
                  <span className="ml-auto text-xs text-brand-500 font-semibold animate-pulse">Now</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Tips */}
        <div className="mt-auto pt-6 border-t border-surface-200">
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-brand-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> How it works
            </p>
            <p className="text-xs text-brand-600 leading-relaxed">
              PathMind AI builds your profile conversationally — no boring forms.
              The more you share, the more personalized your ML-powered roadmap.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
