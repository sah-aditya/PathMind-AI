import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, Zap, Target, BarChart3, ArrowRight,
  CheckCircle, GitBranch, Compass, Clock, PlayCircle,
  Cpu, Award, ShieldAlert, Sparkles, Network, Layers
} from 'lucide-react'

const SAMPLE_GOALS = [
  {
    id: 'mle',
    title: 'Machine Learning Engineer',
    category: 'Artificial Intelligence',
    duration: '14 Weeks',
    commitment: '8h / week',
    gaps: 6,
    nodes: [
      { step: '01', title: 'Python & Linear Algebra', type: 'Prerequisite Root', status: 'Met', hours: 16 },
      { step: '02', title: 'Statistical Modeling & NumPy', type: 'Core Theory', status: 'Scheduled', hours: 22 },
      { step: '03', title: 'Scikit-Learn & Feature Eng.', type: 'Applied ML', status: 'Scheduled', hours: 28 },
      { step: '04', title: 'Deep Neural Networks (PyTorch)', type: 'Advanced', status: 'Scheduled', hours: 32 },
      { step: '05', title: 'MLOps & Model Deployment', type: 'Capstone', status: 'Locked', hours: 18 }
    ]
  },
  {
    id: 'robotics',
    title: 'Autonomous Robotics Engineer',
    category: 'Hardware & Systems',
    duration: '16 Weeks',
    commitment: '10h / week',
    gaps: 7,
    nodes: [
      { step: '01', title: 'C++ & Linux Fundamentals', type: 'Prerequisite Root', status: 'Met', hours: 20 },
      { step: '02', title: 'ROS2 & Kinematics', type: 'Middleware', status: 'Scheduled', hours: 30 },
      { step: '03', title: 'Computer Vision & OpenCV', type: 'Perception', status: 'Scheduled', hours: 25 },
      { step: '04', title: 'SLAM & Path Planning', type: 'Autonomy', status: 'Scheduled', hours: 35 },
      { step: '05', title: 'Hardware-in-the-Loop Sim', type: 'Capstone', status: 'Locked', hours: 24 }
    ]
  },
  {
    id: 'pilot',
    title: 'Commercial Airline Pilot',
    category: 'Aviation Ground School',
    duration: '12 Weeks',
    commitment: '6h / week',
    gaps: 5,
    nodes: [
      { step: '01', title: 'Aerodynamics & Principles of Flight', type: 'Foundations', status: 'Met', hours: 14 },
      { step: '02', title: 'Aviation Meteorology & Weather', type: 'Core Science', status: 'Scheduled', hours: 18 },
      { step: '03', title: 'Navigation & Air Law Regulations', type: 'Operational', status: 'Scheduled', hours: 22 },
      { step: '04', title: 'Aircraft Systems & Instrumentation', type: 'Technical', status: 'Scheduled', hours: 24 },
      { step: '05', title: 'Flight Simulator Checkride Prep', type: 'Capstone', status: 'Locked', hours: 16 }
    ]
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Cloud Architect',
    category: 'Software Engineering',
    duration: '12 Weeks',
    commitment: '8h / week',
    gaps: 6,
    nodes: [
      { step: '01', title: 'TypeScript & Modern React', type: 'Frontend Core', status: 'Met', hours: 18 },
      { step: '02', title: 'FastAPI & Postgres Modeling', type: 'Backend Systems', status: 'Scheduled', hours: 24 },
      { step: '03', title: 'Docker, CI/CD & Kubernetes', type: 'DevOps', status: 'Scheduled', hours: 26 },
      { step: '04', title: 'Distributed Systems & Microservices', type: 'Architecture', status: 'Scheduled', hours: 28 },
      { step: '05', title: 'Production Cloud Deployment', type: 'Capstone', status: 'Locked', hours: 20 }
    ]
  },
]

