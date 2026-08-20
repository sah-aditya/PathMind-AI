import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../services/api'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'
import {
  LayoutDashboard, ArrowRight, PlayCircle, Zap, Target,
  CheckCircle, AlertCircle, Loader2, Brain, BookOpen, Clock
} from 'lucide-react'
import useAuthStore from '../store/authStore'

function ProgressRing({ pct, size = 120, stroke = 10 }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#ringGrad)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
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
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
    </div>
  )

  const { active_path, next_action, skill_categories, skills_map, recent_adaptations } = data || {}

  const overallPct = Math.round((active_path?.overall_progress || 0) * 100)

  // Radar data from skill categories
  const radarData = (skill_categories || []).slice(0, 7).map(c => ({
    subject: c.category,
    Level: Math.round(c.average_level * 100),
  }))

  // Bar chart: top skills
  const topSkills = Object.entries(skills_map || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id, level]) => ({ name: id.replace(/-/g, ' ').slice(0, 16), level: Math.round(level * 100) }))

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <p className="text-gray-400 text-sm">{greeting()},</p>
        <h1 className="text-3xl font-bold text-white">{user?.name?.split(' ')[0]} 👋</h1>
        {active_path && (
          <p className="text-gray-400 mt-1 text-sm">
            Working toward <span className="text-brand-400 font-medium">{active_path.goal_title}</span>
          </p>
        )}
      </div>

      {/* No path state */}
      {!active_path && (
        <div className="card border border-brand-600/20 text-center mb-8 py-10">
          <Brain className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ready to start your journey?</h2>
          <p className="text-gray-400 text-sm mb-6">
            Complete onboarding to get your personalized AI-generated learning roadmap.
          </p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary mx-auto">
            Start Onboarding <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top row: progress + next action */}
      {active_path && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Progress ring */}
          <div className="card flex flex-col items-center text-center animate-slide-up">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Overall Progress</h2>
            <div className="relative">
              <ProgressRing pct={overallPct} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black gradient-text">{overallPct}%</span>
                <span className="text-xs text-gray-500">complete</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 w-full text-center">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-lg font-bold text-white">{active_path.resources_completed}</p>
                <p className="text-xs text-gray-500">done</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-lg font-bold text-white">{active_path.total_weeks - active_path.current_week + 1}</p>
                <p className="text-xs text-gray-500">weeks left</p>
              </div>
            </div>
          </div>

          {/* Next action */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-medium text-gray-400">Up next</h2>
              </div>
              {next_action ? (
                <>
                  <div className="flex-1">
                    <p className="text-xs text-brand-400 mb-1">{next_action.phase_title}</p>
                    <h3 className="text-lg font-bold text-white mb-2">{next_action.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" /> {next_action.duration_hours}h
                      </span>
                      <span className={`badge ${next_action.type === 'project' ? 'badge-purple' : 'badge-blue'}`}>
                        {next_action.type}
                      </span>
                      {next_action.has_assessment && <span className="badge badge-yellow">Has Assessment</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/resource/${next_action.resource_id}`, { state: { pathItemId: next_action.item_id } })}
                    className="btn-primary mt-4 justify-center"
                  >
                    <PlayCircle className="w-4 h-4" /> Continue Learning
                  </button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-white font-medium">All caught up!</p>
                    <p className="text-gray-500 text-sm">Check your roadmap for any remaining items.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Skills radar */}
        <div className="card animate-fade-in">
          <h2 className="section-title text-base mb-1">Skills Overview</h2>
          <p className="section-sub text-xs mb-4">Your mastery levels by domain</p>
          {radarData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Level" dataKey="Level" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', color: '#e2e8f0' }}
                    formatter={(v) => [`${v}%`]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
              Complete assessments to see your skill levels
            </div>
          )}
        </div>

        {/* Top skills bar chart */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title text-base mb-1">Top Skills</h2>
          <p className="section-sub text-xs mb-4">Your strongest competencies</p>
          {topSkills.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', color: '#e2e8f0' }}
                    formatter={(v) => [`${v}%`]}
                  />
                  <Bar dataKey="level" radius={[0, 4, 4, 0]}>
                    {topSkills.map((_, i) => (
                      <Cell key={i} fill={`hsl(${250 + i * 10}, 80%, ${60 - i * 3}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
              No skill data yet — complete onboarding
            </div>
          )}
        </div>
      </div>

      {/* Recent adaptations */}
      {recent_adaptations?.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <h2 className="section-title text-base mb-3">Recent Path Adaptations</h2>
          <div className="space-y-2">
            {recent_adaptations.map((a) => (
              <div key={a.id} className="card border border-amber-700/20 bg-amber-900/5 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-400 font-medium capitalize mb-0.5">{a.trigger?.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-300">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
        {[
          { label: 'View Full Roadmap', icon: BookOpen, to: '/roadmap', color: 'from-brand-600/20 to-purple-600/20' },
          { label: 'Skill Gap Analysis', icon: Target, to: '/skill-gap', color: 'from-emerald-600/20 to-teal-600/20' },
          { label: 'AI Onboarding', icon: Brain, to: '/onboarding', color: 'from-rose-600/20 to-pink-600/20' },
        ].map((link, i) => (
          <button
            key={i}
            onClick={() => navigate(link.to)}
            className={`card bg-gradient-to-br ${link.color} glass-hover text-left flex items-center gap-3`}
          >
            <link.icon className="w-5 h-5 text-white" />
            <span className="font-medium text-white text-sm">{link.label}</span>
            <ArrowRight className="w-4 h-4 text-gray-500 ml-auto" />
          </button>
        ))}
      </div>
    </div>
  )
}
