import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  ArrowRight, Target, CheckCircle, AlertTriangle,
  TrendingUp, Clock, GitBranch, Layers, Sparkles, ShieldCheck
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
  const [selectedCategory, setSelectedCategory] = useState('ALL')

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

  /* Radar data: top 8 gaps */
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

  const categories = ['ALL', ...Object.keys(byCategory)]
  const filteredGaps = selectedCategory === 'ALL'
    ? skills_to_learn
    : (byCategory[selectedCategory] || [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page Header ──────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 uppercase tracking-wider">
          <Target className="w-3.5 h-3.5" /> Competency Gap Assessment
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{goal_title}</h1>
        <p className="text-sm text-text-secondary">
          Target requirements sequenced by Kahn's topological prerequisite sort.
        </p>
      </div>

      {/* ── Visual Competency Bridge Infographic ─────── */}
      <div className="card p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div>
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase">Architecture Visualization</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">The Competency Bridge</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-300">Goal Readiness:</span>
            <span className="text-2xl font-bold font-mono text-brand-400">{readinessPct}%</span>
          </div>
        </div>

        {/* 3-Stage Visual Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Stage 1: Verified Base */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">1. Verified Baseline</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">{skills_already_met.length}</p>
            <p className="text-slate-400 leading-relaxed">Competencies already verified above target threshold (≥70%).</p>
          </div>

          {/* Stage 2: Active Gaps */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">2. Prerequisite Gaps</span>
              <GitBranch className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">{skills_to_learn.length}</p>
            <p className="text-slate-400 leading-relaxed">Missing modules prioritized via topological graph sort.</p>
          </div>

          {/* Stage 3: Projected Horizon */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-400 uppercase tracking-wider text-[10px]">3. Target Timeline</span>
              <Clock className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-white">{estimated_weeks} Weeks</p>
            <p className="text-slate-400 leading-relaxed">Calibrated pacing to achieve verified mastery milestone.</p>
          </div>

        </div>

        {/* Global Progress Line */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Foundational Baseline</span>
            <span>Target Mastery (100%)</span>
          </div>
          <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${readinessPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="section-title">Competency Radar</h2>
            <p className="section-sub">Current level vs required proficiency across top gaps</p>
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
            <h2 className="section-title">Verified Competencies</h2>
            <p className="section-sub">{skills_already_met.length} skills meeting proficiency benchmark</p>
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

      {/* ── Interactive Skills to Master Table / Cards ── */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Prioritized Skill Gap Queue</h2>
            <p className="section-sub">Sequenced according to prerequisite dependency depth</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-surface-50 text-slate-700 border-surface-200 hover:bg-surface-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGaps.map(sg => {
            const currentPct = Math.round(sg.current_level * 100)
            const requiredPct = Math.round(sg.required_level * 100)
            const gapPct = requiredPct - currentPct

            return (
              <div key={sg.skill_id} className="card p-4 space-y-3 border border-surface-200 shadow-subtle hover:border-slate-300 transition-colors">
                
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-brand-700 uppercase">{sg.category}</span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{sg.skill_name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {sg.is_prerequisite && (
                      <span className="badge badge-indigo text-[10px]">Prereq Root</span>
                    )}
                    <span className="badge badge-gray text-[10px] font-mono">#{sg.priority}</span>
                  </div>
                </div>

                {/* Delta Visual Gauge */}
                <div className="space-y-1.5 bg-surface-50 p-2.5 rounded-lg border border-surface-200">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-secondary">Current: <strong className="text-slate-900">{currentPct}%</strong></span>
                    <span className="text-brand-700 font-semibold">Gap: +{gapPct}%</span>
                    <span className="text-emerald-700 font-bold">Target: {requiredPct}%</span>
                  </div>
                  
                  <div className="relative h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${currentPct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 w-1 bg-emerald-600 rounded"
                      style={{ left: `${requiredPct}%` }}
                    />
                  </div>
                </div>

              </div>
            )
          })}
        </div>

      </div>

      {/* ── Bottom Roadmap Banner ─────────────────────── */}
      <div className="card p-6 bg-white border border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card">
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