const COMPARISON_POINTS = [
  {
    feature: 'Prerequisite Logic',
    traditional: 'Disconnected playlists with zero dependency order',
    pathmind: 'Kahn’s Topological Sort DAG guarantees prerequisite mastery first',
    better: true
  },
  {
    feature: 'Curriculum Pacing',
    traditional: 'Generic 60-hour video dumps with 80%+ drop-off rate',
    pathmind: 'Calibrated weekly milestones tailored to your exact study hours',
    better: true
  },
  {
    feature: 'Competency Tracking',
    traditional: 'Passive video completion badges with no retention proof',
    pathmind: 'Bayesian Beta(α,β) distribution modeling verified via knowledge checks',
    better: true
  },
  {
    feature: 'Path Flexibility',
    traditional: 'Rigid static courses that never adapt to failures or strengths',
    pathmind: 'Dynamic path adaptation automatically injects targeted revision',
    better: true
  },
]

export default function Landing() {
  const [selectedGoal, setSelectedGoal] = useState(SAMPLE_GOALS[0])

  return (
    <div className="min-h-screen bg-surface text-text-primary flex flex-col selection:bg-brand-500 selection:text-white">

      {/* ── Top Navigation ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-subtle">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">PathMind AI</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Link to="/login" className="btn-ghost text-xs sm:text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-xs sm:text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-12 sm:pt-20 sm:pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            Topological Graph Learning Engine
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
            Stop Tutorial Hell. <br />
            <span className="text-brand-600">Engineered Learning Paths</span> For Any Goal.
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            PathMind sequences your skills using Directed Acyclic Graphs (DAGs), matches your time budget, and continuously adapts your curriculum through Bayesian mastery assessments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link to="/register" className="btn-primary px-7 py-3 text-sm w-full sm:w-auto justify-center">
              Generate Your Roadmap Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3 text-sm w-full sm:w-auto justify-center">
              Explore Demo Account
            </Link>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> 100% Free & Open Platform
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Universal Career Synthesis
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Zero Fluff or Fake Reviews
            </span>
          </div>
        </div>
      </section>

      {/* ── Interactive Curriculum Simulator ────────────────── */}
      <section className="bg-white border-y border-surface-200 py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Live Simulator</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Interactive Curriculum Graph Explorer
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                Select a target discipline to view how our engine topologically sequences milestones into an actionable track.
              </p>
            </div>
            <div className="text-xs font-mono text-text-muted bg-surface-100 px-3 py-1.5 rounded-md border border-surface-200 self-start md:self-auto">
              Kahn DAG Order • SVD Scored
            </div>
          </div>

          {/* Goal Selector Tabs */}
          <div className="flex flex-wrap gap-2 pb-2">
            {SAMPLE_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                  selectedGoal.id === goal.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                    : 'bg-surface-50 text-slate-700 border-surface-200 hover:bg-surface-100 hover:border-slate-300'
                }`}
              >
                {goal.title}
              </button>
            ))}
          </div>

          {/* Visual Subway Track Card */}
          <div className="card p-6 bg-surface-50 border border-surface-200 shadow-card space-y-6">
            
            {/* Track Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-200">
              <div>
                <span className="text-[10px] font-mono font-semibold text-brand-700 uppercase">{selectedGoal.category}</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedGoal.title} Track</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-text-muted" /> {selectedGoal.duration} ({selectedGoal.commitment})
                </div>
                <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                  {selectedGoal.gaps} Core Gaps Sequenced
                </span>
              </div>
            </div>

            {/* Subway Milestone Nodes (Infographic) */}
            <div className="relative">
              
              {/* Desktop Horizontal Connecting Rail */}
              <div className="hidden lg:block absolute top-7 left-8 right-8 h-1 bg-slate-200 rounded z-0" />

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative z-10">
                {selectedGoal.nodes.map((node, i) => (
                  <div
                    key={node.step}
                    className="p-4 rounded-xl bg-white border border-surface-200 shadow-subtle flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        node.status === 'Met'
                          ? 'bg-emerald-600 text-white'
                          : node.status === 'Scheduled'
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {node.step}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        node.status === 'Met'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : node.status === 'Scheduled'
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-surface-100 text-text-muted border border-surface-200'
                      }`}>
                        {node.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{node.title}</h4>
                      <p className="text-[11px] text-text-secondary mt-1">{node.hours} hours estimated effort</p>
                    </div>

                    <div className="pt-2 border-t border-surface-200 flex items-center justify-between text-[10px] text-text-muted">
                      <span>Phase {i + 1}</span>
                      <span className="font-semibold text-slate-700">{node.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Action Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary border-t border-surface-200">
              <span className="text-center sm:text-left">
                Every node represents an indexed module verified through interactive knowledge checks.
              </span>
              <Link to="/register" className="btn-primary text-xs flex-shrink-0">
                Generate This Track For You <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── Visual Comparison Infographic: The Learning Paradox ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">The Learning Paradox</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Why Most Online Learners Get Stuck
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            Random video tutorials fail because they lack prerequisite structure and feedback loops.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Left: Traditional Fragmentation */}
          <div className="card p-6 bg-rose-50/30 border border-rose-200/80 space-y-5">
            <div className="flex items-center gap-2 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Traditional Online Learning</h3>
            </div>
            
            <div className="space-y-4">
              {COMPARISON_POINTS.map((pt, i) => (
                <div key={i} className="p-3.5 rounded-lg bg-white border border-rose-100 space-y-1 text-xs">
                  <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px]">{pt.feature}</span>
                  <p className="text-slate-700 leading-relaxed">{pt.traditional}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: PathMind Engineered Architecture */}
          <div className="card p-6 bg-brand-50/30 border border-brand-200/80 space-y-5">
            <div className="flex items-center gap-2 text-brand-700">
              <Brain className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">PathMind Topological Architecture</h3>
            </div>

            <div className="space-y-4">
              {COMPARISON_POINTS.map((pt, i) => (
                <div key={i} className="p-3.5 rounded-lg bg-white border border-brand-100 space-y-1 text-xs shadow-subtle">
                  <span className="font-bold text-brand-700 uppercase tracking-wider text-[10px]">{pt.feature}</span>
                  <p className="text-slate-900 font-medium leading-relaxed">{pt.pathmind}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Key Engine Pillars ──────────────────────────────── */}
      <section className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">Engine Pillars</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Built on Deterministic & Probabilistic ML
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              PathMind pairs rigorous graph math with modern NLP to ensure precision roadmap sequencing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Network,
                title: 'Topological DAG Sort',
                desc: 'Prerequisites modeled as directed acyclic graph dependencies so foundations precede complexity.'
              },
              {
                icon: Cpu,
                title: 'Multi-Factor TF-IDF',
                desc: 'Hybrid matrix scoring balances syllabus semantic relevance with individual gap severity.'
              },
              {
                icon: BarChart3,
                title: 'Bayesian Mastery',
                desc: 'Beta(α,β) distribution modeling gauges actual concept retention instead of naive averages.'
              },
              {
                icon: Layers,
                title: 'Adaptive Calibration',
                desc: 'Automatically injects targeted reinforcement units when evaluation scores drop below baseline.'
              },
            ].map((col) => (
              <div key={col.title} className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <col.icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">{col.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{col.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Ready to Build CTA ──────────────────────────────── */}
      <section className="py-16 bg-white border-b border-surface-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-subtle">
            <Brain className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Build Your Personalized Roadmap
            </h2>
            <p className="text-sm text-text-secondary max-w-lg mx-auto">
              Start with an interactive onboarding session and generate your sequenced curriculum in under two minutes.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/register" className="btn-primary px-7 py-3 text-sm">
              Start Free Onboarding <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer with Developer Attribution ────────────────── */}
      <footer className="mt-auto bg-white py-8 text-xs text-text-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center text-white">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-900">PathMind AI</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>
              Developed by{' '}
              <a
                href="mailto:er.adityasah@gmail.com"
                className="font-semibold text-slate-900 hover:text-brand-600 transition-colors"
              >
                Aditya Sah
              </a>{' '}
              (<a
                href="mailto:er.adityasah@gmail.com"
                className="text-brand-600 hover:underline"
              >
                er.adityasah@gmail.com
              </a>)
            </span>
          </div>

          <div className="flex items-center gap-5 text-text-secondary">
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <a
              href="https://github.com/sah-aditya/PathMind-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
