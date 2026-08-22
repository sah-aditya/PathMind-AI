import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportApi } from '../services/api'
import {
  LifeBuoy, Plus, MessageSquare, CheckCircle2, AlertCircle,
  Clock, Send, HelpCircle, ChevronRight, Check, Sparkles,
  ArrowLeft, Shield, BookOpen, AlertTriangle
} from 'lucide-react'
import useAuthStore from '../store/authStore'

const FAQ_ITEMS = [
  {
    q: 'How does the Topological Learning Roadmap generate steps?',
    a: 'PathMind AI decomposes your chosen career goal into atomic technical competencies, using Kahn’s Topological DAG algorithm to sequence foundational prerequisites before complex applied modules.',
  },
  {
    q: 'Can I re-target my goal or change career tracks?',
    a: 'Yes! You can re-onboard at any time from the AI Advisor or Navigation menu to generate a fresh curriculum aligned with your new career aspiration.',
  },
  {
    q: 'How do skill checks and mastery levels update?',
    a: 'When you take an adaptive skill quiz in the Skill Gap analyzer, Bayesian probability models update your proficiency scores in real time.',
  },
]

export default function Help() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketCategory, setTicketCategory] = useState('curriculum')
  const [ticketPriority, setTicketPriority] = useState('normal')
  const [ticketMessage, setTicketMessage] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [successToast, setSuccessToast] = useState('')

  // 1. Fetch user's tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['userSupportTickets'],
    queryFn: () => supportApi.getTickets().then(r => r.data),
    refetchInterval: 10000,
  })

  // 2. Fetch active ticket details
  const { data: activeTicket, isLoading: detailLoading } = useQuery({
    queryKey: ['userSupportTicketDetail', selectedTicketId],
    queryFn: () => supportApi.getTicketDetail(selectedTicketId).then(r => r.data),
    enabled: !!selectedTicketId,
    refetchInterval: 5000,
  })

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: (data) => supportApi.createTicket(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['userSupportTickets'] })
      setCreateModalOpen(false)
      setTicketSubject('')
      setTicketMessage('')
      setSuccessToast('Your support request has been submitted. Our team will review it shortly.')
      setTimeout(() => setSuccessToast(''), 4000)
      if (res.data?.ticket_id) {
        setSelectedTicketId(res.data.ticket_id)
      }
    },
  })

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }) => supportApi.replyTicket(ticketId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSupportTicketDetail', selectedTicketId] })
      queryClient.invalidateQueries({ queryKey: ['userSupportTickets'] })
      setReplyInput('')
    },
  })

  const resolveMutation = useMutation({
    mutationFn: (ticketId) => supportApi.resolveTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSupportTicketDetail', selectedTicketId] })
      queryClient.invalidateQueries({ queryKey: ['userSupportTickets'] })
      setSuccessToast('Support query marked as resolved.')
      setTimeout(() => setSuccessToast(''), 3000)
    },
  })

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress')
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-6 space-y-8">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-darkBg-border pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5" /> Learner Support Center
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Help & Query Resolution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Have questions regarding your curriculum, skill roadmap, or platform features? Raise a ticket and get direct support.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary rounded-2xl text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Raise Support Request
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ── Main Layout: Ticket List & Conversation ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Tickets Queue (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Your Queries ({tickets.length})
            </h2>
            {openTickets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {openTickets.length} Active
              </span>
            )}
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {ticketsLoading ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border text-center text-xs text-slate-400">
                Loading support requests…
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-darkBg-cardSub flex items-center justify-center mx-auto text-slate-400">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Active Queries</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Everything looks clear! If you ever need guidance or find an issue, click "Raise Support Request" above.
                </p>
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicketId === t.id
                const isResolved = t.status === 'resolved' || t.status === 'closed'
                const hasAdminReply = t.last_sender_role === 'admin'

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 ring-2 ring-brand-400/30'
                        : 'bg-white dark:bg-darkBg-card border-slate-200/80 dark:border-darkBg-border hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : t.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {t.subject}
                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {t.latest_message}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-darkBg-border text-[10px] text-slate-400">
                      <span className="capitalize">{t.category.replace('_', ' ')}</span>
                      {hasAdminReply && !isResolved && (
                        <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Admin replied
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Quick FAQ Section */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-darkBg-cardSub/40 border border-slate-200/80 dark:border-darkBg-border space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked
            </h3>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={idx} className="group text-xs">
                  <summary className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer list-none flex items-center justify-between py-1 hover:text-brand-600 transition-colors">
                    <span>{item.q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-brand-300 dark:border-brand-700">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Conversation Thread (7 cols) */}
        <div className="lg:col-span-7">
          {selectedTicketId && activeTicket ? (
            <div className="rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card overflow-hidden flex flex-col h-[700px]">
              
              {/* Thread Header */}
              <div className="p-5 border-b border-slate-100 dark:border-darkBg-border bg-slate-50/50 dark:bg-darkBg-cardSub/30 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      activeTicket.status === 'resolved' || activeTicket.status === 'closed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {activeTicket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      {activeTicket.category.replace('_', ' ')} • Priority: {activeTicket.priority}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeTicket.subject}
                  </h2>
                </div>

                {activeTicket.status !== 'resolved' && activeTicket.status !== 'closed' && (
                  <button
                    onClick={() => resolveMutation.mutate(activeTicket.id)}
                    disabled={resolveMutation.isPending}
                    className="btn-secondary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                )}
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {activeTicket.messages.map((m) => {
                  const isAdmin = m.sender_role === 'admin'

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {isAdmin ? 'PathMind Support' : 'You'}
                        </span>
                        <span>•</span>
                        <span>{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-slate-900 dark:text-slate-100 rounded-tl-sm shadow-subtle'
                            : 'bg-brand-600 text-white rounded-tr-sm shadow-subtle'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply Form */}
              <div className="p-4 border-t border-slate-100 dark:border-darkBg-border bg-slate-50/50 dark:bg-darkBg-cardSub/20">
                {activeTicket.status === 'resolved' || activeTicket.status === 'closed' ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-800 dark:text-emerald-300">
                    This query was marked resolved. Sending a new reply will automatically reopen this request.
                  </div>
                ) : null}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!replyInput.trim()) return
                    replyMutation.mutate({ ticketId: activeTicket.id, message: replyInput.trim() })
                  }}
                  className="flex items-center gap-2 mt-2"
                >
                  <input
                    type="text"
                    placeholder="Type your follow-up message..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={replyMutation.isPending || !replyInput.trim()}
                    className="btn-primary rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card p-12 text-center flex flex-col items-center justify-center h-[500px] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Select a Query Thread
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Click on an existing support request from the list to view replies from PathMind support, or raise a new request.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="btn-secondary rounded-xl text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create Request
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Create New Support Request Modal ─────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-4">
              <div className="flex items-center gap-2.5 text-brand-600 dark:text-brand-400">
                <LifeBuoy className="w-5 h-5" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Raise Support Request
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!ticketSubject.trim() || !ticketMessage.trim()) return
                createTicketMutation.mutate({
                  subject: ticketSubject.trim(),
                  category: ticketCategory,
                  priority: ticketPriority,
                  initial_message: ticketMessage.trim(),
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Broken link on Distributed Systems Step 3"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="curriculum" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">Curriculum Guidance</option>
                    <option value="resource_issue" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">Resource Issue / Broken Link</option>
                    <option value="account_access" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">Account & Login</option>
                    <option value="feature_request" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">Feature Suggestion</option>
                    <option value="general" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="normal" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">Normal</option>
                    <option value="high" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">High</option>
                    <option value="urgent" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Detailed Explanation
                </label>
                <textarea
                  rows="4"
                  placeholder="Describe your issue or question in detail..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-darkBg-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  className="btn-primary text-xs px-5 py-2 rounded-xl font-semibold"
                >
                  {createTicketMutation.isPending ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
