import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, ArrowRight, CheckCircle, Clock,
  Cpu, Compass, ShieldCheck, Sun, Moon,
  Terminal, Sparkles, Database, Layers, Plane, Code
} from 'lucide-react'
import useThemeStore from '../store/themeStore'

const GOAL_OPTIONS = [
  {
    id: 'mle',
    title: 'Machine Learning Engineer',
    category: 'Artificial Intelligence',
    icon: Brain,
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    duration: '14 Weeks',
    commitment: '8h / week',
    summary: 'Master NumPy, Scikit-Learn, Deep Learning, and MLOps deployment.',
    milestones: ['Python & Linear Algebra', 'Feature Engineering & ML', 'Deep Neural Nets', 'Model Deployment']
  },
  {
    id: 'cloud',
    title: 'Full-Stack Cloud Architect',
    category: 'Software Engineering',
    icon: Code,
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    duration: '12 Weeks',
    commitment: '8h / week',
    summary: 'Build scalable APIs, Postgres databases, Docker containers, and CI/CD pipelines.',
    milestones: ['React & TypeScript', 'FastAPI & SQL Modeling', 'Docker & Kubernetes', 'Production Cloud']
  },
  {
    id: 'robotics',
    title: 'Autonomous Robotics',
    category: 'Robotics & Embedded',
    icon: Cpu,
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    duration: '16 Weeks',
    commitment: '10h / week',
    summary: 'Bridge C++, ROS2 middleware, SLAM perception, and path planning algorithms.',
    milestones: ['C++ & Linux Kernel', 'ROS2 Middleware', 'Computer Vision SLAM', 'Hardware Checkride']
  },
  {
    id: 'pilot',
    title: 'Commercial Airline Pilot',
    category: 'Aviation Ground School',
    icon: Plane,
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    duration: '12 Weeks',
    commitment: '6h / week',
    summary: 'Master aerodynamics, aviation weather, navigation, air law, and flight instruments.',
    milestones: ['Aerodynamics Principles', 'Aviation Meteorology', 'Air Law & Navigation', 'Simulator Checkride']
  }
]

export default function Landing() {
  const [activeGoal, setActiveGoal] = useState(GOAL_OPTIONS[0])
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-darkBg-canvas text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white transition-colors duration-200">

      {/* ── Floating Studio Nav ────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-darkBg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-darkBg-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white shadow-subtle">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">PathMind AI</span>
          </Link>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border transition-colors shadow-subtle"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <Link to="/login" className="btn-ghost text-xs sm:text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-xs sm:text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Modern Hero Section ─────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14 text-center space-y-5">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border text-brand-600 dark:text-brand-400 text-xs font-semibold shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Adaptive Graph-Based Learning Paths
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          Your Career Goal. <br className="hidden sm:inline" />
          <span className="text-brand-600 dark:text-brand-400">Structured Week by Week.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          PathMind AI analyzes your background, maps prerequisite dependencies into a Directed Acyclic Graph (DAG), and calibrates a personalized weekly roadmap for any career.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link to="/register" className="btn-primary px-7 py-3 text-sm w-full sm:w-auto">
            Build Your Roadmap Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-sm w-full sm:w-auto">
            Try Demo Account
          </Link>
        </div>

        {/* Micro Trust Pills */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Free & Open Platform
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Prerequisite-Gated
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Any Career Target
          </span>
        </div>

      </section>

      {/* ── Interactive Goal Action Tiles (Inspired by Image 2 & 3) ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
        
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Interactive Goal Explorer</p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Choose a Target Career to Preview</h2>
        </div>

        {/* Touch-Friendly Action Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {GOAL_OPTIONS.map((g) => {
            const Icon = g.icon
            const isSelected = activeGoal.id === g.id
            return (
              <div
                key={g.id}
                onClick={() => setActiveGoal(g)}
                className={`touch-tile bg-white dark:bg-darkBg-card ${
                  isSelected
                    ? 'border-brand-500 dark:border-brand-400 ring-2 ring-brand-500/20 shadow-card'
                    : 'border-slate-200/80 dark:border-darkBg-border hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${g.bgLight}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">{g.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">{g.duration}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Active Roadmap Visual Preview Card */}
        <div className="card p-6 sm:p-7 bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-darkBg-border pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{activeGoal.category}</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{activeGoal.title} Track</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeGoal.summary}</p>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-darkBg-cardSub px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {activeGoal.duration} • {activeGoal.commitment}
            </div>
          </div>

          {/* 4-Milestone Subway Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {activeGoal.milestones.map((m, i) => (
              <div
                key={m}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub/60 border border-slate-200/80 dark:border-darkBg-border space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">Phase 0{i + 1}</span>
                  {i === 0 && <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">Foundation</span>}
                </div>
                <p className="font-bold text-slate-900 dark:text-white leading-snug">{m}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-darkBg-border">
            <span>Our DAG algorithm sequences these units so you never waste time on duplicate tutorials.</span>
            <Link to="/register" className="btn-primary text-xs flex-shrink-0">
              Start This Path <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </section>

      {/* ── 3-Step Simple Architecture ──────────────────────── */}
      <section className="bg-white dark:bg-darkBg-card border-y border-slate-200/80 dark:border-darkBg-border py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">How PathMind Works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Three Steps to Mastery</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                title: 'Conversational Profiling',
                desc: 'Chat with PathMind AI about your target ambition, background, and weekly time budget.',
                accent: 'text-indigo-600 dark:text-indigo-400'
              },
              {
                num: '02',
                title: 'Topological DAG Sort',
                desc: 'Kahn’s algorithm sequences prerequisite skills so foundations are mastered before complexity.',
                accent: 'text-emerald-600 dark:text-emerald-400'
              },
              {
                num: '03',
                title: 'Bayesian Adaptive Feedback',
                desc: 'Interactive knowledge checks update your skill model and calibrate upcoming modules in real time.',
                accent: 'text-amber-600 dark:text-amber-400'
              },
            ].map((step) => (
              <div key={step.num} className="p-6 rounded-2xl bg-slate-50 dark:bg-darkBg-cardSub/50 border border-slate-200/80 dark:border-darkBg-border space-y-3">
                <span className={`text-2xl font-black font-mono ${step.accent}`}>{step.num}</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Footer with Developer Attribution ────────────────── */}
      <footer className="mt-auto py-8 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-darkBg-border bg-white dark:bg-darkBg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">PathMind AI</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>
              Built with ❤️ in Bharat 🇮🇳 • Crafted by{' '}
              <a
                href="mailto:er.adityasah@gmail.com"
                className="font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Aditya Sah
              </a>
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <a
              href="https://github.com/sah-aditya/PathMind-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
