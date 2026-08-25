import { useState, useRef, useEffect } from 'react'
import {
  X, Send, Brain, Loader2, Bot, MessageSquare, AlertTriangle,
  Volume2, Download, Trash2, Sparkles, Check, Code, HelpCircle
} from 'lucide-react'
import { chatApi } from '../services/api'
import toast from 'react-hot-toast'
import MarkdownMessage from './MarkdownMessage'

const SMART_ACTION_PILLS = [
  { id: 'analogy', label: '💡 Explain with Analogy', prompt: 'Explain the core concept of my current learning unit using an intuitive real-world analogy.' },
  { id: 'quiz', label: '📝 3 Practice Questions', prompt: 'Generate 3 quick practical multiple-choice quiz questions to test my understanding of this topic with answers explained.' },
  { id: 'project', label: '🚀 Mini-Project Idea', prompt: 'Suggest a hands-on 1-day mini project I can build to master this specific skill for my portfolio.' },
  { id: 'interview', label: '🎯 Interview Tech Questions', prompt: 'What are the top 3 interview questions top tech companies ask about this specific skill and how to answer them?' },
  { id: 'debug', label: '🐞 Debug / Review Code', prompt: 'I want to review my code. What common pitfalls, memory bugs, or anti-patterns should I avoid for this topic?' },
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
        : "Hello! I'm your **PathMind AI** learning advisor. Ask me anything about your curriculum, prerequisite dependencies, or click a smart action pill below.",
      time: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSpeakText = (text, idx) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported on this browser.')
      return
    }

    if (speakingIndex === idx) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*_#`]/g, '')
    const utter = new SpeechSynthesisUtterance(cleanText)
    
    let speed = 1.0
    try { speed = Number(localStorage.getItem('pathmind_tts_speed')) || 1.0 } catch {}
    utter.rate = speed

    utter.onend = () => setSpeakingIndex(null)
    utter.onerror = () => setSpeakingIndex(null)
    
    setSpeakingIndex(idx)
    window.speechSynthesis.speak(utter)
  }

  const handleExportChat = () => {
    if (messages.length <= 1) {
      toast.error('No conversation to export yet.')
      return
    }

    const lines = messages.map(m => `### ${m.role === 'user' ? 'Learner' : 'PathMind AI Advisor'} [${formatTime(m.time)}]\n\n${m.content}\n\n---\n`).join('\n')
    const blob = new Blob([lines], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pathmind_chat_session_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Chat dialogue exported to Markdown file!')
  }

  const handleClearHistory = async () => {
    try {
      await chatApi.reset()
      setMessages([
        {
          role: 'assistant',
          content: "Conversation history cleared! How can I assist you on your roadmap today?",
          time: new Date(),
        }
      ])
      toast.success('Chat history cleared.')
    } catch {
      toast.error('Failed to clear chat history.')
    }
  }

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
        className="w-full max-w-lg flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden animate-slide-up"
        style={{ height: 'min(640px, calc(100vh - 35px))' }}
      >
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-subtle">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                <span>PathMind AI Studio Mentor</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Context-Aware Curriculum Advisor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleExportChat}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-zinc-200 rounded-lg transition-colors"
              title="Download Conversation (.md)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
              title="Clear Chat History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Messages ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-slate-50 dark:bg-zinc-950/60">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-white/[0.06]">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className="flex flex-col gap-1" style={{ maxWidth: '85%' }}>
                <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai group relative'}>
                  {m.role === 'user'
                    ? <p className="text-xs sm:text-sm leading-relaxed">{m.content}</p>
                    : (
                      <div>
                        <MarkdownMessage content={m.content} className="text-xs sm:text-sm" />
                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                          <button
                            onClick={() => handleSpeakText(m.content, i)}
                            className={`text-[10px] font-mono flex items-center gap-1 transition-colors ${
                              speakingIndex === i
                                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300'
                            }`}
                            title="Listen to response (TTS)"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{speakingIndex === i ? 'Speaking… (Click to Stop)' : 'Listen'}</span>
                          </button>
                        </div>
                      </div>
                    )
                  }
                </div>
                {m.time && (
                  <span className={`text-[10px] text-slate-400 font-mono ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(m.time)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2 py-2 px-3">
                <span className="flex gap-1">
                  {[0, 1, 2].map(n => (
                    <span
                      key={n}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"
                      style={{ animationDelay: `${n * 0.2}s` }}
                    />
                  ))}
                </span>
                <span className="text-slate-400 text-xs font-mono">Synthesizing answer…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Smart Context Action Pills Bar ─────────────────── */}
        {!loading && (
          <div className="px-3 py-2 bg-white dark:bg-zinc-900 border-t border-slate-200/80 dark:border-white/[0.06] overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {SMART_ACTION_PILLS.map(p => (
                <button
                  key={p.id}
                  onClick={() => sendMessage(p.prompt)}
                  className="text-[11px] font-semibold whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-white/[0.04] hover:border-indigo-400 hover:text-indigo-600 transition-all flex-shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input bar ──────────────────────────── */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
          {isPaused ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
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
                placeholder="Ask about this unit, request code review, or explain..."
                className="flex-1 resize-none input text-xs py-2 leading-relaxed"
                style={{ minHeight: '38px', maxHeight: '90px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="btn-primary px-3.5 py-2 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-[10px] text-slate-400 mt-1 text-center font-mono">
            {isPaused ? 'Service Under Maintenance' : 'Press Enter to send · Shift+Enter for new line · Press Ctrl+K for Spotlight'}
          </p>
        </div>
      </div>
    </div>
  )
}
