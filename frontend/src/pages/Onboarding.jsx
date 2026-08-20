import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Send, Loader2, CheckCircle, ArrowRight, Sparkles, User } from 'lucide-react'
import { chatApi, pathApi } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const WELCOME_MSG = {
  role: 'assistant',
  content: "👋 Hi! I'm PathMind AI. I'm here to build your personalized learning roadmap.\n\nLet's start simple — **what do you want to achieve?** For example:\n- \"I want to become a Machine Learning Engineer\"\n- \"I want to learn full-stack web development\"\n- \"I want to transition into data science\"\n\nTell me in your own words!"
}

export default function Onboarding() {
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileReady, setProfileReady] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [extractedProfile, setExtractedProfile] = useState(null)
  const bottomRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const { data } = await chatApi.send(text, 'onboarding')
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — chat */}
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 glass flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">PathMind AI</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Building your profile…
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                messages.filter(m => m.role === 'user').length > i
                  ? 'bg-brand-500'
                  : 'bg-white/10'
              }`} />
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai max-w-[80%]'}>
                <p className="whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  {user?.name?.[0] || 'U'}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-brand-400" />
                <span className="text-gray-500 text-xs">PathMind is thinking…</span>
              </div>
            </div>
          )}

          {/* Profile ready card */}
          {profileReady && (
            <div className="card border border-emerald-500/30 bg-emerald-900/10 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Profile Complete!</span>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                I've collected everything I need. Ready to generate your personalized learning roadmap?
              </p>
              {extractedProfile && (
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-white/5 rounded-lg p-2">
                    <span className="text-gray-500">Goal</span>
                    <p className="text-white font-medium mt-0.5 truncate">{extractedProfile.goal_text || '—'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <span className="text-gray-500">Level</span>
                    <p className="text-white font-medium mt-0.5 capitalize">{extractedProfile.experience_level || '—'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <span className="text-gray-500">Hours/week</span>
                    <p className="text-white font-medium mt-0.5">{extractedProfile.hours_per_week || 8}h</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <span className="text-gray-500">Skills known</span>
                    <p className="text-white font-medium mt-0.5">{extractedProfile.known_skills?.length || 0}</p>
                  </div>
                </div>
              )}
              <button onClick={handleGeneratePath} disabled={generating} className="btn-primary w-full justify-center">
                {generating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your roadmap…</>
                  : <><Sparkles className="w-4 h-4" /> Generate My Learning Path <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!profileReady && (
          <div className="p-4 border-t border-white/5 glass">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Tell PathMind AI your goal…"
                className="input flex-1"
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="btn-primary px-4 disabled:opacity-40 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">Press Enter to send · AI will ask 4–6 questions</p>
          </div>
        )}
      </div>

      {/* Right panel — progress indicator (desktop) */}
      <div className="hidden lg:flex w-80 flex-col glass border-l border-white/5 p-6">
        <h2 className="font-semibold text-white mb-6">Profile building</h2>
        <div className="space-y-4">
          {[
            { label: 'Learning goal', done: messages.filter(m => m.role === 'user').length >= 1 },
            { label: 'Experience level', done: messages.filter(m => m.role === 'user').length >= 2 },
            { label: 'Current skills', done: messages.filter(m => m.role === 'user').length >= 3 },
            { label: 'Weekly availability', done: messages.filter(m => m.role === 'user').length >= 4 },
            { label: 'Interests & preferences', done: profileReady },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 transition-all duration-300 ${
                step.done
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-white/20 bg-white/5'
              }`}>
                {step.done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm ${step.done ? 'text-white' : 'text-gray-500'}`}>{step.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <p className="text-xs text-gray-500 leading-relaxed">
            PathMind AI builds your profile conversationally — no boring forms. 
            The more you share, the more personalized your roadmap.
          </p>
        </div>
      </div>
    </div>
  )
}
