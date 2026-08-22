import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  CheckCircle, ArrowRight, Target, Brain,
  Sparkles, Layers, ShieldCheck, GitBranch, Clock, AlertCircle
} from 'lucide-react'
import useThemeStore from '../store/themeStore'

function SkillGapSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 dark:bg-darkBg-cardSub rounded-xl" />
      <div className="card h-48 bg-white dark:bg-darkBg-card" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card h-64 bg-white dark:bg-darkBg-card" />
        <div className="card h-64 bg-white dark:bg-darkBg-card" />
      </div>
    </div>
  )
}

export default function SkillGap() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const { data, isLoading, error } = useQuery({
    queryKey: ['skillGap'],
    queryFn: () => pathApi.getSkillGap().then(r => r.data),
  })

  if (isLoading) return <SkillGapSkeleton />

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center card p-8 space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Skill Gap Profile Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Complete an onboarding session first to generate your competency graph.</p>
        <button onClick={() => navigate('/onboarding')} className="btn-primary">
          Start Onboarding <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const { goal_title, skills_already_met = [], skills_to_learn = [], estimated_weeks, readiness_score } = data
  const readinessPct = Math.round((readiness_score || 0) * 100)

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
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page Header ──────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <Target className="w-3.5 h-3.5" /> Competency Gap Assessment
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{goal_title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Target requirements sequenced by Kahn's topological prerequisite sort.
        </p>
      </div>

      {/* ── Visual Competency Bridge Infographic ─────── */}
      <div className="card p-6 sm:p-7 bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-darkBg-border pb-4">
          <div>
            <span className="text-[10px] font-mono font-semibold text-brand-600 dark:text-brand-400 uppercase">Architecture Pipeline</span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">The Competency Bridge</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Goal Readiness:</span>
            <span className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400">{readinessPct}%</span>
          </div>
        </div>

        {/* 3-Stage Visual Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
          
          {/* Stage 1: Verified Base */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider text-[10px]">1. Verified Baseline</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{skills_already_met.length}</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Competencies already verified above target threshold (≥70%).</p>
          </div>

          {/* Stage 2: Active Gaps */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[10px]">2. Prerequisite Gaps</span>
              <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{skills_to_learn.length}</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Missing modules prioritized via topological graph sort.</p>
          </div>

          {/* Stage 3: Projected Horizon */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider text-[10px]">3. Target Timeline</span>
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{estimated_weeks} Weeks</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Calibrated pacing to achieve verified mastery milestone.</p>
          </div>

        </div>

        {/* Global Progress Line */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Foundational Baseline</span>
            <span>Target Horizon (100%)</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-darkBg-cardSub rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${readinessPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Radar Chart */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="section-title text-base">Competency Radar</h2>
            <p className="section-sub text-xs">Current level vs required proficiency across top gaps</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={isDark ? '#1f293d' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 10 }} />
                <Radar name="Current Level" dataKey="Current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={1.5} />
                <Radar name="Target Required" dataKey="Required" stroke="#059669" fill="#059669" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#1f293d' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a',
                    borderRadius: '12px'
                  }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 justify-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-darkBg-border">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-600 dark:bg-brand-400 rounded-sm" /> Current Level
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-600 dark:bg-emerald-400 rounded-sm" /> Target Required
            </span>
          </div>
        </div>

        {/* Existing Verified Skills */}
        <div className="card p-5 space-y-3">
          <div>
            <h2 className="section-title text-base">Verified Competencies</h2>
            <p className="section-sub text-xs">{skills_already_met.length} skills meeting proficiency benchmark</p>
          </div>
          {skills_already_met.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-10 text-center text-xs text-slate-400">
              No prior competencies identified during onboarding.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {skills_already_met.map(sid => (
                <span key={sid} className="chip-green">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {sid.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Interactive Skills to Master Queue ── */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="section-title text-base">Prioritized Skill Gap Queue</h2>
            <p className="section-sub text-xs">Sequenced according to prerequisite dependency depth</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-white dark:bg-darkBg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-darkBg-border hover:bg-slate-50 dark:hover:bg-darkBg-cardSub'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredGaps.map(sg => {
            const currentPct = Math.round(sg.current_level * 100)
            const requiredPct = Math.round(sg.required_level * 100)
            const gapPct = requiredPct - currentPct

            return (
              <div key={sg.skill_id} className="card p-4 space-y-3">
                
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-brand-600 dark:text-brand-400 uppercase">{sg.category}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{sg.skill_name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {sg.is_prerequisite && (
                      <span className="badge badge-indigo text-[10px]">Prereq Root</span>
                    )}
                    <span className="badge badge-gray text-[10px] font-mono">#{sg.priority}</span>
                  </div>
                </div>

                {/* Delta Visual Gauge */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-darkBg-cardSub/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-darkBg-border">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Current: <strong className="text-slate-900 dark:text-white">{currentPct}%</strong></span>
                    <span className="text-brand-600 dark:text-brand-400 font-semibold">Gap: +{gapPct}%</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Target: {requiredPct}%</span>
                  </div>
                  
                  <div className="relative h-2 bg-slate-200 dark:bg-darkBg-border rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${currentPct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 w-1 bg-emerald-600 dark:bg-emerald-400 rounded"
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
      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Interactive Roadmap Generated</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
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
