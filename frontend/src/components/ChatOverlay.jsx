import { useState, useRef, useEffect } from 'react'
import { X, Send, Brain, Loader2, Bot, MessageSquare, AlertTriangle } from 'lucide-react'
import { chatApi } from '../services/api'
import toast from 'react-hot-toast'
import MarkdownMessage from './MarkdownMessage'

const SUGGESTIONS = [
  'Why was my top resource recommended?',
  'What should I focus on next?',
  'How long will my roadmap take?',
  'Explain my skill gap analysis',
]

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatOverlay({ onClose, isPaused = false }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: isPaused 
        ? "⚠️ **AI Advisor is Offline**: The conversational advisor service is temporarily paused for scheduled maintenance by administration. Please check back shortly."
        : "Hello! I'm your **PathMind AI** learning advisor. Ask me anything about your curriculum, prerequisite dependencies, or personalized recommendations.",
      time: new Date(),
    },
  ])
  const [input, setInput]     = useState('')
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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    setMessages(m => [...m, { role: 'user', content: msg, time: new Date() }])
    setLoading(true)
    try {
      const { data } = await chatApi.send(msg, 'assistant')
      setMessages(m => [...m, { role: 'assistant', content: data.reply, time: new Date() }])
    } catch {
      toast.error('Could not reach AI advisor')
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'I encountered an issue generating a response. Please try again in a moment.',
        time: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end p-3 sm:p-5"
      style={{ background: 'rgba(15,23,42,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Chat panel */}
      <div
        className="w-full max-w-md flex flex-col bg-white dark:bg-darkBg-card rounded-2xl shadow-elevated border border-slate-200/80 dark:border-darkBg-border overflow-hidden animate-slide-up"
        style={{ height: 'min(600px, calc(100vh - 40px))' }}
      >
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-200/80 dark:border-darkBg-border bg-white dark:bg-darkBg-card">
          <div className="w-7 h-7 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white flex-shrink-0 shadow-subtle">
            <Brain className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight">PathMind AI Advisor</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active Session
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Messages ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-slate-50 dark:bg-darkBg-canvas">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-950/60 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-600 dark:text-brand-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="flex flex-col gap-1" style={{ maxWidth: '84%' }}>
                <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {m.role === 'user'
                    ? <p className="text-sm leading-relaxed">{m.content}</p>
                    : <MarkdownMessage content={m.content} className="text-sm" />
                  }
                </div>
                {m.time && (
                  <span className={`text-[10px] text-slate-400 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(m.time)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-950/60 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-600 dark:text-brand-400">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2 py-2 px-3">
                <span className="flex gap-1">
                  {[0, 1, 2].map(n => (
                    <span
                      key={n}
                      className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"
                      style={{ animationDelay: `${n * 0.2}s` }}
                    />
                  ))}
                </span>
                <span className="text-slate-400 text-xs">Analyzing…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Suggested Questions ─────────────────── */}
        {messages.length === 1 && !loading && (
          <div className="px-3.5 py-2.5 bg-white dark:bg-darkBg-card border-t border-slate-200/80 dark:border-darkBg-border">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
              <MessageSquare className="w-3 h-3" /> Quick Inquiries
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-darkBg-cardSub text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-darkBg-border hover:bg-slate-200/60 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input bar ──────────────────────────── */}
        <div className="p-3 border-t border-slate-200/80 dark:border-darkBg-border bg-white dark:bg-darkBg-card">
          {isPaused ? (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>AI Advisor responses are temporarily paused for maintenance.</span>
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                }}
                placeholder="Ask about your learning path…"
                className="flex-1 resize-none input text-xs py-2 leading-relaxed"
                style={{ minHeight: '38px', maxHeight: '90px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="btn-primary px-3 py-2 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-[10px] text-slate-400 mt-1 text-center font-mono">
            {isPaused ? 'Service Under Maintenance' : 'Enter to send · Shift+Enter for new line'}
          </p>
        </div>
      </div>
    </div>
  )
}
