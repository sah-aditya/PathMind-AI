import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  ArrowRight, Target, CheckCircle, AlertTriangle,
  Loader2, Map, TrendingUp, Clock,
} from 'lucide-react'

const CATEGORY_COLORS = {
  'Programming':     '#4f46e5', 'Mathematics':   '#7c3aed', 'Machine Learning': '#2563eb',
  'Deep Learning':   '#0891b2', 'Data Science':  '#059669', 'NLP':             '#d97706',
  'Generative AI':   '#db2777', 'Computer Vision': '#16a34a', 'MLOps':          '#dc2626',
  'Web Development': '#9333ea', 'Cloud':         '#0284c7', 'Cybersecurity':   '#ca8a04',
}

export default function SkillGap() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['skill-gap'],
    queryFn: () => pathApi.getSkillGap().then(r => r.data),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
        <p className="text-text-secondary text-sm">Analysing your skill gap…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="card text-center max-w-sm">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="font-bold text-text-primary mb-2">No skill gap data yet</p>
        <p className="text-text-secondary text-sm mb-4">Complete onboarding first to set your goal.</p>
        <button onClick={() => navigate('/onboarding')} className="btn-primary mx-auto">
          Start Onboarding
        </button>
      </div>
    </div>
  )

  const { goal_title, overall_readiness, estimated_weeks, skills_already_met, skills_to_learn } = data
  const readinessPct = Math.round(overall_readiness * 100)

  /* Radar: top 8 gaps */
  const topGaps = skills_to_learn.slice(0, 8)
  const radarData = topGaps.map(sg => ({
    subject: sg.skill_name.length > 12 ? sg.skill_name.slice(0, 12) + '…' : sg.skill_name,
    Current: Math.round(sg.current_level * 100),
    Required: Math.round(sg.required_level * 100),
  }))

  /* Group by category */
  const byCategory = {}
  for (const sg of skills_to_learn) {
    if (!byCategory[sg.category]) byCategory[sg.category] = []
    byCategory[sg.category].push(sg)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page header ──────────────────────────────── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 mb-2 uppercase tracking-wide">
          <Target className="w-3.5 h-3.5" /> Skill Gap Analysis
        </div>
        <h1 className="text-3xl font-black text-text-primary">{goal_title}</h1>
        <p className="text-text-secondary mt-1">
          Here's exactly what you need to learn — ordered by prerequisite priority.
        </p>
      </div>

      {/* ── Stat cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Goal Readiness',
            value: `${readinessPct}%`,
            sub: 'of required skills met',
            accent: 'bg-emerald-50 text-emerald-600',
            icon: TrendingUp,
          },
          {
            label: 'Skills to Learn',
            value: skills_to_learn.length,
            sub: 'identified gaps',
            accent: 'bg-amber-50 text-amber-600',
            icon: Target,
          },
          {
            label: 'Skills You Have',
            value: skills_already_met.length,
            sub: 'already mastered (≥70%)',
            accent: 'bg-brand-50 text-brand-600',
            icon: CheckCircle,
          },
          {
            label: 'Est. Duration',
            value: `${estimated_weeks}w`,
            sub: 'to goal completion',
            accent: 'bg-violet-50 text-violet-600',
            icon: Clock,
          },
        ].map((s, i) => (
          <div key={i} className="card animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.accent}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-3xl font-black text-text-primary">{s.value}</p>
            <p className="text-sm font-semibold text-text-primary mt-1">{s.label}</p>
            <p className="text-xs text-text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Readiness progress bar (prominent) ───────── */}
      <div className="card animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-text-primary">Overall Readiness</h2>
            <p className="text-sm text-text-secondary">
              {skills_already_met.length} of {skills_already_met.length + skills_to_learn.length} skills mastered
            </p>
          </div>
          <span className="text-3xl font-black gradient-text">{readinessPct}%</span>
        </div>
        <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-1000"
            style={{ width: `${readinessPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
          <span>Beginner</span>
          <span>Goal Ready</span>
        </div>
      </div>

      {/* ── Charts row ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="card animate-fade-in">
          <h2 className="section-title text-base mb-1">Skills Radar</h2>
          <p className="section-sub text-xs mb-4">Current vs required level for top gap skills</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e8edf5" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Current" dataKey="Current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Required" dataKey="Required" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.07} strokeWidth={1.5} strokeDasharray="4 4" />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: '12px', color: '#1e293b' }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 justify-center text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-brand-500 inline-block rounded" /> Current level
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-violet-500 inline-block rounded border-dashed" /> Required level
            </span>
          </div>
        </div>

        {/* Skills already have */}
        <div className="card animate-fade-in">
          <h2 className="section-title text-base mb-1">Skills You Already Have</h2>
          <p className="section-sub text-xs mb-4">{skills_already_met.length} skills ≥ 70% mastery</p>
          {skills_already_met.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="text-center">
                <Target className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm">Complete onboarding to add your skills</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills_already_met.map(sid => (
                <span key={sid} className="chip-green">
                  <CheckCircle className="w-3 h-3" />
                  {sid.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Skills to learn (by category) ───────────── */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Skills to Develop</h2>
            <p className="section-sub">Ordered by Kahn's topological sort — optimal prerequisite sequence</p>
          </div>
          <span className="badge badge-indigo">{skills_to_learn.length} gaps</span>
        </div>

        <div className="space-y-6">
          {Object.entries(byCategory).map(([cat, gaps]) => (
            <div key={cat} className="card">
              {/* Category header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[cat] || '#4f46e5' }}
                />
                <h3 className="font-bold text-text-primary text-sm">{cat}</h3>
                <span className="text-xs text-text-muted ml-1">({gaps.length} skill{gaps.length > 1 ? 's' : ''})</span>
              </div>

              {/* Gap rows */}
              <div className="space-y-4">
                {gaps.map(sg => {
                  const currentPct = Math.round(sg.current_level * 100)
                  const requiredPct = Math.round(sg.required_level * 100)
                  const gapPct = requiredPct - currentPct
                  return (
                    <div key={sg.skill_id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">{sg.skill_name}</span>
                          {sg.is_prerequisite && (
                            <span className="badge badge-indigo">Prerequisite</span>
                          )}
                          <span className="badge badge-gray text-xs">#{sg.priority}</span>
                        </div>
                        <span className="text-xs text-text-muted">
                          {currentPct}% <span className="text-text-muted mx-1">→</span>
                          <span className="text-brand-600 font-semibold">{requiredPct}%</span>
                          <span className="text-red-500 font-medium ml-1">(+{gapPct}%)</span>
                        </span>
                      </div>
                      {/* Layered progress: current fill + required marker */}
                      <div className="relative h-2 bg-surface-200 rounded-full overflow-hidden">
                        {/* Current level */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                          style={{
                            width: `${currentPct}%`,
                            background: CATEGORY_COLORS[cat] || '#4f46e5',
                            opacity: 0.7,
                          }}
                        />
                        {/* Required target marker */}
                        <div
                          className="absolute inset-y-0 w-0.5 bg-text-muted opacity-40"
                          style={{ left: `${requiredPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────── */}
      <div className="card bg-gradient-to-br from-brand-50 to-violet-50 border-brand-100 text-center animate-slide-up">
        <Map className="w-8 h-8 text-brand-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Your roadmap is ready</h2>
        <p className="text-text-secondary text-sm mb-5">
          We've generated a {estimated_weeks}-week ML-optimized path to close these gaps.
        </p>
        <button onClick={() => navigate('/roadmap')} className="btn-primary mx-auto">
          View My Roadmap <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
