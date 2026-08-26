import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, ArrowRight, CheckCircle, Clock,
  Cpu, Compass, ShieldCheck, Sun, Moon,
  Terminal, Sparkles, Database, Layers, Plane, Code,
  Network, BookOpen, Target, Scale, Award
} from 'lucide-react'
import useThemeStore from '../store/themeStore'

const GOAL_OPTIONS = [
  {
    id: 'mle',
    title: 'Machine Learning Engineer',
    category: 'Artificial Intelligence',
    icon: Brain,
    bgLight: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:border-white/[0.08]',
    duration: '14 Weeks',
    commitment: '8h / week',
    summary: 'Master NumPy, Scikit-Learn, Deep Learning, and MLOps deployment.',
    milestones: ['Python & Linear Algebra', 'Feature Engineering & ML', 'Deep Neural Nets', 'Model Deployment']
  },
  {
    id: 'mern',
    title: 'MERN Full-Stack Developer',
    category: 'Software Engineering',
    icon: Code,
    bgLight: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:border-white/[0.08]',
    duration: '12 Weeks',
    commitment: '8h / week',
    summary: 'Master HTML/CSS, React, Node.js, Express, MongoDB, and Production Deployment.',
    milestones: ['Web Foundations (HTML/CSS & Git)', 'JavaScript & React.js', 'Backend Node & Express', 'Databases & Capstone']
  },
  {
    id: 'cloud',
    title: 'Cloud Solutions Architect',
    category: 'Cloud Infrastructure',
    icon: Database,
    bgLight: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:border-white/[0.08]',
    duration: '12 Weeks',
    commitment: '8h / week',
    summary: 'Build scalable APIs, Postgres databases, Docker containers, and CI/CD pipelines.',
    milestones: ['Linux & Networking', 'SQL & Database Design', 'Docker & Kubernetes', 'Cloud Infrastructure']
  },
  {
    id: 'robotics',
    title: 'Autonomous Robotics',
    category: 'Robotics & Embedded Systems',
    icon: Cpu,
    bgLight: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:border-white/[0.08]',
    duration: '16 Weeks',
    commitment: '10h / week',
    summary: 'Bridge C++, ROS2 middleware, SLAM perception, and path planning algorithms.',
    milestones: ['C++ & Linux Systems', 'ROS2 Middleware', 'Computer Vision SLAM', 'Hardware Checkride']
  }
]

