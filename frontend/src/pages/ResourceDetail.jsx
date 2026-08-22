import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi, assessmentApi, pathApi } from '../services/api'
import {
  ArrowLeft, Clock, Star, BookOpen, Wrench, ClipboardList,
  CheckCircle, Loader2, AlertCircle, ExternalLink, Brain,
  Trophy, RotateCcw, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

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
    onError: () => toast.error('Failed to submit assessment evaluation'),
  })

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
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
        {/* Score Card */}
        <div className={`card text-center p-6 border ${passed ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
          <div className={`text-5xl font-bold font-mono tracking-tight mb-2 ${pct >= 85 ? 'score-high' : pct >= 50 ? 'score-mid' : 'score-low'}`}>
            {pct}%
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider mb-2 ${
            passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {passed ? <><Trophy className="w-3.5 h-3.5" /> Assessment Passed</> : <><RotateCcw className="w-3.5 h-3.5" /> Needs Practice</>}
          </div>
          <p className="text-text-secondary text-xs">
            {result.correct} of {result.total} questions correct · Passing threshold: {Math.round(result.passing_score * 100)}%
          </p>
        </div>

        {/* Adaptation Feedback */}
        {result.adaptation?.message && (
          <div className={`card p-4 border ${result.adaptation.action === 'revision_added' ? 'border-amber-200 bg-amber-50/50' : 'border-emerald-200 bg-emerald-50/50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                result.adaptation.action === 'revision_added' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Brain className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900">Curriculum Adjusted</p>
                <p className="text-text-secondary leading-relaxed">{result.adaptation.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question Breakdown */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Question Evaluation</h3>
          {result.feedback.map((f, i) => (
            <div key={i} className={`p-3.5 rounded-lg border text-xs ${f.is_correct ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'}`}>
              <div className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  f.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {f.is_correct
                    ? <CheckCircle className="w-3.5 h-3.5" />
                    : <AlertCircle className="w-3.5 h-3.5" />
                  }
                </div>
                <div className="flex-1 space-y-1.5">
                  <p className="font-medium text-slate-900">{asmt.questions[i]?.question}</p>
                  {!f.is_correct && (
                    <p className="text-emerald-800 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded inline-block">
                      Correct: {asmt.questions[i]?.options[f.correct_index]}
                    </p>
                  )}
                  {f.explanation && (
                    <p className="text-text-secondary leading-relaxed pt-0.5">{f.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── Questions Screen ── */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-200 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{asmt.title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {asmt.questions.length} questions · {asmt.time_limit_minutes} min limit · Pass: {Math.round(asmt.passing_score * 100)}%
          </p>
        </div>
        <span className="badge badge-indigo">{asmt.skill?.replace(/-/g, ' ')}</span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 progress-bar h-1.5">
          <div
            className="progress-fill"
            style={{ width: `${(Object.keys(answers).length / asmt.questions.length) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-mono text-text-secondary font-medium">
          {Object.keys(answers).length}/{asmt.questions.length}
        </span>
      </div>

      {asmt.questions.map((q, qi) => (
        <div key={q.id} className="card p-4 space-y-3 border border-surface-200">
          {q.scenario && (
            <div className="p-2.5 rounded bg-surface-100 border border-surface-200 text-xs text-text-secondary leading-relaxed">
              <span className="font-semibold text-slate-900 block mb-0.5">Scenario:</span>
              {q.scenario}
            </div>
          )}
          <p className="text-sm font-semibold text-slate-900">
            <span className="text-brand-700 mr-1.5 font-mono">Q{qi + 1}.</span>{q.question}
          </p>
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs border transition-colors ${
                  answers[q.id] === oi
                    ? 'bg-brand-50 border-brand-500 text-brand-900 font-medium'
                    : 'bg-white border-surface-200 text-text-secondary hover:border-slate-300 hover:bg-surface-50'
                }`}
              >
                <span className="font-bold text-brand-700 mr-2 font-mono">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => submitMutation.mutate()}
        disabled={!allAnswered || submitMutation.isPending}
        className="btn-primary w-full justify-center py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitMutation.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Evaluation…</>
          : `Submit Knowledge Check (${Object.keys(answers).length}/${asmt.questions.length} Answered)`
        }
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────── */
/* Main ResourceDetail Page                        */
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
      if (status === 'completed') toast.success('Module marked as completed')
      else toast.success('Status updated to in progress')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const loadExplanation = async () => {
    setLoadingExplanation(true)
    try {
      const { data } = await resourcesApi.explain(id)
      setAiExplanation(data.explanation)
    } catch {
      toast.error('Could not load AI explanation')
    } finally {
      setLoadingExplanation(false)
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="text-center space-y-2">
        <Loader2 className="w-7 h-7 animate-spin text-brand-600 mx-auto" />
        <p className="text-text-secondary text-xs">Loading module details…</p>
      </div>
    </div>
  )
  if (!resource) return null

  const Icon    = TYPE_ICON[resource.type] || BookOpen
  const diffCfg = DIFF_CONFIG[resource.difficulty] || DIFF_CONFIG.beginner

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

      {/* ── Back Navigation ───────────────────────── */}
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-2 text-xs">
        <ArrowLeft className="w-4 h-4" /> Back to Schedule
      </button>

      {/* ── Header Card ───────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center text-slate-800 flex-shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">{resource.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`badge ${resource.type === 'project' ? 'badge-purple' : resource.type === 'assessment' ? 'badge-yellow' : 'badge-blue'} uppercase text-[10px]`}>
                {resource.type}
              </span>
              <span className={`badge ${diffCfg.cls} text-[10px]`}>{diffCfg.label}</span>
              <span className="flex items-center gap-1 text-text-secondary">
                <Clock className="w-3.5 h-3.5" /> {resource.duration_hours}h estimated
              </span>
              {resource.rating && (
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {resource.rating}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{resource.description}</p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="pt-4 border-t border-surface-200 grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="input-label mb-1">Content Provider</span>
            <p className="font-semibold text-slate-900">{resource.provider}</p>
          </div>
          <div>
            <span className="input-label mb-1">Target Skills Taught</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {resource.skills_taught?.map(s => (
                <span key={s} className="badge badge-indigo text-[10px]">
                  {s.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
          {resource.prerequisite_skills?.length > 0 && (
            <div className="sm:col-span-2">
              <span className="input-label mb-1">Prerequisite Dependencies</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {resource.prerequisite_skills.map(s => (
                  <span key={s} className="badge badge-gray text-[10px]">
                    {s.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Actions ────────────────────────── */}
      {pathItemId && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => statusMutation.mutate('in_progress')}
            disabled={statusMutation.isPending}
            className="btn-secondary justify-center text-xs py-2"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Mark In Progress
          </button>
          <button
            onClick={() => statusMutation.mutate('completed')}
            disabled={statusMutation.isPending}
            className="btn-primary justify-center text-xs py-2"
          >
            {statusMutation.isPending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <CheckCircle className="w-3.5 h-3.5" />
            }
            Mark as Completed
          </button>
        </div>
      )}

      {/* ── Recommendation Rationale ──────────────── */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-50 flex items-center justify-center text-brand-700">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recommendation Rationale</h2>
              <p className="text-[11px] text-text-muted">Why our algorithm sequenced this resource</p>
            </div>
          </div>
          {!aiExplanation && (
            <button
              onClick={loadExplanation}
              disabled={loadingExplanation}
              className="btn-secondary text-xs py-1 px-2.5"
            >
              {loadingExplanation
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing…</>
                : <>Explain Choice</>
              }
            </button>
          )}
        </div>

        {aiExplanation ? (
          <p className="text-xs text-text-secondary leading-relaxed bg-surface-50 p-3 rounded-lg border border-surface-200">{aiExplanation}</p>
        ) : (
          <p className="text-xs text-text-muted">
            Click "Explain Choice" to see how TF-IDF vector matching and prerequisite scoring selected this unit for your specific gaps.
          </p>
        )}
      </div>

      {/* ── Knowledge Check Section ───────────────── */}
      {resource.has_assessment && (
        <div>
          {!showAssessment ? (
            <div className="card p-6 border border-surface-200 text-center space-y-3 bg-surface-50">
              <div className="w-10 h-10 rounded-lg bg-white border border-surface-200 flex items-center justify-center mx-auto text-slate-800 shadow-subtle">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Interactive Knowledge Check</h2>
                <p className="text-text-secondary text-xs max-w-sm mx-auto mt-1">
                  Validate your understanding of this module. Your score will update the Bayesian skill model and adapt subsequent phases.
                </p>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => setShowAssessment(true)}
                  className="btn-primary text-xs mx-auto"
                >
                  Start Knowledge Check <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6 space-y-4">
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
