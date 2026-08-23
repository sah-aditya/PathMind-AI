import { Link } from 'react-router-dom'
import {
  Wrench, ArrowRight, LayoutDashboard, Map, GitBranch,
  LifeBuoy, Sparkles, AlertTriangle, ShieldCheck
} from 'lucide-react'

const SERVICE_META = {
  dashboard: {
    name: 'Learner Dashboard',
    desc: 'The main dashboard and daily recommendation feeds are temporarily paused for routine system maintenance.',
    icon: LayoutDashboard,
    fallbackTo: '/roadmap',
    fallbackLabel: 'Go to Curriculum Roadmap',
  },
  skill_gap: {
    name: 'Skill Gap Analysis',
    desc: 'Competency evaluation and skill gap assessment reports are temporarily paused for routine calibration.',
    icon: GitBranch,
    fallbackTo: '/dashboard',
    fallbackLabel: 'Return to Dashboard',
  },
  roadmap: {
    name: 'Curriculum Roadmap',
    desc: 'Curriculum graph generation and milestone progression are temporarily paused for curriculum catalog updates.',
    icon: Map,
    fallbackTo: '/dashboard',
    fallbackLabel: 'Return to Dashboard',
  },
  support_page: {
    name: 'Help & Support Desk',
    desc: 'The learner support ticket desk is temporarily paused for routine queue maintenance and server upgrades.',
    icon: LifeBuoy,
    fallbackTo: '/dashboard',
    fallbackLabel: 'Return to Dashboard',
  },
  onboarding: {
    name: 'Student Onboarding',
    desc: 'AI-guided student onboarding and goal profiling are temporarily paused by administration.',
    icon: Sparkles,
    fallbackTo: '/dashboard',
    fallbackLabel: 'Return to Dashboard',
  },
  re_onboard: {
    name: 'Goal Re-Onboarding',
    desc: 'Goal calibration and career path resets are temporarily paused by administration.',
    icon: Sparkles,
    fallbackTo: '/dashboard',
    fallbackLabel: 'Return to Dashboard',
  },
  ai_chatbot: {
    name: 'Studio AI Advisor',
    desc: 'The conversational AI advisor and curriculum mentor are temporarily paused for model upgrades.',
    icon: Sparkles,
    fallbackTo: '/dashboard',
    fallbackLabel: 'Return to Dashboard',
  },
}

export default function ServicePausedScreen({ serviceKey = 'dashboard', customMessage, serviceFlags = {} }) {
  const meta = SERVICE_META[serviceKey] || {
    name: 'Service Paused',
    desc: 'This feature is temporarily paused for scheduled maintenance.',
    icon: Wrench,
    fallbackTo: '/dashboard',
    fallbackLabel: 'Return to Dashboard',
  }

  const Icon = meta.icon

  // Find other services that ARE currently online
  const onlineNavOptions = [
    { to: '/dashboard', label: 'Dashboard', id: 'dashboard' },
    { to: '/roadmap', label: 'Curriculum Roadmap', id: 'roadmap' },
    { to: '/skill-gap', label: 'Skill Gap Analysis', id: 'skill_gap' },
    { to: '/help', label: 'Support Desk', id: 'support_page' },
  ].filter(item => item.id !== serviceKey && serviceFlags[item.id] !== false)

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-12 px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card text-center space-y-6 relative overflow-hidden">
        
        {/* Subtle Ambient Background Flare */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-500/10 dark:bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="relative inline-flex">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-subtle">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-darkBg-card shadow-sm">
            <Wrench className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Status Tag */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold tracking-wide uppercase border border-amber-200 dark:border-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Service Temporarily Paused
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {meta.name} is Offline
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            {customMessage || meta.desc}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Your progress, assessments, and profile data are completely safe and will be restored immediately when service resumes.
          </p>
        </div>

        {/* Available Live Services Quick Navigation */}
        {onlineNavOptions.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-darkBg-border space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Available Active Services
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {onlineNavOptions.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-darkBg-cardSub hover:bg-slate-200 dark:hover:bg-darkBg-border text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-darkBg-border transition-colors flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