export default function Landing() {
  const [activeGoal, setActiveGoal] = useState(GOAL_OPTIONS[0])
  const { theme, toggleTheme } = useThemeStore()

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-indigo-600 selection:text-white transition-colors duration-200">

      {/* Top Header & Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm font-bold">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">PathMind AI</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-zinc-400">
            <button onClick={() => scrollToSection('goals')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Explore Tracks
            </button>
            <button onClick={() => scrollToSection('algorithms')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Algorithms
            </button>
            <button onClick={() => scrollToSection('about')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              About Project
            </button>
            <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Architecture
            </Link>
            <Link to="/legal" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Governance
            </Link>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/[0.08] transition-colors shadow-sm"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <Link to="/login" className="btn-ghost text-xs sm:text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-xs sm:text-sm px-4 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14 text-center space-y-5">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] text-indigo-600 dark:text-indigo-400 text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          AI-Powered Personalized Learning Path Recommender
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Your Career Ambition. <br className="hidden sm:inline" />
          <span className="text-indigo-600 dark:text-indigo-400">Scientifically Sequenced & Adaptive.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          PathMind AI analyzes individual learner profiles, resolves prerequisite dependencies via Directed Acyclic Graphs (DAG), and calibrates structured weekly roadmaps grounded in Bloom's Cognitive Taxonomy and KSA Industry Readiness.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link to="/register" className="btn-primary px-7 py-3 text-sm w-full sm:w-auto">
            Build Your Roadmap Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-sm w-full sm:w-auto">
            Try Demo Account
          </Link>
        </div>

        {/* Technical Validation Trust Row */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Topological DAG Prerequisite Guarantee
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Bloom's Cognitive Taxonomy (g1 to g6)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> KSA Career Readiness Alignment
          </span>
        </div>

      </section>

      {/* Interactive Goal Explorer Section */}
      <section id="goals" className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
        
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Curriculum Explorer</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select a Target Track to Preview</h2>
        </div>

        {/* Touch Action Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {GOAL_OPTIONS.map((g) => {
            const Icon = g.icon
            const isSelected = activeGoal.id === g.id
            return (
              <div
                key={g.id}
                onClick={() => setActiveGoal(g)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-150 bg-white dark:bg-zinc-900 border ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-card'
                    : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${g.bgLight}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">{g.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">{g.duration}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Active Roadmap Visual Preview Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{activeGoal.category}</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{activeGoal.title}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{activeGoal.summary}</p>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {activeGoal.duration} • {activeGoal.commitment}
            </div>
          </div>

          {/* 4-Milestone Phased Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {activeGoal.milestones.map((m, i) => (
              <div
                key={m}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/[0.06] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-zinc-500">Phase 0{i + 1}</span>
                  {i === 0 && <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded">g1: Remember</span>}
                  {i === activeGoal.milestones.length - 1 && <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded">g6: Create</span>}
                </div>
                <p className="font-bold text-slate-900 dark:text-white leading-snug">{m}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-white/[0.06]">
            <span>Topologically sequenced through Kahn's DAG algorithm to eliminate redundant study.</span>
            <Link to="/register" className="btn-primary text-xs flex-shrink-0">
              Start Track <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </section>

      {/* Algorithmic & Scientific Foundations Section */}
      <section id="algorithms" className="bg-white dark:bg-zinc-900 border-y border-slate-200 dark:border-white/[0.08] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Research & Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Five Core Intelligence Engines
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Grounded in empirical pedagogical research and modern recommendation science.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Engine 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold font-mono">
                01
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Conversational NLP Profiling</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Utilizes Google Gemini 1.5 Flash with few-shot instruction tuning to extract structured learner vectors (ability, prior knowledge, time constraints, modality).
              </p>
            </div>

            {/* Engine 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold font-mono">
                02
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Topological DAG Graph Engine</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Constructs Directed Acyclic Graphs over 140+ curriculum units. Executes Kahn's algorithm to ensure strict prerequisite ordering with zero topological inversions.
              </p>
            </div>

            {/* Engine 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold font-mono">
                03
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Bloom's Cognitive Taxonomy</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Adopts the 6-tier educational framework from Li et al. (MDPI Electronics 2026), enforcing cognitive smoothness from Remember (g1) to Create (g6).
              </p>
            </div>

            {/* Engine 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
                04
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">KSA Industry Readiness Model</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Decomposes learning milestones into Knowledge (K), Practical Skill (S), and Professional Attitude (A) based on Phong et al. (STDJ 2024).
              </p>
            </div>

            {/* Engine 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold font-mono">
                05
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Closed-Loop Dynamic Feedback</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Combines Global Optimal Pathing (GOLPR) with Local Iterative Learning (LILPR). Injects adaptive remediation units upon low assessment scores (S &lt; 0.60).
              </p>
            </div>

            {/* Engine 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold font-mono">
                06
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">AI Recommendation Explainability</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Provides transparent justifications for each recommendation, displaying exact skill gap impact, prerequisite proofs, and cognitive alignment.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Engraved About the Project Section */}
      <section id="about" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            About the Project
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Pioneering AI in Higher Education & Career Readiness
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
            <p>
              <strong>PathMind AI</strong> was conceived to address a critical structural failure in digital learning: the disconnect between massive course catalogs and structured career execution. Online learners are routinely overwhelmed by thousands of fragmented tutorials without clear pedagogical progression.
            </p>
            <p>
              By translating curriculum dependencies into a computable mathematical graph and integrating cognitive psychology theories, PathMind AI provides an institutional-grade personalized learning environment. The platform bridges the gap between academic theory and real-world industrial hiring requirements.
            </p>
            <div className="pt-2">
              <Link to="/about" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                Read Full Technical Architecture Document &rarr;
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Target Institutional Outcomes</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Learner Retention:</strong> Reduces MOOC dropout rates by dynamically adjusting pace and injecting remediation when needed.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Industry Alignment:</strong> Maps curriculum units to real-world job roles and KSA competency matrices.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Transparent Governance:</strong> Eliminates black-box algorithms with explainable recommendation rationale.</span>
              </li>
            </ul>
          </div>
        </div>

      </section>

      {/* Professional Comprehensive Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 py-12 text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand */}
            <div className="space-y-3 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">PathMind AI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Adaptive curriculum sequencer and personalized learning path recommender.
              </p>
            </div>

            {/* Col 2: Platform */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">Platform</h4>
              <ul className="space-y-1.5">
                <li><Link to="/roadmap" className="hover:text-slate-900 dark:hover:text-white transition-colors">Phased Roadmaps</Link></li>
                <li><Link to="/skill-tree" className="hover:text-slate-900 dark:hover:text-white transition-colors">Prerequisite Skill Tree</Link></li>
                <li><Link to="/skill-gap" className="hover:text-slate-900 dark:hover:text-white transition-colors">Skill Gap Diagnostics</Link></li>
                <li><Link to="/certificates" className="hover:text-slate-900 dark:hover:text-white transition-colors">Verifiable Credentials</Link></li>
              </ul>
            </div>

            {/* Col 3: Research & Foundations */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">Research Foundations</h4>
              <ul className="space-y-1.5">
                <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">System Architecture</Link></li>
                <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">Bloom's Taxonomy Model</Link></li>
                <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">KSA Career Framework</Link></li>
                <li><a href="https://github.com/sah-aditya/PathMind-AI" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub Repository</a></li>
              </ul>
            </div>

            {/* Col 4: Governance & Legal */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">Governance</h4>
              <ul className="space-y-1.5">
                <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Project</Link></li>
                <li><Link to="/legal" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/legal" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/legal" className="hover:text-slate-900 dark:hover:text-white transition-colors">AI Ethics & Fairness</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 dark:text-zinc-500">
            <p>PathMind AI Systems. All rights reserved.</p>
            <p>Designed and built for national and global academic excellence.</p>
          </div>

        </div>
      </footer>

    </div>
  )
}
