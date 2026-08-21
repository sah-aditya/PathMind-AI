import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import {
  ChevronDown, ChevronRight, Clock, Star, CheckCircle, PlayCircle,
  BookOpen, Wrench, ClipboardList, Lock, Loader2, Map,
  AlertTriangle, RefreshCw, Flag, Zap, ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ── Constants ────────────────────────────────────────── */
const TYPE_ICON   = { course: BookOpen, project: Wrench, assessment: ClipboardList }
const TYPE_CLASS  = { course: 'badge-blue', project: 'badge-purple', assessment: 'badge-yellow' }
const DIFF_CLASS  = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' }

const STATUS_CONFIG = {
  pending:     { label: 'Not started', dot: 'bg-slate-300',   text: 'text-text-muted' },
  in_progress: { label: 'In progress', dot: 'bg-amber-400',   text: 'text-amber-600' },
  completed:   { label: 'Completed',   dot: 'bg-emerald-500', text: 'text-emerald-600' },
  skipped:     { label: 'Skipped',     dot: 'bg-slate-300',   text: 'text-text-muted' },
}

/* ── Resource card ────────────────────────────────────── */
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
        group relative bg-white border rounded-xl p-4 cursor-pointer
        transition-all duration-200 hover:shadow-card-md hover:-translate-y-0.5
        ${isCompleted  ? 'border-emerald-200 bg-emerald-50/40' : ''}
        ${isInProgress ? 'border-amber-200 bg-amber-50/30' : ''}
        ${isRevision && !isCompleted ? 'border-amber-200' : ''}
        ${!isCompleted && !isInProgress ? 'border-surface-200' : ''}
      `}
    >
      {/* Left accent bar */}
      <div className={`
        absolute left-0 inset-y-0 w-1 rounded-l-xl
        ${isCompleted ? 'bg-emerald-400' : isInProgress ? 'bg-amber-400' : 'bg-transparent group-hover:bg-brand-400'}
        transition-colors
      `} />

      <div className="flex items-start gap-3 pl-2">
        {/* Icon */}
        <div className={`
          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
          ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-50 text-brand-600'}
        `}>
          {isCompleted
            ? <CheckCircle className="w-4 h-4" />
            : <Icon className="w-4 h-4" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className={`text-sm font-semibold leading-tight ${isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}`}>
              {item.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isRevision && <span className="badge badge-yellow">Revision</span>}
              <span className={`flex items-center gap-1 text-xs font-medium ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${TYPE_CLASS[item.type] || 'badge-gray'}`}>{item.type}</span>
            <span className={`badge ${DIFF_CLASS[item.difficulty] || 'badge-gray'}`}>{item.difficulty}</span>
            {item.has_assessment && <span className="badge badge-indigo">Assessment</span>}
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3" /> {item.duration_hours}h
            </span>
            {item.rating && (
              <span className="flex items-center gap-1 text-xs text-amber-500">
                <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action row */}
      {!isCompleted && (
        <div className="flex gap-2 mt-3 pl-11" onClick={e => e.stopPropagation()}>
          {item.status === 'pending' && (
            <button
              onClick={() => onStatusChange(item.id, 'in_progress')}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <PlayCircle className="w-3 h-3" /> Start
            </button>
          )}
          {item.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(item.id, 'completed')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                         bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle className="w-3 h-3" /> Mark complete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Phase accordion ──────────────────────────────────── */
function PhaseAccordion({ phase, onStatusChange, onOpen, defaultOpen, isLast }) {
  const [open, setOpen] = useState(defaultOpen)
  const progress  = phase.items_total > 0 ? (phase.items_completed / phase.items_total) * 100 : 0
  const isLocked  = phase.status === 'locked'
  const isDone    = phase.items_completed === phase.items_total && phase.items_total > 0

  return (
    <div className="relative flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        {/* Phase circle */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black z-10
          ${isLocked ? 'bg-surface-200 text-text-muted' : isDone ? 'bg-emerald-500 text-white' : 'bg-brand-600 text-white shadow-brand-sm'}
        `}>
          {isLocked ? <Lock className="w-4 h-4" /> : isDone ? <CheckCircle className="w-4 h-4" /> : phase.phase_number}
        </div>
        {/* Connector */}
        {!isLast && (
          <div className="flex-1 w-0.5 bg-surface-200 mt-2 mb-0 min-h-[24px]" />
        )}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-6 ${isLocked ? 'opacity-60' : ''}`}>
        <div className="card shadow-card">
          {/* Phase header */}
          <button
            className="w-full flex items-start gap-3 text-left"
            onClick={() => !isLocked && setOpen(!open)}
            disabled={isLocked}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-text-primary text-sm leading-tight">{phase.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-text-muted">
                    Week {phase.week_start}–{phase.week_end}
                  </span>
                  {!isLocked && (
                    open
                      ? <ChevronDown className="w-4 h-4 text-text-muted" />
                      : <ChevronRight className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              </div>

              {!isLocked && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="progress-bar flex-1 h-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-emerald-500' : 'bg-brand-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted flex-shrink-0 font-medium">
                    {phase.items_completed}/{phase.items_total}
                  </span>
                  {isDone && <span className="badge badge-green">Done</span>}
                </div>
              )}
            </div>
          </button>

          {/* Expanded content */}
          {open && !isLocked && (
            <div className="mt-4 pt-4 border-t border-surface-200 space-y-2">
              {phase.description && (
                <p className="text-xs text-text-muted mb-3 pb-2">{phase.description}</p>
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

/* ── Main Roadmap page ────────────────────────────────── */
export default function Roadmap() {
  const navigate  = useNavigate()
  const qc        = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['active-path'],
    queryFn:  () => pathApi.getActive().then(r => r.data.path),
  })

  const statusMutation = useMutation({
    mutationFn: ({ itemId, status }) => pathApi.updateItemStatus(itemId, status),
    onSuccess:  () => { qc.invalidateQueries(['active-path']); qc.invalidateQueries(['dashboard']) },
    onError:    () => toast.error('Failed to update status'),
  })

  const generateMutation = useMutation({
    mutationFn: () => pathApi.generate(),
    onSuccess:  () => { qc.invalidateQueries(['active-path']); toast.success('Learning path generated!') },
    onError:    err => toast.error(err.response?.data?.detail || 'Failed to generate path'),
  })

  /* ── Loading ── */
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
        <p className="text-text-secondary text-sm">Loading your roadmap…</p>
      </div>
    </div>
  )

  /* ── Empty state ── */
  if (!data) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)] px-4">
      <div className="card text-center max-w-sm w-full shadow-card-lg">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Map className="w-7 h-7 text-brand-600" />
        </div>
        <h2 className="font-bold text-text-primary text-lg mb-2">No active path yet</h2>
        <p className="text-text-secondary text-sm mb-6">
          Complete onboarding first, then generate your ML-powered roadmap.
        </p>
        <div className="space-y-2">
          <button onClick={() => navigate('/onboarding')} className="btn-primary w-full justify-center">
            Start Onboarding <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn-secondary w-full justify-center"
          >
            {generateMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              : <><RefreshCw className="w-4 h-4" /> Generate Path</>}
          </button>
        </div>
      </div>
    </div>
  )

  const overallPct = Math.round((data.overall_progress || 0) * 100)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Header ────────────────────────────────── */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 mb-2 uppercase tracking-wide">
              <Map className="w-3.5 h-3.5" /> Learning Roadmap
            </div>
            <h1 className="text-2xl font-black text-text-primary">{data.title}</h1>
            <p className="text-text-secondary text-sm mt-1">
              Week {data.current_week} of {data.total_weeks} · {overallPct}% complete
            </p>
          </div>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn-ghost text-xs flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>

        {/* Overall progress card */}
        <div className="card mt-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Overall Progress</p>
              <p className="text-xs text-text-muted">
                {data.phases?.filter(p => p.items_completed === p.items_total && p.items_total > 0).length || 0} of {data.phases?.length || 0} phases complete
              </p>
            </div>
            <span className="text-3xl font-black gradient-text">{overallPct}%</span>
          </div>
          <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-1000"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          {data.adaptations?.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-200">
              <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-600 font-medium">
                Path adapted {data.adaptations.length} time(s) by AI based on your progress
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent adaptations ────────────────────── */}
      {data.adaptations?.length > 0 && (
        <div className="mb-6 space-y-2 animate-fade-in">
          {data.adaptations.slice(-2).map(a => (
            <div key={a.id} className="card border-amber-200 bg-amber-50 flex items-start gap-3 !p-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700 mb-0.5">🔄 Path Adaptation</p>
                <p className="text-sm text-text-secondary">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Timeline phases ───────────────────────── */}
      <div className="animate-slide-up">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-brand-600 inline-block" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-surface-300 inline-block" /> Locked
          </span>
        </div>

        {data.phases.map((phase, i) => (
          <PhaseAccordion
            key={phase.id}
            phase={phase}
            defaultOpen={i === 0}
            isLast={i === data.phases.length - 1}
            onStatusChange={(itemId, status) => statusMutation.mutate({ itemId, status })}
            onOpen={item => navigate(`/resource/${item.resource_id}`, { state: { item, pathItemId: item.id } })}
          />
        ))}

        {/* Finish milestone */}
        <div className="flex gap-4 items-center pl-0">
          <div className="w-10 flex justify-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${overallPct === 100 ? 'bg-emerald-500' : 'bg-surface-200'}`}>
              <Flag className={`w-4 h-4 ${overallPct === 100 ? 'text-white' : 'text-text-muted'}`} />
            </div>
          </div>
          <div className="card flex-1 border-dashed border-surface-300 bg-surface-50 !py-3 !px-4">
            <p className="text-sm font-bold text-text-primary">
              {overallPct === 100 ? '🎉 Goal achieved!' : 'Goal: ' + data.title}
            </p>
            <p className="text-xs text-text-muted">
              {overallPct === 100
                ? 'Congratulations! You\'ve completed your entire learning roadmap.'
                : `${100 - overallPct}% remaining — keep going!`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
