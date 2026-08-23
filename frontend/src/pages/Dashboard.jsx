import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../services/api'
import {
  ArrowRight, PlayCircle, Target, CheckCircle,
  Brain, BookOpen, Clock, Calendar, MessageCircle,
  RefreshCcw, Sparkles, Map, ShieldCheck
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data),
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-6">
        <div className="h-12 w-64 bg-slate-200 dark:bg-darkBg-cardSub rounded-2xl" />
        <div className="card h-52 bg-white dark:bg-darkBg-card rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-white dark:bg-darkBg-card rounded-3xl border border-slate-200/80 dark:border-darkBg-border" />
          ))}
        </div>
      </div>
    )
  }

  const { active_path, next_action, skills_map } = data || {}
  const overallPct = Math.round((active_path?.overall_progress || 0) * 100)
  const firstName = user?.name?.split(' ')[0] || 'Learner'

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 space-y-8">

      {/* ── Friendly Clean Hero Greeting (Inspired by Reference Image 2) ── */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Hi {firstName},
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-medium">
          How can I help you learn today?
        </p>
      </div>

      {/* ── No Active Path State ─────────────────────────── */}
      {!active_path && (
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-subtle">
            <Brain className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Start Your Learning Journey</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tell PathMind AI your goal, and we will sequence a personalized week-by-week curriculum.
            </p>
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            className="btn-primary px-6 py-3 rounded-2xl text-sm font-semibold shadow-card"
          >
            Create My Learning Path <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Active Module Hero Card (Clean & Focused) ────── */}
      {active_path && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-darkBg-border pb-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Current Goal
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {active_path.goal_title}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 self-start sm:self-auto font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-darkBg-cardSub px-3.5 py-1.5 rounded-xl">
              <span>Week {active_path.current_week} of {active_path.total_weeks}</span>
              <span>•</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{overallPct}% Done</span>
            </div>
          </div>

          {/* Minimalist Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Overall Roadmap Progress</span>
              <span>{active_path.resources_completed} units completed</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-darkBg-border rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(overallPct, 4)}%` }}
              />
            </div>
          </div>

          {/* Up Next Unit */}
          {next_action ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-darkBg-cardSub/50 border border-slate-200/80 dark:border-darkBg-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Next Objective</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {next_action.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span><Clock className="w-3 h-3 inline mr-1" />{next_action.duration_hours}h estimated</span>
                  <span>•</span>
                  <span className="capitalize">{next_action.type}</span>
                </p>
              </div>

              <button
                onClick={() => navigate(`/resource/${next_action.resource_id}`, { state: { pathItemId: next_action.item_id } })}
                className="btn-primary w-full sm:w-auto px-5 py-3 rounded-2xl text-sm font-semibold flex-shrink-0"
              >
                <PlayCircle className="w-4 h-4" /> Continue Learning
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-center text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              You've completed all current milestones! Explore the roadmap for more.
            </div>
          )}

        </div>
      )}

      {/* ── 4 Big Pastel Touch Tiles (Inspired by Image 2: Scan / Edit / Convert / Ask AI) ── */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
          Quick Actions
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Tile 1: Roadmap */}
          <div
            onClick={() => navigate('/roadmap')}
            className="p-5 rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-card-md cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">My Roadmap</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Weekly stages</p>
            </div>
          </div>

          {/* Tile 2: Skill Gap */}
          <div
            onClick={() => navigate('/skill-gap')}
            className="p-5 rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-card-md cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">Skill Gap</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {Object.keys(skills_map || {}).length} skills tracked
              </p>
            </div>
          </div>

          {/* Tile 3: AI Advisor */}
          <div
            onClick={() => {
              const event = new CustomEvent('open-advisor-chat')
              window.dispatchEvent(event)
            }}
            className="p-5 rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-card-md cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">Ask AI</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Technical mentor</p>
            </div>
          </div>

          {/* Tile 4: Re-Onboard */}
          <div
            onClick={() => navigate('/onboarding')}
            className="p-5 rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-card-md cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">Change Goal</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Recalibrate path</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
