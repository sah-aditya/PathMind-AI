import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pathApi } from '../services/api'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowRight, Target, CheckCircle, AlertCircle, Loader2, Map } from 'lucide-react'

const CATEGORY_COLORS = {
  'Programming': '#6366f1', 'Mathematics': '#8b5cf6', 'Machine Learning': '#ec4899',
  'Deep Learning': '#f59e0b', 'Data Science': '#10b981', 'NLP': '#3b82f6',
  'Generative AI': '#f97316', 'Computer Vision': '#06b6d4', 'MLOps': '#84cc16',
  'Web Development': '#e879f9', 'Cloud': '#38bdf8', 'Cybersecurity': '#fb7185',
}

function DifficultyBadge({ level }) {
  const classes = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' }
  return <span className={`badge ${classes[level] || 'badge-gray'} capitalize`}>{level}</span>
}

export default function SkillGap() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['skill-gap'],
    queryFn: () => pathApi.getSkillGap().then(r => r.data),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-400 mx-auto mb-4" />
        <p className="text-gray-400">Analysing your skill gap…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card text-center max-w-sm">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-white font-medium mb-2">Failed to load skill gap</p>
        <p className="text-gray-400 text-sm">Complete onboarding first to set your goal.</p>
        <button onClick={() => navigate('/onboarding')} className="btn-primary mt-4 mx-auto">
          Start Onboarding
        </button>
      </div>
    </div>
  )

  const { goal_title, overall_readiness, estimated_weeks, skills_already_met, skills_to_learn } = data

  // Prepare radar chart data — top 8 skills to learn
  const topGaps = skills_to_learn.slice(0, 8)
  const radarData = topGaps.map(sg => ({
    subject: sg.skill_name.replace(' ', '\n'),
    Current: Math.round(sg.current_level * 100),
    Required: Math.round(sg.required_level * 100),
  }))

  // Group gaps by category
  const byCategory = {}
  for (const sg of skills_to_learn) {
    if (!byCategory[sg.category]) byCategory[sg.category] = []
    byCategory[sg.category].push(sg)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-brand-400 text-sm mb-2">
          <Target className="w-4 h-4" /> Skill Gap Analysis
        </div>
        <h1 className="text-3xl font-bold text-white">{goal_title}</h1>
        <p className="text-gray-400 mt-1">Here's what you need to learn to reach your goal.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Readiness', value: `${Math.round(overall_readiness * 100)}%`, color: 'text-emerald-400', sub: 'of goal skills met' },
          { label: 'Skills to learn', value: skills_to_learn.length, color: 'text-amber-400', sub: 'identified gaps' },
          { label: 'Already have', value: skills_already_met.length, color: 'text-brand-400', sub: 'skills in your profile' },
          { label: 'Est. duration', value: `${estimated_weeks}w`, color: 'text-purple-400', sub: 'to goal completion' },
        ].map((s, i) => (
          <div key={i} className="card text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm font-medium text-white mt-1">{s.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Radar chart */}
        <div className="card animate-fade-in">
          <h2 className="section-title text-base mb-1">Skills Radar</h2>
          <p className="section-sub text-xs mb-4">Current level vs required level for your goal</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Radar name="Current" dataKey="Current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Required" dataKey="Required" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#e2e8f0' }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 justify-center text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand-500 inline-block rounded" /> Current level</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-purple-500 inline-block rounded border-dashed" /> Required level</span>
          </div>
        </div>

        {/* Skills already have */}
        <div className="card animate-fade-in">
          <h2 className="section-title text-base mb-1">Skills You Already Have</h2>
          <p className="section-sub text-xs mb-4">{skills_already_met.length} skills meet the requirement (≥70%)</p>
          {skills_already_met.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-gray-500 text-sm">No skills confirmed yet — complete onboarding</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills_already_met.map(sid => (
                <span key={sid} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> {sid.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gap list by category */}
      <div className="mb-8 animate-fade-in">
        <h2 className="section-title mb-1">Skills to Develop</h2>
        <p className="section-sub mb-5">Prioritized by prerequisite importance and gap size</p>
        <div className="space-y-6">
          {Object.entries(byCategory).map(([cat, gaps]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] || '#6366f1' }} />
                <h3 className="text-sm font-semibold text-white">{cat}</h3>
                <span className="text-xs text-gray-500">({gaps.length} skills)</span>
              </div>
              <div className="space-y-2">
                {gaps.map((sg) => (
                  <div key={sg.skill_id} className="glass-hover rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{sg.skill_name}</span>
                        {sg.is_prerequisite && (
                          <span className="badge badge-purple">Prerequisite</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        Priority #{sg.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="progress-bar flex-1">
                        <div className="progress-fill" style={{ width: `${sg.current_level * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-20 text-right">
                        {Math.round(sg.current_level * 100)}% → {Math.round(sg.required_level * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="card border border-brand-600/20 text-center animate-slide-up">
        <Map className="w-8 h-8 text-brand-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Your roadmap is ready</h2>
        <p className="text-gray-400 text-sm mb-5">
          We've generated a {estimated_weeks}-week personalized path to close these gaps. Let's see it.
        </p>
        <button onClick={() => navigate('/roadmap')} className="btn-primary mx-auto">
          View My Roadmap <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
