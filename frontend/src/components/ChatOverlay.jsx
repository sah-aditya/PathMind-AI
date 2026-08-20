import { useState, useRef, useEffect } from 'react'
import { X, Send, Brain, Loader2 } from 'lucide-react'
import { chatApi } from '../services/api'
import toast from 'react-hot-toast'

export default function ChatOverlay({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your PathMind AI assistant. Ask me anything about your learning path, why a resource was recommended, or what to focus on next. 🎯",
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const { data } = await chatApi.send(text, 'assistant')
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      toast.error('Could not reach AI assistant')
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I ran into an issue. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 lg:p-6 pointer-events-none">
      <div className="w-full max-w-md h-[600px] flex flex-col glass rounded-2xl border border-brand-600/30 shadow-2xl shadow-brand-500/20 pointer-events-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-white">PathMind AI</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-brand-400" />
                <span className="text-gray-500 text-xs">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything about your path…"
              className="input text-xs py-2.5 flex-1"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="btn-primary px-3 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
