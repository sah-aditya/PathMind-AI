import { Link } from 'react-router-dom'
import { ArrowLeft, Brain, Cpu, Compass, ShieldCheck, Database, Layers, ArrowRight, Sun, Moon, BookOpen, Target, Network } from 'lucide-react'
import useThemeStore from '../store/themeStore'

export default function About() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Platform
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/[0.08] transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <Link to="/login" className="btn-primary text-xs sm:text-sm px-4 py-2">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-12">
        
        {/* Hero Banner */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            About the Project
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transforming Lifelong Learning Through Algorithmic Personalization
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed">
            PathMind AI is an intelligent curriculum recommendation engine designed to eliminate curriculum sequencing paralysis, bridge skill gaps, and guide learners from foundational concepts to production-grade mastery.
          </p>
        </div>

        {/* The Problem & Solution Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">The Core Challenge</h2>
            <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              Online education platforms offer millions of courses, yet students frequently struggle to identify the correct sequence of learning units. Standard recommendation algorithms treat courses like standalone retail items, resulting in fragmented learning paths with high attrition rates.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">The PathMind Solution</h2>
            <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              PathMind AI models curriculum competencies as a Directed Acyclic Graph (DAG), ensuring prerequisite integrity through Kahn's topological sorting algorithm while calibrating cognitive milestones according to Bloom's 6-Tier Taxonomy.
            </p>
          </div>
        </div>

        {/* 4 Core Technological Pillars */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Architecture</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Algorithmic & Engineering Pillars</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Gemini 1.5 NLP Engine</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Extracts structured profiles and learning objectives from natural language conversations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Topological DAG Sequencer</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Guarantees zero prerequisite violations by organizing curriculum units into acyclic dependency graphs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Bloom's Cognitive Taxonomy</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Enforces smooth progression from foundational memory (g1) to higher-order creation (g6).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">KSA Industry Readiness</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Aligns learning trajectories with Knowledge, Practical Skill, and Professional Attitude requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Research Lineage Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-4">
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
            Academic Research & Theoretical Foundation
          </h2>
          <p className="text-xs sm:text-sm text-indigo-800/90 dark:text-indigo-300/90 leading-relaxed">
            PathMind AI synthesizes core methodologies from prominent literature, including the survey on knowledge-graph-based learning path recommendations (*MDPI Electronics, 2026*) and hybrid collaborative-content recommender systems (*Science & Technology Development Journal, 2024*).
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/legal" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Read Governance & Citations &rarr;
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Experience Personalized Learning</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
            Build your personalized curriculum roadmap today with PathMind AI.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 text-xs text-center text-slate-500 dark:text-zinc-500 border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
        <p>PathMind AI Systems. All rights reserved. Built for academic and professional excellence.</p>
      </footer>

    </div>
  )
}
