import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi, assessmentApi, pathApi } from '../services/api'
import {
  ArrowLeft, Clock, Star, BookOpen, Wrench, ClipboardList,
  CheckCircle, Loader2, AlertCircle, ExternalLink, Brain,
  Sparkles, Trophy, RotateCcw, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MarkdownMessage from '../components/MarkdownMessage'

const TYPE_ICON   = { course: BookOpen, project: Wrench, assessment: ClipboardList }
const DIFF_CONFIG = {
  beginner:     { label: 'Beginner',     cls: 'badge-green'  },
  intermediate: { label: 'Intermediate', cls: 'badge-yellow' },
  advanced:     { label: 'Advanced',     cls: 'badge-red'    },
}

/* ─────────────────────────────────────────────── */
/* Assessment component                            */
/* ─────────────────────────────────────────────── */
function AssessmentView({ assessmentId, pathItemId, onComplete }) {
  const [answers, setAnswers]     = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult]       = useState(null)
  const qc = useQueryClient()

  const { data: asmt, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => assessmentApi.get(assessmentId).then(r => r.data),
    enabled: !!assessmentId,
  })

  const submitMutation = useMutation({
    mutationFn: () => assessmentApi.submit({
      assessment_id: assessmentId,
      path_item_id: pathItemId,
      answers,
    }),
    onSuccess: ({ data }) => {
      setResult(data)
      setSubmitted(true)
      qc.invalidateQueries(['active-path'])
      qc.invalidateQueries(['dashboard'])
      onComplete?.(data)
    },
    onError: () => toast.error('Failed to submit assessment'),
  })

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
    </div>
  )
  if (!asmt) return null

  const allAnswered = asmt.questions.every(q => answers[q.id] !== undefined)

  /* ── Results screen ── */
  if (submitted && result) {
    const pct    = Math.round(result.score * 100)
    const passed = result.passed
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Score hero */}
        <div className={`card text-center border-2 ${passed ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
          <div className={`text-6xl font-black mb-2 ${pct >= 85 ? 'score-high' : pct >= 50 ? 'score-mid' : 'score-low'}`}>
            {pct}%
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-2 ${
            passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {passed ? <><Trophy className="w-4 h-4" /> Passed!</> : <><RotateCcw className="w-4 h-4" /> Keep practicing</>}
          </div>
          <p className="text-text-muted text-sm">
            {result.correct}/{result.total} correct · Pass mark: {Math.round(result.passing_score * 100)}%
          </p>
        </div>

        {/* Adaptation message */}
        {result.adaptation?.message && (
          <div className={`card border-2 ${result.adaptation.action === 'revision_added' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                result.adaptation.action === 'revision_added' ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                <Brain className={`w-4 h-4 ${result.adaptation.action === 'revision_added' ? 'text-amber-600' : 'text-emerald-600'}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-600 mb-1">PathMind AI Adapted Your Path</p>
                <p className="text-sm text-text-secondary">{result.adaptation.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question breakdown */}
        <div className="space-y-3">
          <h3 className="font-bold text-text-primary text-sm">Question Breakdown</h3>
          {result.feedback.map((f, i) => (
            <div key={i} className={`card-sm border ${f.is_correct ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  f.is_correct ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {f.is_correct
                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    : <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-secondary mb-1">{asmt.questions[i]?.question}</p>
                  {!f.is_correct && (
                    <p className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-lg inline-block">
                      ✓ {asmt.questions[i]?.options[f.correct_index]}
                    </p>
                  )}
                  {f.explanation && (
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{f.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── Questions screen ── */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-text-primary">{asmt.title}</h3>
          <p className="text-xs text-text-muted mt-0.5">
            {asmt.questions.length} questions · {asmt.time_limit_minutes} min · Pass: {Math.round(asmt.passing_score * 100)}%
          </p>
        </div>
        <span className="badge badge-indigo">{asmt.skill?.replace(/-/g, ' ')}</span>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${(Object.keys(answers).length / asmt.questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-text-muted font-medium">
          {Object.keys(answers).length}/{asmt.questions.length}
        </span>
      </div>

      {asmt.questions.map((q, qi) => (
        <div key={q.id} className="card border border-surface-200">
          {q.scenario && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-3 text-xs text-brand-700 leading-relaxed">
              📋 {q.scenario}
            </div>
          )}
          <p className="text-sm font-semibold text-text-primary mb-3">
            <span className="text-brand-600 mr-1.5">Q{qi + 1}.</span>{q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all duration-150 ${
                  answers[q.id] === oi
                    ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-brand-sm'
                    : 'bg-white border-surface-200 text-text-secondary hover:border-brand-200 hover:bg-brand-50/40'
                }`}
              >
                <span className="font-semibold text-brand-500 mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => submitMutation.mutate()}
        disabled={!allAnswered || submitMutation.isPending}
        className="btn-primary w-full justify-center py-3.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {submitMutation.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          : `Submit Assessment (${Object.keys(answers).length}/${asmt.questions.length} answered)`
        }
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/* Main ResourceDetail page                        */
/* ─────────────────────────────────────────────── */
export default function ResourceDetail() {
  const { id }      = useParams()
  const location    = useLocation()
  const navigate    = useNavigate()
  const pathItemId  = location.state?.pathItemId

  const [showAssessment, setShowAssessment]         = useState(false)
  const [aiExplanation, setAiExplanation]           = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const qc = useQueryClient()

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesApi.get(id).then(r => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => pathApi.updateItemStatus(pathItemId, status),
    onSuccess: (_, status) => {
      qc.invalidateQueries(['active-path'])
      qc.invalidateQueries(['dashboard'])
      if (status === 'completed') toast.success('Marked as complete! 🎉')
      else toast.success('Marked as in progress')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const loadExplanation = async () => {
    setLoadingExplanation(true)
    try {
      const { data } = await resourcesApi.explain(id)
      setAiExplanation(data.explanation)
    } catch {
      toast.error('Could not load explanation')
    } finally {
      setLoadingExplanation(false)
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
        <p className="text-text-secondary text-sm">Loading resource…</p>
      </div>
    </div>
  )
  if (!resource) return null

  const Icon    = TYPE_ICON[resource.type] || BookOpen
  const diffCfg = DIFF_CONFIG[resource.difficulty] || DIFF_CONFIG.beginner

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Back button ──────────────────────────── */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* ── Resource header card ─────────────────── */}
      <div className="card mb-5 animate-fade-in overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 -mx-6 -mt-6 mb-6 bg-gradient-to-r from-brand-500 to-violet-500" />

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text-primary mb-2 leading-tight">{resource.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${resource.type === 'project' ? 'badge-purple' : resource.type === 'assessment' ? 'badge-yellow' : 'badge-blue'}`}>
                {resource.type}
              </span>
              <span className={`badge ${diffCfg.cls}`}>{diffCfg.label}</span>
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock className="w-3.5 h-3.5" /> {resource.duration_hours}h
              </span>
              {resource.rating && (
                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {resource.rating}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{resource.description}</p>
          </div>
        </div>

        {/* Provider + skills */}
        <div className="mt-5 pt-5 border-t border-surface-200 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Provider</p>
            <p className="text-sm font-semibold text-text-primary">{resource.provider}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Skills you'll learn</p>
            <div className="flex flex-wrap gap-1.5">
              {resource.skills_taught?.map(s => (
                <span key={s} className="badge badge-indigo">
                  {s.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
          {resource.prerequisite_skills?.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Prerequisites</p>
              <div className="flex flex-wrap gap-1.5">
                {resource.prerequisite_skills.map(s => (
                  <span key={s} className="badge badge-gray">
                    {s.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Action buttons ───────────────────────── */}
      {pathItemId && (
        <div className="flex gap-3 mb-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <button
            onClick={() => statusMutation.mutate('in_progress')}
            disabled={statusMutation.isPending}
            className="btn-secondary flex-1 justify-center text-sm"
          >
            <ExternalLink className="w-4 h-4" /> Mark In Progress
          </button>
          <button
            onClick={() => statusMutation.mutate('completed')}
            disabled={statusMutation.isPending}
            className="btn-primary flex-1 justify-center text-sm"
          >
            {statusMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle className="w-4 h-4" />
            }
            Mark Complete
          </button>
        </div>
      )}

      {/* ── AI Explanation card ───────────────────── */}
      <div className="card mb-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <Brain className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Why this resource?</h2>
              <p className="text-xs text-text-muted">AI-personalized explanation</p>
            </div>
          </div>
          {!aiExplanation && (
            <button
              onClick={loadExplanation}
              disabled={loadingExplanation}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                         bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100 transition-colors"
            >
              {loadingExplanation
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Loading…</>
                : <><Sparkles className="w-3 h-3" /> Ask AI</>
              }
            </button>
          )}
        </div>
        {aiExplanation
          ? <p className="text-sm text-text-secondary leading-relaxed">{aiExplanation}</p>
          : (
            <div className="border border-dashed border-brand-100 rounded-xl p-4 text-center">
              <Sparkles className="w-5 h-5 text-brand-300 mx-auto mb-1.5" />
              <p className="text-xs text-text-muted leading-relaxed">
                Click "Ask AI" for a personalized explanation of why this was recommended to you.
              </p>
            </div>
          )
        }
      </div>

      {/* ── Assessment section ────────────────────── */}
      {resource.has_assessment && (
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {!showAssessment ? (
            <div className="card border-2 border-dashed border-brand-200 bg-gradient-to-br from-brand-50 to-violet-50 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-card flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-brand-600" />
              </div>
              <h2 className="font-bold text-text-primary text-lg mb-2">Knowledge Check</h2>
              <p className="text-text-secondary text-sm mb-5 max-w-sm mx-auto">
                Test your understanding. PathMind AI will adapt your learning path based on your results.
              </p>
              <button
                onClick={() => setShowAssessment(true)}
                className="btn-primary mx-auto"
              >
                Take Assessment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="card animate-fade-in">
              <h2 className="section-title mb-1">Knowledge Assessment</h2>
              <p className="section-sub text-xs mb-5">Answer all questions to submit</p>
              <AssessmentView
                assessmentId={resource.assessment_id || `asmt-${id}`}
                pathItemId={pathItemId}
                onComplete={(result) => {
                  if (result.passed && pathItemId) statusMutation.mutate('completed')
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
