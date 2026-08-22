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

/* ── Constants ────────────────────────────────────────── */
const TYPE_ICON   = { course: BookOpen, project: Wrench, assessment: ClipboardList }
const TYPE_CLASS  = { course: 'badge-blue', project: 'badge-purple', assessment: 'badge-yellow' }
const DIFF_CLASS  = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' }

const STATUS_CONFIG = {
  pending:     { label: 'Not started', dot: 'bg-slate-300',   text: 'text-text-muted' },
  in_progress: { label: 'In progress', dot: 'bg-amber-500',   text: 'text-amber-700' },
  completed:   { label: 'Completed',   dot: 'bg-emerald-600', text: 'text-emerald-700' },
  skipped:     { label: 'Skipped',     dot: 'bg-slate-300',   text: 'text-text-muted' },
}

/* ── Skeleton Loading State ───────────────────────────── */
function RoadmapSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-slate-200 rounded" />
        <div className="h-7 w-72 bg-slate-200 rounded" />
      </div>
      <div className="card h-32 bg-white" />
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-9 h-9 rounded-lg bg-slate-200 flex-shrink-0" />
            <div className="flex-1 card h-32 bg-white" />
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
        group relative bg-white border rounded-lg p-3.5 cursor-pointer
        transition-colors duration-150 hover:border-slate-300
        ${isCompleted  ? 'border-emerald-200 bg-emerald-50/20' : ''}
        ${isInProgress ? 'border-amber-200 bg-amber-50/20' : ''}
        ${!isCompleted && !isInProgress ? 'border-surface-200' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
          ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isInProgress ? 'bg-amber-100 text-amber-700' : 'bg-surface-100 text-slate-700'}
        `}>
          {isCompleted
            ? <CheckCircle className="w-4 h-4" />
            : <Icon className="w-4 h-4" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm font-semibold leading-snug ${isCompleted ? 'text-text-muted line-through' : 'text-slate-900'}`}>
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
            <span className="flex items-center gap-1 text-text-secondary">
              <Clock className="w-3 h-3" /> {item.duration_hours}h
            </span>
            {item.rating && (
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Row */}
      {!isCompleted && (
        <div className="flex gap-2 mt-3 pl-11" onClick={e => e.stopPropagation()}>
          {item.status === 'pending' && (
            <button
              onClick={() => onStatusChange(item.id, 'in_progress')}
              className="btn-secondary text-xs py-1 px-2.5"
            >
              <PlayCircle className="w-3 h-3" /> Start Unit
            </button>
          )}
          {item.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(item.id, 'completed')}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle className="w-3 h-3" /> Mark as Completed
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
          w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold z-10
          ${isLocked ? 'bg-surface-200 text-text-muted border border-surface-300' : isDone ? 'bg-emerald-600 text-white' : 'bg-brand-600 text-white shadow-subtle'}
        `}>
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : isDone ? <CheckCircle className="w-3.5 h-3.5" /> : phase.phase_number}
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 bg-surface-200 mt-2 mb-0 min-h-[20px]" />
        )}
      </div>

      {/* Card Body */}
      <div className={`flex-1 mb-5 ${isLocked ? 'opacity-60' : ''}`}>
        <div className="card p-4 sm:p-5">
          <button
            className="w-full flex items-start gap-3 text-left"
            onClick={() => !isLocked && setOpen(!open)}
            disabled={isLocked}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-sm">{phase.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-text-secondary font-mono">
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
                      className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-600' : 'bg-brand-600'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-text-secondary flex-shrink-0 font-medium">
                    {phase.items_completed}/{phase.items_total} Done
                  </span>
                </div>
              )}
            </div>
          </button>

          {open && !isLocked && (
            <div className="mt-4 pt-3.5 border-t border-surface-200 space-y-2.5">
              {phase.description && (
                <p className="text-xs text-text-secondary pb-1">{phase.description}</p>
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
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] px-4">
        <div className="card text-center max-w-sm w-full p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mx-auto text-slate-700">
            <Map className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 text-base">No Active Roadmap Found</h2>
          <p className="text-text-secondary text-xs leading-relaxed">
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page Header ───────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">
            <Map className="w-3.5 h-3.5" /> Phased Milestone Schedule
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.title}</h1>
          <p className="text-text-secondary text-xs mt-1 font-mono">
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
      <div className="card p-6 bg-white border border-surface-200 shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Curriculum Milestone Pipeline</h2>
          </div>
          <span className="text-xs font-mono text-brand-700 font-semibold">{overallPct}% Total Completion</span>
        </div>

        {/* Visual Subway Nodes */}
        <div className="relative">
          {/* Connecting Track Line */}
          <div className="hidden md:block absolute top-6 left-6 right-6 h-1 bg-surface-200 rounded z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            {data.phases.map((phase) => {
              const isDone = phase.items_completed === phase.items_total && phase.items_total > 0
              const isCurrent = phase.week_start <= data.current_week && data.current_week <= phase.week_end

              return (
                <div
                  key={phase.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition-colors ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isCurrent
                      ? 'bg-brand-50/60 border-brand-300 shadow-subtle'
                      : 'bg-surface-50 border-surface-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-200 text-slate-700'
                    }`}>
                      {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : `0${phase.phase_number}`}
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">
                      W{phase.week_start}–W{phase.week_end}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 truncate">{phase.title}</h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {phase.items_completed} / {phase.items_total} Units Completed
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="progress-bar h-2">
          <div
            className="progress-fill"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* ── Adaptations Callout ────────────────────── */}
      {data.adaptations?.length > 0 && (
        <div className="space-y-2">
          {data.adaptations.slice(-2).map(a => (
            <div key={a.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/80 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">Adaptive Event:</span>
                <p className="mt-0.5 leading-relaxed">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Timeline Phases ───────────────────────── */}
      <div className="pt-2">
        {/* Status Legend */}
        <div className="flex items-center gap-4 mb-5 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-600" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-surface-300" /> Locked
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

        {/* Milestone Endpoint */}
        <div className="flex gap-4 items-center">
          <div className="w-9 flex justify-center flex-shrink-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${overallPct === 100 ? 'bg-emerald-600 text-white' : 'bg-surface-200 text-text-muted border border-surface-300'}`}>
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="card flex-1 p-3.5 bg-surface-50 border-surface-200">
            <p className="text-xs font-bold text-slate-900">
              {overallPct === 100 ? 'Goal Milestones Achieved' : 'Goal Completion Objective'}
            </p>
            <p className="text-[11px] text-text-secondary mt-0.5">
              {overallPct === 100
                ? 'All foundational and advanced modules in this roadmap have been completed.'
                : `${100 - overallPct}% remaining across remaining units.`}
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
