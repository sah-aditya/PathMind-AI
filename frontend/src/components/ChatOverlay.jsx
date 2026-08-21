import { useState, useRef, useEffect } from 'react'
import { X, Send, Brain, Loader2, Sparkles } from 'lucide-react'
import { chatApi } from '../services/api'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  'Why was my top resource recommended?',
  'What should I focus on next?',
  'How long will my roadmap take?',
  'Explain my skill gap analysis',
]

export default function ChatOverlay({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your PathMind AI assistant. Ask me anything about your learning path, why a resource was recommended, or what to focus on next. 🎯",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (text = input) => {
    const msg = text.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { data } = await chatApi.send(msg, 'assistant')
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      toast.error('Could not reach AI assistant')
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again in a moment.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-end p-4 lg:p-6"
      style={{ background: 'rgba(15,23,42,0.15)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Chat panel */}
      <div className="w-full max-w-md flex flex-col bg-white rounded-2xl shadow-card-lg border border-surface-200 overflow-hidden animate-slide-up"
        style={{ height: 'min(600px, calc(100vh - 48px))' }}
      >
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 bg-white">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary text-sm">PathMind AI</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Online
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 -mr-1"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Messages ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Brain className="w-3 h-3 text-brand-600" />
                </div>
              )}
              <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <Brain className="w-3 h-3 text-brand-600" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                <span className="text-text-muted text-xs">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Suggestion chips (only when 1 message) ── */}
        {messages.length === 1 && !loading && (
          <div className="px-4 py-2 bg-white border-t border-surface-100">
            <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-500" /> Suggested questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input bar ──────────────────────────── */}
        <div className="px-3 py-3 border-t border-surface-200 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                // Auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
              }}
              placeholder="Ask anything about your path…"
              className="flex-1 resize-none input text-sm py-2.5 leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '100px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary px-3 py-2.5 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-text-muted mt-1.5 text-center">
            Shift+Enter for new line · Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}
