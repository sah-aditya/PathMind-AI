import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  ArrowRight, Target, CheckCircle, AlertTriangle,
  TrendingUp, Clock, Compass
} from 'lucide-react'

/* ── Skill Gap Skeleton Loading State ────────────────── */
function SkillGapSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3.5 w-28 bg-slate-200 rounded" />
        <div className="h-7 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-96 bg-slate-200 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="h-6 w-16 bg-slate-200 rounded" />
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card h-64 bg-white" />
        <div className="card h-64 bg-white" />
      </div>
    </div>
  )
}

export default function SkillGap() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['skill-gap'],
    queryFn: () => pathApi.getSkillGap().then(r => r.data),
  })

  if (isLoading) {
    return <SkillGapSkeleton />
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] px-4">
        <div className="card text-center max-w-sm p-6 space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">No Skill Gap Profile Available</h2>
          <p className="text-text-secondary text-xs leading-relaxed">Complete onboarding to configure your career goal and analyze required competencies.</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary w-full justify-center text-xs">
            Start Onboarding
          </button>
        </div>
      </div>
    )
  }

  const { goal_title, overall_readiness, estimated_weeks, skills_already_met, skills_to_learn } = data
  const readinessPct = Math.round(overall_readiness * 100)

  /* Radar: top 8 gaps */
  const topGaps = (skills_to_learn || []).slice(0, 8)
  const radarData = topGaps.map(sg => ({
    subject: sg.skill_name.length > 12 ? sg.skill_name.slice(0, 12) + '…' : sg.skill_name,
    Current: Math.round(sg.current_level * 100),
    Required: Math.round(sg.required_level * 100),
  }))

  /* Group by category */
  const byCategory = {}
  for (const sg of (skills_to_learn || [])) {
    if (!byCategory[sg.category]) byCategory[sg.category] = []
    byCategory[sg.category].push(sg)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page header ──────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 uppercase tracking-wider">
          <Target className="w-3.5 h-3.5" /> Competency Gap Assessment
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{goal_title}</h1>
        <p className="text-sm text-text-secondary">
          Target requirements sequenced by Kahn's topological prerequisite sort.
        </p>
      </div>

      {/* ── Metric Stat cards ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Goal Readiness',
            value: `${readinessPct}%`,
            sub: 'of curriculum baseline',
            accent: 'bg-emerald-50 text-emerald-700',
            icon: TrendingUp,
          },
          {
            label: 'Identified Gaps',
            value: skills_to_learn.length,
            sub: 'target competencies',
            accent: 'bg-amber-50 text-amber-700',
            icon: Target,
          },
          {
            label: 'Verified Skills',
            value: skills_already_met.length,
            sub: 'meeting proficiency (≥70%)',
            accent: 'bg-brand-50 text-brand-700',
            icon: CheckCircle,
          },
          {
            label: 'Target Timeline',
            value: `${estimated_weeks}w`,
            sub: 'at your planned hours/week',
            accent: 'bg-slate-100 text-slate-700',
            icon: Clock,
          },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.accent}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
            <p className="stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Readiness Progress Bar ───────────────────── */}
      <div className="card p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Curriculum Readiness Benchmark</h2>
            <p className="text-xs text-text-secondary">
              {skills_already_met.length} of {skills_already_met.length + skills_to_learn.length} prerequisite milestones met
            </p>
          </div>
          <span className="text-2xl font-bold font-mono text-brand-700">{readinessPct}%</span>
        </div>
        <div className="progress-bar h-2.5">
          <div
            className="progress-fill"
            style={{ width: `${readinessPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-text-muted">
          <span>Foundational Baseline</span>
          <span>Target Mastery</span>
        </div>
      </div>

      {/* ── Charts row ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="section-title">Competency Radar</h2>
            <p className="section-sub">Current level vs required proficiency</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                <Radar name="Current Level" dataKey="Current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.18} strokeWidth={1.5} />
                <Radar name="Target Required" dataKey="Required" stroke="#059669" fill="#059669" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="3 3" />
                <Tooltip formatter={(val, name) => [`${val}%`, name]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 justify-center text-xs text-text-secondary pt-2 border-t border-surface-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-600 rounded-sm" /> Current Level
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" /> Target Required
            </span>
          </div>
        </div>

        {/* Existing Verified Skills */}
        <div className="card p-5 space-y-3">
          <div>
            <h2 className="section-title">Existing Competencies</h2>
            <p className="section-sub">{skills_already_met.length} skills exceeding threshold (≥70%)</p>
          </div>
          {skills_already_met.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-10 text-center text-xs text-text-muted">
              No prior competencies identified during onboarding.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {skills_already_met.map(sid => (
                <span key={sid} className="chip-green">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  {sid.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Category Breakdown ───────────────────────── */}
      <div className="space-y-4">
        <div>
          <h2 className="section-title">Skills to Master</h2>
          <p className="section-sub">Organized by domain area and sequenced prerequisite priority</p>
        </div>

        <div className="space-y-4">
          {Object.entries(byCategory).map(([cat, gaps]) => (
            <div key={cat} className="card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600" />
                  <h3 className="font-bold text-slate-900 text-sm">{cat}</h3>
                </div>
                <span className="text-xs text-text-muted">{gaps.length} target skill{gaps.length > 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3 pt-1">
                {gaps.map(sg => {
                  const currentPct = Math.round(sg.current_level * 100)
                  const requiredPct = Math.round(sg.required_level * 100)
                  const gapPct = requiredPct - currentPct
                  return (
                    <div key={sg.skill_id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{sg.skill_name}</span>
                          {sg.is_prerequisite && (
                            <span className="badge badge-indigo text-[10px]">Prerequisite Root</span>
                          )}
                          <span className="badge badge-gray text-[10px] font-mono">Priority #{sg.priority}</span>
                        </div>
                        <div className="font-mono text-[11px] text-text-secondary">
                          <span>{currentPct}%</span>
                          <span className="mx-1 text-text-muted">→</span>
                          <span className="font-bold text-slate-900">{requiredPct}%</span>
                          <span className="text-amber-700 ml-1.5 font-sans font-medium">(+{gapPct}% gap)</span>
                        </div>
                      </div>

                      <div className="relative h-2 bg-surface-200 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-brand-600 rounded-full transition-all duration-500"
                          style={{ width: `${currentPct}%` }}
                        />
                        <div
                          className="absolute inset-y-0 w-0.5 bg-slate-600"
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

      {/* ── Bottom Roadmap Banner ─────────────────────── */}
      <div className="card p-6 bg-white border border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-base font-bold text-slate-900">Interactive Roadmap Generated</h2>
          <p className="text-xs text-text-secondary max-w-md">
            Review your {estimated_weeks}-week phased modules, interactive projects, and knowledge checks.
          </p>
        </div>
        <button onClick={() => navigate('/roadmap')} className="btn-primary flex-shrink-0">
          Open Roadmap <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}
