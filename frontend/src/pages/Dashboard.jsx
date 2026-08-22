import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../services/api'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from 'recharts'
import {
  ArrowRight, PlayCircle, Zap, Target, CheckCircle,
  Brain, BookOpen, Clock, TrendingUp, Award, Calendar,
  ChevronRight, Sparkles, Layers
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

/* ── Stat Card Component ─────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, accent, trend }) {
  return (
    <div className="card flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend != null && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
            trend >= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-mono mt-3">{value}</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Circular Progress Ring ──────────────────────────── */
function ProgressRing({ pct, size = 96, stroke = 7, isDark }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={isDark ? '#1f293d' : '#e2e8f0'} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#4f46e5" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data),
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-32 bg-white dark:bg-darkBg-card" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card h-64 bg-white dark:bg-darkBg-card" />
          <div className="lg:col-span-2 card h-64 bg-white dark:bg-darkBg-card" />
        </div>
      </div>
    )
  }

  const { active_path, next_action, skill_categories, skills_map, recent_adaptations } = data || {}
  const overallPct = Math.round((active_path?.overall_progress || 0) * 100)

  /* Radar data */
  const radarData = (skill_categories || []).slice(0, 7).map(c => ({
    subject: c.category,
    Level: Math.round(c.average_level * 100),
    fullMark: 100,
  }))

  /* Top skills bar */
  const topSkills = Object.entries(skills_map || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([id, level]) => ({
      name: id.replace(/-/g, ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ').slice(0, 18),
      level: Math.round(level * 100),
    }))

  /* Weekly progress data */
  const weeklyData = [
    { week: 'W1', hours: 4 }, { week: 'W2', hours: 6 }, { week: 'W3', hours: 5 },
    { week: 'W4', hours: 8 }, { week: 'W5', hours: 7 }, { week: 'W6', hours: 9 },
    { week: 'W7', hours: 11 }, { week: 'W8', hours: 10 },
  ]

  const SKILL_COLORS = ['#4f46e5', '#6366f1', '#2563eb', '#0891b2', '#059669', '#d97706']

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── No Active Path State ─────────────────────────── */}
      {!active_path && (
        <div className="card p-6 sm:p-8 bg-white dark:bg-darkBg-card">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
              <Brain className="w-7 h-7" />
            </div>
            <div className="flex-1 text-center lg:text-left space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Initialize Your Learning Roadmap
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Complete a guided onboarding session to identify your prior background, map skill gaps, and generate your sequenced curriculum.
              </p>
              <div className="pt-2">
                <button onClick={() => navigate('/onboarding')} className="btn-primary">
                  Begin Onboarding <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Metric Stat Cards Row (Inspired by Image 1) ─── */}
      {active_path && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Path Progress"
            value={`${overallPct}%`}
            sub={`${active_path.resources_completed} units completed`}
            icon={Award}
            accent="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
            trend={overallPct > 0 ? 6 : null}
          />
          <StatCard
            label="Weeks Left"
            value={Math.max(0, (active_path.total_weeks || 0) - (active_path.current_week || 0) + 1)}
            sub={`of ${active_path.total_weeks} total weeks`}
            icon={Calendar}
            accent="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
          />
          <StatCard
            label="Skills Tracked"
            value={Object.keys(skills_map || {}).length}
            sub="competency profile"
            icon={Target}
            accent="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          />
          <StatCard
            label="Path Updates"
            value={recent_adaptations?.length || 0}
            sub="adaptive revisions"
            icon={Zap}
            accent="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          />
        </div>
      )}

      {/* ── Active Module & Progress ────────────────────── */}
      {active_path && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          
          {/* Progress Ring Card */}
          <div className="card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-darkBg-border pb-2.5 mb-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Curriculum Completion</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                  On Pace
                </span>
              </div>

              <div className="flex flex-col items-center justify-center my-3">
                <div className="relative my-1">
                  <ProgressRing pct={overallPct} size={116} stroke={8} isDark={isDark} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">{overallPct}%</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">completed</span>
                  </div>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-2 text-center">{active_path.goal_title}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/80 dark:border-darkBg-border text-xs font-mono">
              <div className="p-2 bg-slate-50 dark:bg-darkBg-cardSub/60 rounded-xl text-center">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{active_path.resources_completed}</p>
                <p className="text-[10px] text-slate-500 font-sans">Units Done</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-darkBg-cardSub/60 rounded-xl text-center">
                <p className="font-bold text-slate-900 dark:text-white text-sm">W{active_path.current_week}</p>
                <p className="text-[10px] text-slate-500 font-sans">of {active_path.total_weeks}</p>
              </div>
            </div>
          </div>

          {/* Up Next Action Card (Hero Tile) */}
          <div className="lg:col-span-2 card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-darkBg-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active Learning Objective</span>
                </div>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-0.5 rounded-lg border border-brand-200 dark:border-brand-800 font-mono">
                  {next_action?.phase_title || 'Current Phase'}
                </span>
              </div>

              {next_action ? (
                <div className="space-y-3">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">{next_action.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> {next_action.duration_hours}h estimated effort
                    </span>
                    <span className="badge badge-gray uppercase text-[10px] font-mono">{next_action.type}</span>
                    {next_action.has_assessment && (
                      <span className="badge badge-yellow text-[10px]">Knowledge Check</span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-darkBg-cardSub/60 rounded-xl border border-slate-200/80 dark:border-darkBg-border space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Milestone Pacing</span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        Week {active_path.current_week} of {active_path.total_weeks}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.round((active_path.current_week / active_path.total_weeks) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="font-semibold text-slate-900 dark:text-white">All current milestones completed</p>
                  <p className="text-xs text-slate-500">Check your full roadmap for upcoming units.</p>
                </div>
              )}
            </div>

            {next_action && (
              <button
                onClick={() => navigate(`/resource/${next_action.resource_id}`, { state: { pathItemId: next_action.item_id } })}
                className="btn-primary w-full justify-center mt-5"
              >
                <PlayCircle className="w-4 h-4" /> Open Learning Module
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Charts Row (Theme-Aware) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Weekly Activity Area Chart */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title text-base">Weekly Study Engagement</h2>
              <p className="section-sub text-xs">Hours logged across recent milestones</p>
            </div>
            <span className="badge badge-gray font-mono">Last 8 Weeks</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f293d' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="week" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#1f293d' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#0f172a',
                    borderRadius: '12px'
                  }}
                  formatter={v => [`${v} hours`]}
                />
                <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={2.5} fill="url(#hoursGrad)" dot={{ fill: '#4f46e5', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Radar */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="section-title text-base">Domain Mastery</h2>
            <p className="section-sub text-xs">Competency distribution</p>
          </div>
          {radarData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? '#1f293d' : '#e2e8f0'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 10 }} />
                  <Radar name="Mastery" dataKey="Level" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={1.5} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#111827' : '#ffffff',
                      borderColor: isDark ? '#1f293d' : '#e2e8f0',
                      color: isDark ? '#ffffff' : '#0f172a',
                      borderRadius: '12px'
                    }}
                    formatter={v => [`${v}%`]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-center text-xs text-slate-400">
              Complete initial assessments to plot competency radar.
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Section: Skills & Quick Actions ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Top Skills List */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="section-title text-base">Verified Competencies</h2>
            <p className="section-sub text-xs">Highest scoring skill areas</p>
          </div>
          {topSkills.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical" margin={{ left: 0, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f293d' : '#e2e8f0'} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: isDark ? '#cbd5e1' : '#334155', fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#111827' : '#ffffff',
                      borderColor: isDark ? '#1f293d' : '#e2e8f0',
                      color: isDark ? '#ffffff' : '#0f172a',
                      borderRadius: '12px'
                    }}
                    formatter={v => [`${v}%`]}
                  />
                  <Bar dataKey="level" radius={[0, 6, 6, 0]}>
                    {topSkills.map((_, i) => (
                      <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-center text-xs text-slate-400">
              No skill assessments logged yet.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-5 space-y-3">
          <div>
            <h2 className="section-title text-base">Quick Shortcuts</h2>
            <p className="section-sub text-xs">Jump to core roadmap tools</p>
          </div>
          <div className="space-y-2 pt-1">
            {[
              { label: 'My Roadmap', icon: BookOpen, to: '/roadmap', desc: 'Inspect weekly phased milestones' },
              { label: 'Skill Gap Breakdown', icon: Target, to: '/skill-gap', desc: 'Review prerequisite gaps and target mastery' },
              { label: 'Re-Onboard Goal', icon: Brain, to: '/onboarding', desc: 'Reconfigure career goal or hours' },
            ].map((link, i) => (
              <button
                key={i}
                onClick={() => navigate(link.to)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-darkBg-border hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-darkBg-cardSub transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-darkBg-cardSub flex items-center justify-center text-slate-700 dark:text-slate-200 flex-shrink-0">
                  <link.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{link.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
