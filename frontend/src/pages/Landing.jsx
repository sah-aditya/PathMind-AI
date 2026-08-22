import { Link } from 'react-router-dom'
import {
  Brain, Zap, Target, BarChart3, ArrowRight,
  CheckCircle, GitBranch, Shield, Compass, BookOpen, Layers, Award
} from 'lucide-react'

const capabilities = [
  {
    icon: Compass,
    title: 'Conversational Goal Profiling',
    desc: 'Describe your career aspiration in natural language. PathMind AI evaluates your prior background, available study time, and target proficiency.',
    badge: 'Step 1'
  },
  {
    icon: GitBranch,
    title: 'Prerequisite Graph Sequencing',
    desc: 'Uses Kahn’s topological sort on a directed acyclic graph (DAG) of skill dependencies to ensure foundations are mastered before advanced topics.',
    badge: 'Step 2'
  },
  {
    icon: Zap,
    title: 'Hybrid ML Recommendation',
    desc: 'Combines TF-IDF cosine semantic similarity, collaborative matrix signals, and multi-factor scoring to rank resources with highest gap-closure efficiency.',
    badge: 'Step 3'
  },
  {
    icon: BarChart3,
    title: 'Bayesian Adaptive Updates',
    desc: 'Evaluates concept mastery through interactive knowledge checks, dynamically adjusting upcoming modules when reinforcement is needed.',
    badge: 'Step 4'
  },
]

const algorithms = [
  {
    name: 'Topological DAG Sort',
    category: 'Graph Algorithms',
    desc: 'Sequences prerequisite chains so prerequisite skills strictly precede dependent modules, eliminating knowledge bottlenecks.'
  },
  {
    name: 'TF-IDF Semantic Matching',
    category: 'Information Retrieval',
    desc: 'Vectorizes resource syllabus text and matches against your specific goal description for tight topical alignment.'
  },
  {
    name: 'Bayesian Beta Estimation',
    category: 'Probabilistic Modeling',
    desc: 'Models skill mastery as Beta(α,β) distributions to measure confidence and certainty rather than brittle raw averages.'
  },
  {
    name: 'Multi-Factor Gap Scoring',
    category: 'Hybrid Recommendation',
    desc: 'Evaluates gap coverage (25%), prerequisite readiness (20%), goal relevance (22%), and quality metrics to rank resources.'
  },
  {
    name: 'ε-Greedy Exploration',
    category: 'Bandit Algorithms',
    desc: 'Allocates an exploration budget to introduce high-quality complementary topics and prevent recommendation silos.'
  },
  {
    name: 'Dynamic Curriculum Synthesis',
    category: 'Generative AI',
    desc: 'Generates structured 4-phase curricula for specialized or custom goals beyond static datasets on demand.'
  },
]

export default function Landing() {
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
            <Link to="/login" className="btn-ghost text-xs sm:text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-xs sm:text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-20 sm:pb-18">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              Machine Learning Learning Paths
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Structured Roadmaps Engineered by Machine Learning.
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
              Tell PathMind AI your career goal. Our engine maps your prerequisite graph, identifies skill gaps, and generates an adaptive, week-by-week learning path.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/register" className="btn-primary px-6 py-3 text-sm">
                Generate Your Roadmap <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-sm">
                Sign In to Existing Path
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-3 text-xs text-text-muted">
              <span>Open-source architecture</span>
              <span>•</span>
              <span>No credit card required</span>
              <span>•</span>
              <span>Universal goal synthesis</span>
            </div>
          </div>

          {/* Right Product Pipeline Preview */}
          <div className="lg:col-span-6">
            <div className="card p-5 space-y-4 bg-white border border-surface-200 shadow-card">
              
              {/* Product Header */}
              <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Engine Execution Pipeline</span>
                </div>
                <span className="text-[11px] font-mono text-text-muted">v2.4 Core ML</span>
              </div>

              {/* Step 1: Goal Input */}
              <div className="p-3 bg-surface-100 rounded-lg border border-surface-200 text-xs space-y-1">
                <span className="text-[10px] font-semibold text-brand-700 uppercase tracking-wider">Goal Input</span>
                <p className="font-semibold text-slate-900">"Transition into Machine Learning Engineering with basic Python knowledge"</p>
              </div>

              {/* Step 2: DAG Prerequisite Mapping */}
              <div className="p-3 bg-surface-50 rounded-lg border border-surface-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Topological Dependency Ordering</span>
                  <span className="text-[11px] font-mono text-brand-700 font-semibold">7 Gaps Identified</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">Python Basics (Met)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">NumPy & Math</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">Scikit-Learn</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">Deep Learning</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">MLOps</span>
                </div>
              </div>

              {/* Step 3: Scored Resource Allocation */}
              <div className="p-3 bg-surface-50 rounded-lg border border-surface-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Hybrid Score Breakdown</span>
                  <span className="text-[11px] font-mono text-slate-900 font-semibold">Top Ranked: 94.2%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded border border-surface-200">
                    <p className="text-[11px] text-text-muted">Gap Coverage</p>
                    <p className="font-semibold text-slate-900">0.96 / 1.0</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-surface-200">
                    <p className="text-[11px] text-text-muted">Prereq Readiness</p>
                    <p className="font-semibold text-slate-900">1.00 / 1.0</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-surface-200">
                    <p className="text-[11px] text-text-muted">TF-IDF Match</p>
                    <p className="font-semibold text-slate-900">0.89 / 1.0</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── Technical Metrics Strip ────────────────────────── */}
      <section className="bg-slate-900 text-white border-y border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold tracking-tight text-white font-mono">18+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Built-in Goal Taxonomies</p>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-white font-mono">130+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Indexed Resources</p>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-white font-mono">DAG</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Prerequisite Graph Engine</p>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-white font-mono">100%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Free & Open Platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Four Architecture Pillars ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-14 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Precision Learning
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            PathMind replaces static linear tutorials with an interconnected system of graph algorithms and predictive recommendation scoring.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap) => (
            <div key={cap.title} className="card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
                    <cap.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{cap.badge}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{cap.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Real Algorithm Deep-Dive ────────────────────────── */}
      <section className="bg-white border-y border-surface-200 py-18">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12 space-y-2">
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Mathematical Foundation
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Transparent algorithms powering curriculum sequencing and adaptive updates.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {algorithms.map((algo) => (
              <div key={algo.name} className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-brand-700 uppercase tracking-wider">{algo.category}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{algo.name}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{algo.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ready to Build CTA ──────────────────────────────── */}
      <section className="py-16 bg-surface-50 border-b border-surface-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-subtle">
            <Brain className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Build Your Personalized Roadmap Today
            </h2>
            <p className="text-sm text-text-secondary max-w-lg mx-auto">
              Start with an interactive onboarding session and unlock your sequenced curriculum in under two minutes.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/register" className="btn-primary px-7 py-3 text-sm">
              Start Free Onboarding <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mt-auto bg-white py-8 border-t border-surface-200 text-xs text-text-secondary">
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
