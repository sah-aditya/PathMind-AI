import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import {
  ChevronDown, ChevronRight, Clock, Star, CheckCircle, PlayCircle,
  BookOpen, Wrench, ClipboardList, Lock, Loader2, Map,
  AlertTriangle, RefreshCw, Flag, Zap, ArrowRight,
  GitBranch, Compass, Award, ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import useThemeStore from '../store/themeStore'

/* ── Constants ────────────────────────────────────────── */
const TYPE_ICON   = { course: BookOpen, project: Wrench, assessment: ClipboardList }
const TYPE_CLASS  = { course: 'badge-neutral', project: 'badge-indigo', assessment: 'badge-yellow' }
const DIFF_CLASS  = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' }

const STATUS_CONFIG = {
  pending:     { label: 'Not started', dot: 'bg-slate-300 dark:bg-zinc-600', text: 'text-slate-400 dark:text-zinc-500' },
  in_progress: { label: 'In progress', dot: 'bg-amber-500',                   text: 'text-amber-700 dark:text-amber-300' },
  completed:   { label: 'Completed',   dot: 'bg-emerald-600 dark:bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-300' },
  skipped:     { label: 'Skipped',     dot: 'bg-slate-300 dark:bg-zinc-600', text: 'text-slate-400 dark:text-zinc-500' },
}

/* ── Skeleton Loading State ───────────────────────────── */
function RoadmapSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-slate-200 dark:bg-darkBg-cardSub rounded" />
        <div className="h-7 w-72 bg-slate-200 dark:bg-darkBg-cardSub rounded" />
      </div>
      <div className="card h-32 bg-white dark:bg-darkBg-card" />
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-darkBg-cardSub flex-shrink-0" />
            <div className="flex-1 card h-32 bg-white dark:bg-darkBg-card" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Resource Card ────────────────────────────────────── */
function ResourceCard({ item, onStatusChange, onOpen }) {
  const Icon = TYPE_ICON[item.type] || BookOpen
  const cfg  = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
  const isCompleted  = item.status === 'completed'
  const isInProgress = item.status === 'in_progress'
  const isRevision   = item.is_revision

  return (
    <div
      onClick={() => onOpen(item)}
      className={`
        group relative bg-white dark:bg-darkBg-card border rounded-2xl p-4 cursor-pointer
        transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700 shadow-subtle
        ${isCompleted  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10' : ''}
        ${isInProgress ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10' : ''}
        ${!isCompleted && !isInProgress ? 'border-slate-200/80 dark:border-darkBg-border' : ''}
      `}
    >
      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <div className={`
          w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
          ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : isInProgress ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-darkBg-cardSub text-slate-700 dark:text-slate-300'}
        `}>
          {isCompleted
            ? <CheckCircle className="w-4 h-4" />
            : <Icon className="w-4 h-4" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm font-semibold leading-snug ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
              {item.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isRevision && <span className="badge badge-yellow text-[10px]">Adaptive Revision</span>}
              <span className={`flex items-center gap-1 text-xs font-medium ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`badge ${TYPE_CLASS[item.type] || 'badge-gray'} text-[10px] uppercase`}>{item.type}</span>
            <span className={`badge ${DIFF_CLASS[item.difficulty] || 'badge-gray'} text-[10px]`}>{item.difficulty}</span>
            {item.has_assessment && <span className="badge badge-indigo text-[10px]">Assessment Check</span>}
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3" /> {item.duration_hours}h
            </span>
            {item.rating && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Row */}
      {!isCompleted && (
        <div className="flex gap-2 mt-3 pl-12" onClick={e => e.stopPropagation()}>
          {item.status === 'pending' && (
            <button
              onClick={() => onStatusChange(item.id, 'in_progress')}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Start Unit
            </button>
          )}
          {item.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(item.id, 'completed')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Complete Unit
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Phase Accordion ──────────────────────────────────── */
function PhaseAccordion({ phase, onStatusChange, onOpen, defaultOpen, isLast }) {
  const [open, setOpen] = useState(defaultOpen)
  const progress  = phase.items_total > 0 ? (phase.items_completed / phase.items_total) * 100 : 0
  const isLocked  = phase.status === 'locked'
  const isDone    = phase.items_completed === phase.items_total && phase.items_total > 0

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center flex-shrink-0 w-9">
        <div className={`
          w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold z-10
          ${isLocked ? 'bg-slate-200 dark:bg-darkBg-cardSub text-slate-400 border border-slate-300 dark:border-darkBg-border' : isDone ? 'bg-emerald-600 text-white' : 'bg-brand-600 text-white shadow-subtle'}
        `}>
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : isDone ? <CheckCircle className="w-3.5 h-3.5" /> : phase.phase_number}
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 bg-slate-200 dark:bg-darkBg-border mt-2 mb-0 min-h-[24px]" />
        )}
      </div>

      {/* Card Body */}
      <div className={`flex-1 mb-5 ${isLocked ? 'opacity-60' : ''}`}>
        <div className="card p-5">
          <button
            className="w-full flex items-start gap-3 text-left"
            onClick={() => !isLocked && setOpen(!open)}
            disabled={isLocked}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{phase.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Week {phase.week_start}–{phase.week_end}
                  </span>
                  {!isLocked && (
                    open
                      ? <ChevronDown className="w-4 h-4 text-slate-400" />
                      : <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {!isLocked && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="progress-bar flex-1 h-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-600' : 'bg-brand-600'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0 font-medium">
                    {phase.items_completed}/{phase.items_total} Done
                  </span>
                </div>
              )}
            </div>
          </button>

          {open && !isLocked && (
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-darkBg-border space-y-3">
              {phase.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 pb-1">{phase.description}</p>
              )}
              {phase.items.map(item => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  onStatusChange={onStatusChange}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main Roadmap Page ────────────────────────────────── */
export default function Roadmap() {
  const navigate  = useNavigate()
  const qc        = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['active-path'],
    queryFn:  () => pathApi.getActive().then(r => r.data.path),
  })

  const statusMutation = useMutation({
    mutationFn: ({ itemId, status }) => pathApi.updateItemStatus(itemId, status),
    onSuccess:  () => { qc.invalidateQueries(['active-path']); qc.invalidateQueries(['dashboard']) },
    onError:    () => toast.error('Failed to update milestone status'),
  })

  const generateMutation = useMutation({
    mutationFn: () => pathApi.generate(),
    onSuccess:  () => { qc.invalidateQueries(['active-path']); toast.success('Learning path refreshed') },
    onError:    err => toast.error(err.response?.data?.detail || 'Failed to generate path'),
  })

  if (isLoading) {
    return <RoadmapSkeleton />
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="card text-center max-w-sm w-full p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-darkBg-cardSub flex items-center justify-center mx-auto text-slate-700 dark:text-slate-200">
            <Map className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base">No Active Roadmap Found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Complete onboarding to configure your career goals and generate your sequenced learning schedule.
          </p>
          <div className="space-y-2 pt-2">
            <button onClick={() => navigate('/onboarding')} className="btn-primary w-full justify-center text-xs">
              Start Onboarding <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="btn-secondary w-full justify-center text-xs"
            >
              {generateMutation.isPending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing…</>
                : <><RefreshCw className="w-3.5 h-3.5" /> Synthesize Curriculum</>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const overallPct = Math.round((data.overall_progress || 0) * 100)

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Page Header ───────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
            <Map className="w-3.5 h-3.5" /> Phased Milestone Schedule
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{data.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-mono">
            Week {data.current_week} of {data.total_weeks} · {overallPct}% completed
          </p>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="btn-ghost text-xs flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>
      </div>

      {/* ── Visual Subway Pipeline Infographic ──────── */}
      <div className="card p-6 bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-darkBg-border pb-3">
          <div>
            <span className="text-[10px] font-mono font-semibold text-brand-600 dark:text-brand-400 uppercase">Interactive Subway Track</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Milestone Pipeline</h2>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {data.phases.length} Total Phased Stages
          </span>
        </div>

        {/* Horizontal Subway Stations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {data.phases.map((ph, idx) => {
            const isCompleted = ph.items_completed === ph.items_total && ph.items_total > 0
            const isCurrent = ph.status === 'in_progress' || (!isCompleted && ph.status !== 'locked' && idx === 0)
            const isLocked = ph.status === 'locked'

            return (
              <div
                key={ph.id}
                className={`p-4 rounded-2xl border space-y-2 relative transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : isCurrent
                    ? 'bg-brand-50/50 dark:bg-brand-950/20 border-brand-300 dark:border-brand-700 shadow-card'
                    : 'bg-slate-50 dark:bg-darkBg-cardSub/40 border-slate-200/80 dark:border-darkBg-border opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">0{ph.phase_number}</span>
                  {isCompleted && (
                    <span className="badge badge-green text-[10px]">Done</span>
                  )}
                  {isCurrent && (
                    <span className="badge badge-indigo text-[10px] animate-pulse">Active</span>
                  )}
                  {isLocked && (
                    <span className="badge badge-gray text-[10px]">Locked</span>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2">{ph.title}</h3>
                
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                  <span>W{ph.week_start}–W{ph.week_end}</span>
                  <span>{ph.items_total} Units</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* ── Phase List ─────────────────────────────── */}
      <div className="space-y-2">
        {data.phases.map((phase, idx) => (
          <PhaseAccordion
            key={phase.id}
            phase={phase}
            defaultOpen={idx === 0 || phase.status === 'in_progress'}
            isLast={idx === data.phases.length - 1}
            onStatusChange={(itemId, status) => statusMutation.mutate({ itemId, status })}
            onOpen={item => navigate(`/resource/${item.resource_id}`, { state: { pathItemId: item.id } })}
          />
        ))}
      </div>

    </div>
  )
}
