import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import {
  ChevronDown, ChevronRight, Clock, Star, CheckCircle, PlayCircle,
  BookOpen, Wrench, ClipboardList, Lock, Loader2, Map, AlertCircle, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_ICON = { course: BookOpen, project: Wrench, assessment: ClipboardList }
const TYPE_CLASS = { course: 'type-course', project: 'type-project', assessment: 'type-assessment' }
const DIFF_CLASS = { beginner: 'pill-beginner', intermediate: 'pill-intermediate', advanced: 'pill-advanced' }
const STATUS_CONFIG = {
  pending:     { label: 'Not started', color: 'text-gray-500',   bg: 'bg-gray-700/30' },
  in_progress: { label: 'In progress', color: 'text-amber-400',  bg: 'bg-amber-900/20' },
  completed:   { label: 'Completed',   color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
  skipped:     { label: 'Skipped',     color: 'text-gray-600',   bg: 'bg-gray-800/20' },
}

function ResourceCard({ item, onStatusChange, onOpen }) {
  const Icon = TYPE_ICON[item.type] || BookOpen
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
  const isCompleted = item.status === 'completed'
  const isRevision = item.is_revision

  return (
    <div
      className={`glass-hover rounded-xl p-4 cursor-pointer border transition-all duration-200 ${
        isCompleted ? 'border-emerald-700/30' : isRevision ? 'border-amber-700/30' : 'border-white/5'
      }`}
      onClick={() => onOpen(item)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isCompleted ? 'bg-emerald-900/40' : 'bg-brand-900/40'
        }`}>
          {isCompleted
            ? <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
            : <Icon className="w-4 h-4 text-brand-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium leading-tight ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
              {item.title}
            </p>
            {isRevision && <span className="badge badge-yellow flex-shrink-0">Revision</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`badge ${TYPE_CLASS[item.type] || 'badge-gray'}`}>{item.type}</span>
            <span className={`badge ${DIFF_CLASS[item.difficulty] || 'badge-gray'}`}>{item.difficulty}</span>
            {item.has_assessment && <span className="badge badge-purple">Assessment</span>}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" /> {item.duration_hours}h
            </span>
            {item.rating && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Quick action */}
      {!isCompleted && (
        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          {item.status === 'pending' && (
            <button
              onClick={() => onStatusChange(item.id, 'in_progress')}
              className="btn-ghost text-xs py-1 px-3 text-brand-400 hover:bg-brand-900/30"
            >
              <PlayCircle className="w-3 h-3" /> Start
            </button>
          )}
          {item.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(item.id, 'completed')}
              className="btn-ghost text-xs py-1 px-3 text-emerald-400 hover:bg-emerald-900/30"
            >
              <CheckCircle className="w-3 h-3" /> Mark complete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function PhaseAccordion({ phase, onStatusChange, onOpen, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const progress = phase.items_total > 0 ? (phase.items_completed / phase.items_total) * 100 : 0
  const isLocked = phase.status === 'locked'

  return (
    <div className={`card mb-4 ${isLocked ? 'opacity-60' : ''}`}>
      <button
        className="w-full flex items-center gap-4 text-left"
        onClick={() => !isLocked && setOpen(!open)}
      >
        {isLocked ? (
          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-gray-600" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600/30 to-purple-600/30 border border-brand-600/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-brand-300">
            {phase.phase_number}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">{phase.title}</h3>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500">Week {phase.week_start}–{phase.week_end}</span>
              {!isLocked && (open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />)}
            </div>
          </div>
          {!isLocked && (
            <div className="flex items-center gap-3 mt-1.5">
              <div className="progress-bar flex-1">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {phase.items_completed}/{phase.items_total}
              </span>
            </div>
          )}
        </div>
      </button>

      {open && !isLocked && (
        <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
          {phase.description && <p className="text-xs text-gray-500 mb-3">{phase.description}</p>}
          {phase.items.map((item) => (
            <ResourceCard key={item.id} item={item} onStatusChange={onStatusChange} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Roadmap() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['active-path'],
    queryFn: () => pathApi.getActive().then(r => r.data.path),
  })

  const statusMutation = useMutation({
    mutationFn: ({ itemId, status }) => pathApi.updateItemStatus(itemId, status),
    onSuccess: () => {
      qc.invalidateQueries(['active-path'])
      qc.invalidateQueries(['dashboard'])
    },
    onError: () => toast.error('Failed to update status'),
  })

  const generateMutation = useMutation({
    mutationFn: () => pathApi.generate(),
    onSuccess: () => {
      qc.invalidateQueries(['active-path'])
      toast.success('Learning path generated!')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to generate path'),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
    </div>
  )

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="card text-center max-w-sm">
        <Map className="w-10 h-10 text-brand-400 mx-auto mb-3" />
        <h2 className="font-bold text-white mb-2">No active path found</h2>
        <p className="text-gray-400 text-sm mb-4">Complete onboarding first, then generate your roadmap.</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate('/onboarding')} className="btn-primary justify-center">Start Onboarding</button>
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="btn-secondary justify-center">
            {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Generate Path
          </button>
        </div>
      </div>
    </div>
  )

  const overallPct = Math.round((data.overall_progress || 0) * 100)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-400 text-sm mb-1">
              <Map className="w-4 h-4" /> Learning Roadmap
            </div>
            <h1 className="text-2xl font-bold text-white">{data.title}</h1>
            <p className="text-gray-400 text-sm mt-1">Week {data.current_week} of {data.total_weeks}</p>
          </div>
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
            className="btn-ghost text-xs flex-shrink-0">
            <RefreshCw className={`w-3.5 h-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>

        {/* Overall progress */}
        <div className="card mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-2xl font-black gradient-text">{overallPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallPct}%` }} />
          </div>
          {data.adaptations?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                Path adapted {data.adaptations.length} time(s) based on your progress
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent adaptations */}
      {data.adaptations?.length > 0 && (
        <div className="mb-6 space-y-2">
          {data.adaptations.slice(-2).map((a) => (
            <div key={a.id} className="card border border-amber-700/30 bg-amber-900/10">
              <p className="text-xs text-amber-400 font-medium mb-1">🔄 Path Adaptation</p>
              <p className="text-sm text-gray-300">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Phases */}
      <div className="animate-slide-up">
        {data.phases.map((phase, i) => (
          <PhaseAccordion
            key={phase.id}
            phase={phase}
            defaultOpen={i === 0}
            onStatusChange={(itemId, status) => statusMutation.mutate({ itemId, status })}
            onOpen={(item) => navigate(`/resource/${item.resource_id}`, { state: { item, pathItemId: item.id } })}
          />
        ))}
      </div>
    </div>
  )
}
