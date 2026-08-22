import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import {
  CheckCircle, ArrowRight, Target, Brain,
  ShieldCheck, GitBranch, Clock, AlertCircle
} from 'lucide-react'
import useThemeStore from '../store/themeStore'

function SkillGapSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-4">
      <div className="h-10 w-48 bg-slate-200 dark:bg-darkBg-cardSub rounded-2xl" />
      <div className="card h-40 bg-white dark:bg-darkBg-card rounded-3xl" />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card h-32 bg-white dark:bg-darkBg-card rounded-2xl" />
        <div className="card h-32 bg-white dark:bg-darkBg-card rounded-2xl" />
      </div>
    </div>
  )
}

export default function SkillGap() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const { theme } = useThemeStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['skillGap'],
    queryFn: () => pathApi.getSkillGap().then(r => r.data),
  })

  if (isLoading) return <SkillGapSkeleton />

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Skill Profile Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Complete an onboarding session first to map your competencies.</p>
        <button onClick={() => navigate('/onboarding')} className="btn-primary">
          Start Onboarding <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const { goal_title, skills_already_met = [], skills_to_learn = [], estimated_weeks, readiness_score } = data
  const readinessPct = Math.round((readiness_score || 0) * 100)

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
    <div className="max-w-4xl mx-auto py-2 sm:py-6 space-y-6">

      {/* ── Header ───────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Skill Gap Analysis
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Competency evaluation for <span className="text-brand-600 dark:text-brand-400 font-semibold">{goal_title}</span>
        </p>
      </div>

      {/* ── Clean Summary Cards (Pastel Tints) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Verified Base */}
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Skills</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">{skills_already_met.length}</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Competencies ready</p>
        </div>

        {/* Missing Gaps */}
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
            <span className="text-xs font-bold uppercase tracking-wider">Skills to Learn</span>
            <GitBranch className="w-4 h-4" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">{skills_to_learn.length}</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-300">Target curriculum units</p>
        </div>

        {/* Timeline */}
        <div className="p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/50 space-y-1">
          <div className="flex items-center justify-between text-sky-700 dark:text-sky-300">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Time</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">{estimated_weeks} Weeks</p>
          <p className="text-[11px] text-sky-700 dark:text-sky-300">Calibrated study pace</p>
        </div>

      </div>

      {/* ── Verified Skills Chip List ──────────────────── */}
      {skills_already_met.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Verified Competencies</h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {skills_already_met.map(sid => (
              <span key={sid} className="chip-green rounded-xl py-1 px-3">
                {sid.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills Queue ─────────────────────────────── */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Prioritized Skill Queue</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sequenced in prerequisite order</p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-white dark:bg-darkBg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-darkBg-border hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clean cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredGaps.map(sg => {
            const currentPct = Math.round(sg.current_level * 100)
            const requiredPct = Math.round(sg.required_level * 100)

            return (
              <div key={sg.skill_id} className="p-4 rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-subtle flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 uppercase">{sg.category}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{sg.skill_name}</h3>
                  </div>
                  {sg.is_prerequisite && (
                    <span className="badge badge-indigo text-[10px]">Prereq</span>
                  )}
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Level: {currentPct}%</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Target: {requiredPct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-darkBg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 dark:bg-brand-500 rounded-full"
                      style={{ width: `${requiredPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* ── Bottom Link ─────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Ready to tackle these skills?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Open your personalized weekly study schedule.</p>
        </div>
        <button onClick={() => navigate('/roadmap')} className="btn-primary rounded-2xl text-xs px-5 py-2.5">
          Open Roadmap <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  )
}
