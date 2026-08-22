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
  AlertTriangle, Loader2, Brain, BookOpen, Clock,
  TrendingUp, Award, Calendar, ChevronRight,
} from 'lucide-react'
import useAuthStore from '../store/authStore'

/* ── tiny Stat card ──────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, accent, trend }) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend != null && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'stat-positive' : 'stat-negative'}`}>
            <TrendingUp className="w-3 h-3" />
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="stat-value mt-3">{value}</p>
      <p className="stat-label">{label}</p>
      {sub && <p className="stat-sub text-text-muted">{sub}</p>}
    </div>
  )
}

/* ── Circular progress ring ─────────────────────────── */
function ProgressRing({ pct, size = 96, stroke = 8 }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8edf5" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#4f46e5" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
        <p className="text-text-secondary text-sm">Loading your dashboard…</p>
      </div>
    </div>
  )

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

  const SKILL_COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── No path CTA ────────────────────────────────────────────── */}
      {!active_path && (
        <div className="card overflow-hidden animate-fade-in">
          {/* Gradient top strip */}
          <div className="h-1 -mx-6 -mt-6 mb-6 bg-gradient-to-r from-brand-500 via-violet-500 to-indigo-500" />
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand flex-shrink-0">
              <Brain className="w-10 h-10 text-white" />
            </div>
            {/* Copy */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl font-black text-text-primary mb-2">Start your personalized journey</h2>
              <p className="text-text-secondary mb-5 max-w-lg">
                Chat with PathMind AI to build your profile. Our ML engine will map your skill gaps,
                sequence prerequisites, and generate a week-by-week roadmap — tailored to your goal.
              </p>
              <div className="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
                {['Skill Gap Analysis', 'AI Recommendations', 'Adaptive Assessments', 'Progress Tracking'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t}
                  </span>
                ))}
              </div>
              <button onClick={() => navigate('/onboarding')} className="btn-primary">
                Begin Onboarding <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat row ─────────────────────────────────── */}
      {active_path && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Overall Progress"
            value={`${overallPct}%`}
            sub={`${active_path.resources_completed} resources done`}
            icon={Award}
            accent="bg-brand-50 text-brand-600"
            trend={overallPct > 0 ? 7 : null}
          />
          <StatCard
            label="Weeks Remaining"
            value={Math.max(0, (active_path.total_weeks || 0) - (active_path.current_week || 0) + 1)}
            sub={`of ${active_path.total_weeks} total weeks`}
            icon={Calendar}
            accent="bg-violet-50 text-violet-600"
          />
          <StatCard
            label="Skills Tracked"
            value={Object.keys(skills_map || {}).length}
            sub="in your profile"
            icon={Target}
            accent="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Path Adaptations"
            value={recent_adaptations?.length || 0}
            sub="AI-driven updates"
            icon={Zap}
            accent="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      {/* ── Middle: progress ring + next action ─────── */}
      {active_path && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress ring card */}
          <div className="card flex flex-col items-center justify-center text-center animate-slide-up">
            <p className="text-sm font-semibold text-text-secondary mb-4">Path Completion</p>
            <div className="relative mb-4">
              <ProgressRing pct={overallPct} size={120} stroke={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-text-primary">{overallPct}%</span>
                <span className="text-xs text-text-muted">complete</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-text-primary">{active_path.goal_title}</h3>
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              <div className="bg-surface-100 rounded-xl p-2.5">
                <p className="text-lg font-bold text-text-primary">{active_path.resources_completed}</p>
                <p className="text-xs text-text-muted">done</p>
              </div>
              <div className="bg-surface-100 rounded-xl p-2.5">
                <p className="text-lg font-bold text-text-primary">Week {active_path.current_week}</p>
                <p className="text-xs text-text-muted">of {active_path.total_weeks}</p>
              </div>
            </div>
          </div>

          {/* Next action card — spans 2 cols */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card h-full flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-text-secondary">Up next</h3>
              </div>

              {next_action ? (
                <>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                      {next_action.phase_title}
                    </span>
                    <h2 className="text-xl font-bold text-text-primary mt-3 mb-2">{next_action.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3.5 h-3.5" /> {next_action.duration_hours}h
                      </span>
                      <span className={`badge ${next_action.type === 'project' ? 'badge-purple' : 'badge-blue'}`}>
                        {next_action.type}
                      </span>
                      {next_action.has_assessment && <span className="badge badge-yellow">Has Assessment</span>}
                    </div>
                    {/* Progress bar for phase */}
                    <div className="bg-surface-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-muted">Phase progress</span>
                        <span className="text-xs font-semibold text-brand-600">
                          {Math.round((active_path.current_week / active_path.total_weeks) * 100)}%
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
                  <button
                    onClick={() => navigate(`/resource/${next_action.resource_id}`, { state: { pathItemId: next_action.item_id } })}
                    className="btn-primary mt-5 justify-center w-full"
                  >
                    <PlayCircle className="w-4 h-4" /> Continue Learning
                  </button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="font-semibold text-text-primary">All caught up!</p>
                    <p className="text-text-secondary text-sm mt-1">Check your roadmap for remaining items.</p>
                    <button onClick={() => navigate('/roadmap')} className="btn-secondary mt-4 mx-auto">
                      View Roadmap <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Charts row ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly learning hours area chart */}
        <div className="lg:col-span-2 card animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title text-base">Learning Activity</h2>
              <p className="section-sub text-xs">Weekly hours invested</p>
            </div>
            <span className="badge badge-indigo">Last 8 weeks</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}
                  formatter={v => [`${v}h`]}
                />
                <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={2.5} fill="url(#hoursGrad)" dot={{ fill: '#4f46e5', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills radar */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title text-base mb-1">Skills Overview</h2>
          <p className="section-sub text-xs mb-4">Mastery by domain</p>
          {radarData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e8edf5" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="Level" dataKey="Level" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: '12px', color: '#1e293b' }}
                    formatter={v => [`${v}%`]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <div className="text-center">
                <Target className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm">Complete assessments to see skills</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom: top skills + adaptations ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top skills bar chart */}
        <div className="card animate-fade-in">
          <h2 className="section-title text-base mb-1">Top Skills</h2>
          <p className="section-sub text-xs mb-5">Your strongest competencies</p>
          {topSkills.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical" margin={{ left: 0, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: '12px', color: '#1e293b' }}
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
            <div className="h-52 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm">Complete onboarding to see skills</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent adaptations + quick links */}
        <div className="flex flex-col gap-4">
          {/* Recent adaptations */}
          {recent_adaptations?.length > 0 && (
            <div className="card animate-fade-in">
              <h2 className="section-title text-base mb-3">Recent Adaptations</h2>
              <div className="space-y-2">
                {recent_adaptations.slice(0, 2).map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700 capitalize mb-0.5">
                        {a.trigger?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-text-secondary">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="card animate-slide-up">
            <h2 className="section-title text-base mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'View Full Roadmap', icon: BookOpen, to: '/roadmap', color: 'text-brand-600 bg-brand-50', desc: 'See all phases and milestones' },
                { label: 'Skill Gap Analysis', icon: Target, to: '/skill-gap', color: 'text-emerald-600 bg-emerald-50', desc: 'Identify what you need to learn' },
                { label: 'AI Onboarding', icon: Brain, to: '/onboarding', color: 'text-violet-600 bg-violet-50', desc: 'Update your profile' },
              ].map((link, i) => (
                <button
                  key={i}
                  onClick={() => navigate(link.to)}
                  className="card-hover w-full text-left flex items-center gap-3 !p-3"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${link.color}`}>
                    <link.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm">{link.label}</p>
                    <p className="text-xs text-text-muted">{link.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
