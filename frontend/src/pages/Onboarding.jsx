import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain, Send, Loader2, CheckCircle, ArrowRight,
  Sparkles, Clock, Target, BookOpen, Zap, RotateCcw
} from 'lucide-react'
import { chatApi, pathApi } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import MarkdownMessage from '../components/MarkdownMessage'

const WELCOME_MSG = {
  role: 'assistant',
  content: "👋 Hi! I'm PathMind AI. I'm here to build your personalized learning roadmap.\n\nLet's start simple — **what do you want to achieve?** For example:\n- \"I want to become a Commercial Pilot\"\n- \"I want to become a High School Teacher\"\n- \"I want to become a Machine Learning Engineer\"\n- \"I want to learn Full-Stack Web Development\"\n\nTell me your goal in your own words!",
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
    <div className="w-8 h-8 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-subtle">
      <Brain className="w-4 h-4 text-white" />
    </div>
  )
}

function UserAvatar({ name }) {
  const initials = (name || 'U')[0].toUpperCase()
  return (
    <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-subtle">
      {initials}
    </div>
  )
}

function MessageContent({ content }) {
  return <MarkdownMessage content={content} className="text-sm" />
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

  const handleReset = async () => {
    setMessages([WELCOME_MSG])
    setProfileReady(false)
    setExtractedProfile(null)
    setInput('')
    try {
      await chatApi.reset()
      toast.success('Started a fresh onboarding session!')
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    chatApi.reset().catch(() => {})
  }, [])

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
    
    const updatedMessages = [...messages, { role: 'user', content: text }]
    setMessages(updatedMessages)
    setLoading(true)
    
    try {
      const { data } = await chatApi.send(text, 'onboarding', updatedMessages)
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])

      if (data.profile_ready) {
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
    <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] bg-slate-100/80 dark:bg-darkBg-canvas rounded-2xl overflow-hidden border border-slate-200/80 dark:border-darkBg-border shadow-card">

      {/* ── Left: Chat panel ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-darkBg-card">

        {/* Chat header */}
        <div className="border-b border-slate-200/80 dark:border-darkBg-border px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AiAvatar />
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">PathMind AI Advisor</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {profileReady ? 'Profile complete!' : 'Building your curriculum…'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Start over"
              className="btn-ghost p-1.5 text-slate-500 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Over</span>
            </button>

            {/* Turn progress dots */}
            <div className="flex items-center gap-1.5 ml-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    userTurns > i ? 'bg-brand-500 scale-110' : 'bg-slate-200 dark:bg-darkBg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-fade-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && <AiAvatar />}

              <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <MessageContent content={m.content} />
              </div>

              {m.role === 'user' && <UserAvatar name={user?.name} />}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <AiAvatar />
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                <span className="text-slate-400 text-xs">PathMind is thinking…</span>
              </div>
            </div>
          )}

          {/* Profile ready card */}
          {profileReady && (
            <div className="animate-slide-up">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-5 shadow-card-md">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">Profile Complete!</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Ready to synthesize your DAG learning path</p>
                  </div>
                </div>

                {/* Profile summary grid */}
                {extractedProfile && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white dark:bg-darkBg-card border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">Goal</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
                        {extractedProfile.goal_text || '—'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-darkBg-card border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">Level</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white capitalize">
                        {extractedProfile.experience_level || '—'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-darkBg-card border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">Hours/week</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        {extractedProfile.hours_per_week || 8}h
                      </p>
                    </div>
                    <div className="bg-white dark:bg-darkBg-card border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-mono mb-0.5">Skills identified</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        {extractedProfile.known_skills?.length || 0} skills
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGeneratePath}
                  disabled={generating}
                  className="btn-primary w-full justify-center py-3"
                >
                  {generating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing DAG roadmap…</>
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
          <div className="border-t border-slate-200/80 dark:border-darkBg-border p-4 bg-white dark:bg-darkBg-card">
            <div className="flex gap-2.5 max-w-3xl mx-auto">
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
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Press Enter to send · PathMind will ask {Math.max(0, 4 - userTurns)} more question{Math.max(0, 4 - userTurns) !== 1 ? 's' : ''} to build your profile
            </p>
          </div>
        )}
      </div>

      {/* ── Right: Progress steps panel (Desktop only) ── */}
      <div className="hidden lg:flex w-72 flex-col bg-slate-50 dark:bg-darkBg-cardSub/40 border-l border-slate-200/80 dark:border-darkBg-border p-5">
        <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">Profile Discovery</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Answer a few questions to calibrate your path</p>

        <div className="space-y-2.5">
          {STEPS.map((step, i) => {
            const done    = userTurns >= step.minTurns
            const current = userTurns === step.minTurns - 1
            return (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                done    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40' :
                current ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/40' :
                          'border border-transparent'
              }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  done    ? 'bg-emerald-600 text-white' :
                  current ? 'bg-brand-600 text-white' :
                            'bg-slate-200 dark:bg-darkBg-border text-slate-400'
                }`}>
                  {done
                    ? <CheckCircle className="w-3.5 h-3.5" />
                    : <step.icon className="w-3.5 h-3.5" />
                  }
                </div>
                <span className={`text-xs font-medium ${
                  done    ? 'text-emerald-700 dark:text-emerald-300' :
                  current ? 'text-brand-700 dark:text-brand-300 font-semibold' :
                            'text-slate-400 dark:text-slate-500'
                }`}>
                  {step.label}
                </span>
                {current && (
                  <span className="ml-auto text-[10px] text-brand-600 dark:text-brand-400 font-bold animate-pulse">Now</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Info card */}
        <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-darkBg-border">
          <div className="bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/40 rounded-xl p-3">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Graph Assembly
            </p>
            <p className="text-[11px] text-brand-600 dark:text-brand-400 leading-relaxed">
              PathMind sequences prerequisite skills into a topological graph tailored to your background.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
