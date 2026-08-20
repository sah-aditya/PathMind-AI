import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi, assessmentApi, pathApi } from '../services/api'
import {
  ArrowLeft, Clock, Star, BookOpen, Wrench, ClipboardList,
  CheckCircle, Loader2, AlertCircle, ExternalLink, Brain
} from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_ICON = { course: BookOpen, project: Wrench, assessment: ClipboardList }
const DIFF_COLOR = { beginner: 'text-emerald-400', intermediate: 'text-amber-400', advanced: 'text-red-400' }

function AssessmentView({ assessmentId, pathItemId, onComplete }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
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

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
  if (!asmt) return null

  const allAnswered = asmt.questions.every(q => answers[q.id] !== undefined)

  if (submitted && result) {
    const pct = Math.round(result.score * 100)
    const passed = result.passed
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Score hero */}
        <div className={`card text-center border ${passed ? 'border-emerald-700/30' : 'border-red-700/30'}`}>
          <div className={`text-5xl font-black mb-2 ${pct >= 85 ? 'score-high' : pct >= 50 ? 'score-mid' : 'score-low'}`}>
            {pct}%
          </div>
          <p className="text-white font-semibold">{passed ? '🎉 Passed!' : '📚 Keep practicing'}</p>
          <p className="text-gray-400 text-sm mt-1">{result.correct}/{result.total} correct · Pass mark: {Math.round(result.passing_score * 100)}%</p>
        </div>

        {/* Adaptation message */}
        {result.adaptation?.message && (
          <div className={`card border ${result.adaptation.action === 'revision_added' ? 'border-amber-700/30 bg-amber-900/10' : 'border-emerald-700/30 bg-emerald-900/10'}`}>
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-brand-400 mb-1">PathMind AI Adapted Your Path</p>
                <p className="text-sm text-gray-300">{result.adaptation.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question breakdown */}
        <div className="space-y-3">
          <h3 className="font-medium text-white text-sm">Question Breakdown</h3>
          {result.feedback.map((f, i) => (
            <div key={i} className={`card-sm border ${f.is_correct ? 'border-emerald-700/20' : 'border-red-700/20'}`}>
              <div className="flex items-start gap-2">
                {f.is_correct
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                }
                <div>
                  <p className="text-xs text-gray-400 mb-1">{asmt.questions[i]?.question}</p>
                  {!f.is_correct && (
                    <p className="text-xs text-emerald-400">
                      ✓ Correct: {asmt.questions[i]?.options[f.correct_index]}
                    </p>
                  )}
                  {f.explanation && <p className="text-xs text-gray-500 mt-1">{f.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{asmt.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{asmt.questions.length} questions · {asmt.time_limit_minutes}min · Pass: {Math.round(asmt.passing_score * 100)}%</p>
        </div>
        <span className="badge badge-yellow">{asmt.skill?.replace(/-/g, ' ')}</span>
      </div>

      {asmt.questions.map((q, qi) => (
        <div key={q.id} className="card">
          {q.scenario && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mb-3 text-xs text-blue-200 leading-relaxed">
              📋 {q.scenario}
            </div>
          )}
          <p className="text-sm font-medium text-white mb-3">
            <span className="text-brand-400">Q{qi + 1}. </span>{q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all duration-150 ${
                  answers[q.id] === oi
                    ? 'bg-brand-600/20 border-brand-500 text-brand-200'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="font-medium text-brand-400 mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => submitMutation.mutate()}
        disabled={!allAnswered || submitMutation.isPending}
        className="btn-primary w-full justify-center disabled:opacity-40"
      >
        {submitMutation.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          : `Submit Assessment (${Object.keys(answers).length}/${asmt.questions.length} answered)`
        }
      </button>
    </div>
  )
}

export default function ResourceDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const pathItemId = location.state?.pathItemId

  const [showAssessment, setShowAssessment] = useState(false)
  const [aiExplanation, setAiExplanation] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const qc = useQueryClient()

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesApi.get(id).then(r => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => pathApi.updateItemStatus(pathItemId, status),
    onSuccess: () => { qc.invalidateQueries(['active-path']); qc.invalidateQueries(['dashboard']) },
    onError: () => toast.error('Failed to update status'),
  })

  const loadExplanation = async () => {
    setLoadingExplanation(true)
    try {
      const { data } = await resourcesApi.explain(id)
      setAiExplanation(data.explanation)
    } catch { toast.error('Could not load explanation') }
    finally { setLoadingExplanation(false) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
    </div>
  )
  if (!resource) return null

  const Icon = TYPE_ICON[resource.type] || BookOpen

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Resource header */}
      <div className="card mb-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/30 to-purple-600/30 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white mb-1">{resource.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${resource.type === 'project' ? 'badge-purple' : 'badge-blue'}`}>{resource.type}</span>
              <span className={`text-sm font-medium ${DIFF_COLOR[resource.difficulty]}`}>{resource.difficulty}</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> {resource.duration_hours}h</span>
              {resource.rating && <span className="flex items-center gap-1 text-xs text-amber-400"><Star className="w-3 h-3 fill-amber-400" /> {resource.rating}</span>}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{resource.description}</p>
          </div>
        </div>

        {/* Provider + skills */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Provider</p>
            <p className="text-sm text-white font-medium">{resource.provider}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Skills you'll learn</p>
            <div className="flex flex-wrap gap-1.5">
              {resource.skills_taught?.map(s => (
                <span key={s} className="badge badge-blue">{s.replace(/-/g, ' ')}</span>
              ))}
            </div>
          </div>
          {resource.prerequisite_skills?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Prerequisites</p>
              <div className="flex flex-wrap gap-1.5">
                {resource.prerequisite_skills.map(s => (
                  <span key={s} className="badge badge-gray">{s.replace(/-/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Explanation */}
      <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Why this resource?</h2>
          </div>
          {!aiExplanation && (
            <button onClick={loadExplanation} disabled={loadingExplanation} className="btn-ghost text-xs text-brand-400">
              {loadingExplanation ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ask AI'}
            </button>
          )}
        </div>
        {aiExplanation
          ? <p className="text-sm text-gray-300 leading-relaxed">{aiExplanation}</p>
          : <p className="text-xs text-gray-500">Click "Ask AI" to get a personalized explanation for why this was recommended to you.</p>
        }
      </div>

      {/* Actions */}
      {pathItemId && (
        <div className="flex gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <button onClick={() => statusMutation.mutate('in_progress')} disabled={statusMutation.isPending}
            className="btn-secondary flex-1 justify-center text-sm">
            <ExternalLink className="w-4 h-4" /> Mark In Progress
          </button>
          <button onClick={() => statusMutation.mutate('completed')} disabled={statusMutation.isPending}
            className="btn-primary flex-1 justify-center text-sm">
            <CheckCircle className="w-4 h-4" /> Mark Complete
          </button>
        </div>
      )}

      {/* Assessment section */}
      {resource.has_assessment && (
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {!showAssessment ? (
            <div className="card border border-brand-600/20 text-center">
              <ClipboardList className="w-8 h-8 text-brand-400 mx-auto mb-3" />
              <h2 className="font-bold text-white mb-2">Knowledge Check</h2>
              <p className="text-gray-400 text-sm mb-4">
                Test your understanding and let PathMind AI adapt your path based on your performance.
              </p>
              <button onClick={() => setShowAssessment(true)} className="btn-primary mx-auto">
                Take Assessment
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h2 className="section-title mb-4">Assessment</h2>
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
