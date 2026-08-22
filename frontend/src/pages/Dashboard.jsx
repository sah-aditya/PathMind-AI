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
  AlertTriangle, Brain, BookOpen, Clock,
  TrendingUp, Award, Calendar, ChevronRight,
} from 'lucide-react'
import useAuthStore from '../store/authStore'

/* ── Stat Card Component ─────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, accent, trend }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend != null && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'stat-positive' : 'stat-negative'}`}>
            <TrendingUp className="w-3 h-3" />
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="stat-value mt-2.5">{value}</p>
      <p className="stat-label">{label}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  )
}

/* ── Circular Progress Ring ──────────────────────────── */
function ProgressRing({ pct, size = 96, stroke = 7 }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
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

/* ── Dashboard Skeleton Loading State ────────────────── */
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="h-6 w-16 bg-slate-200 rounded" />
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card h-64 bg-white flex flex-col items-center justify-center gap-3">
          <div className="w-24 h-24 rounded-full bg-slate-200" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
        <div className="lg:col-span-2 card h-64 bg-white space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-6 w-3/4 bg-slate-200 rounded" />
          <div className="h-16 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data),
    refetchInterval: 60000,
  })

  if (isLoading) {
    return <DashboardSkeleton />
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

  /* Simulated weekly progress data */
  const weeklyData = [
    { week: 'W1', hours: 4 }, { week: 'W2', hours: 6 }, { week: 'W3', hours: 5 },
    { week: 'W4', hours: 8 }, { week: 'W5', hours: 7 }, { week: 'W6', hours: 9 },
    { week: 'W7', hours: 11 }, { week: 'W8', hours: 10 },
  ]

  const SKILL_COLORS = ['#4f46e5', '#6366f1', '#2563eb', '#0891b2', '#059669', '#d97706']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── No Active Path State ─────────────────────────── */}
      {!active_path && (
        <div className="card overflow-hidden bg-white border border-surface-200 shadow-subtle p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
              <Brain className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center lg:text-left space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Initialize Your Learning Roadmap
              </h2>
              <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
                Complete a guided onboarding session to identify your current background, map skill gaps, and generate your sequenced curriculum.
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

      {/* ── Metric Stat Row ─────────────────────────────── */}
      {active_path && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Overall Progress"
            value={`${overallPct}%`}
            sub={`${active_path.resources_completed} modules completed`}
            icon={Award}
            accent="bg-brand-50 text-brand-700"
            trend={overallPct > 0 ? 5 : null}
          />
          <StatCard
            label="Weeks Remaining"
            value={Math.max(0, (active_path.total_weeks || 0) - (active_path.current_week || 0) + 1)}
            sub={`of ${active_path.total_weeks} total weeks`}
            icon={Calendar}
            accent="bg-slate-100 text-slate-700"
          />
          <StatCard
            label="Skills Monitored"
            value={Object.keys(skills_map || {}).length}
            sub="in active competency profile"
            icon={Target}
            accent="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Adaptive Events"
            value={recent_adaptations?.length || 0}
            sub="curriculum adjustments"
            icon={Zap}
            accent="bg-amber-50 text-amber-700"
          />
        </div>
      )}

      {/* ── Active Module & Progress ────────────────────── */}
      {active_path && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Ring Card */}
          <div className="card flex flex-col items-center justify-center text-center p-6">
            <span className="input-label mb-3">Roadmap Completion</span>
            <div className="relative my-2">
              <ProgressRing pct={overallPct} size={116} stroke={8} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">{overallPct}%</span>
                <span className="text-[11px] text-text-muted">overall</span>
              </div>
            </div>
            <h3 className="text-xs font-semibold text-slate-900 mt-2">{active_path.goal_title}</h3>
            <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-4 border-t border-surface-200 text-xs">
              <div className="p-2 bg-surface-50 rounded border border-surface-200">
                <p className="font-bold text-slate-900">{active_path.resources_completed}</p>
                <p className="text-[11px] text-text-muted">Completed</p>
              </div>
              <div className="p-2 bg-surface-50 rounded border border-surface-200">
                <p className="font-bold text-slate-900">Week {active_path.current_week}</p>
                <p className="text-[11px] text-text-muted">of {active_path.total_weeks}</p>
              </div>
            </div>
          </div>

          {/* Up Next Action Card */}
          <div className="lg:col-span-2 card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between border-b border-surface-200 pb-3 mb-4">
                <span className="input-label !mb-0">Current Learning Objective</span>
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {next_action?.phase_title || 'Active Milestone'}
                </span>
              </div>

              {next_action ? (
                <div className="space-y-3">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{next_action.title}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Clock className="w-3.5 h-3.5" /> {next_action.duration_hours}h estimated
                    </span>
                    <span className="badge badge-gray uppercase">{next_action.type}</span>
                    {next_action.has_assessment && <span className="badge badge-yellow">Knowledge Check Included</span>}
                  </div>

                  <div className="p-3 bg-surface-50 rounded-lg border border-surface-200 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Milestone Timeline</span>
                      <span className="font-semibold text-slate-900">
                        Week {active_path.current_week} / {active_path.total_weeks}
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
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="font-semibold text-slate-900">All current milestones completed</p>
                  <p className="text-xs text-text-secondary">Check your full roadmap for upcoming units.</p>
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

      {/* ── Activity & Competency Charts ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Weekly Study Engagement</h2>
              <p className="section-sub">Hours logged across recent milestones</p>
            </div>
            <span className="badge badge-gray font-mono">Last 8 Weeks</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={v => [`${v} hours`]}
                />
                <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={2} fill="url(#hoursGrad)" dot={{ fill: '#4f46e5', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Radar */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="section-title">Domain Mastery</h2>
            <p className="section-sub">Competency distribution</p>
          </div>
          {radarData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                  <Radar name="Mastery" dataKey="Level" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} strokeWidth={1.5} />
                  <Tooltip
                    formatter={v => [`${v}%`]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-center text-xs text-text-muted">
              Complete initial assessments to plot competency radar.
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Section: Skills & Quick Actions ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills List */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="section-title">Verified Competencies</h2>
            <p className="section-sub">Highest scoring skill areas</p>
          </div>
          {topSkills.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical" margin={{ left: 0, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => [`${v}%`]} />
                  <Bar dataKey="level" radius={[0, 4, 4, 0]}>
                    {topSkills.map((_, i) => (
                      <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-center text-xs text-text-muted">
              No skill assessments logged yet.
            </div>
          )}
        </div>

        {/* Quick Actions / Navigation */}
        <div className="card p-5 space-y-3">
          <div>
            <h2 className="section-title">Navigation Shortcuts</h2>
            <p className="section-sub">Explore full learning curriculum</p>
          </div>
          <div className="space-y-2 pt-1">
            {[
              { label: 'My Roadmap', icon: BookOpen, to: '/roadmap', desc: 'Inspect full weekly phased milestone schedule' },
              { label: 'Skill Gap Breakdown', icon: Target, to: '/skill-gap', desc: 'Review prerequisite gaps and target mastery' },
              { label: 'Re-Onboard Goal', icon: Brain, to: '/onboarding', desc: 'Reconfigure target career goal or weekly study hours' },
            ].map((link, i) => (
              <button
                key={i}
                onClick={() => navigate(link.to)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-surface-200 hover:border-slate-300 hover:bg-surface-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                  <link.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{link.label}</p>
                  <p className="text-xs text-text-secondary truncate">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
