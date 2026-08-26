import { Link } from 'react-router-dom'
import {
  ArrowLeft, Brain, Cpu, Compass, ShieldCheck,
  Database, Layers, ArrowRight, Sun, Moon,
  BookOpen, Target, Network, CheckCircle, BarChart3,
  Award, Zap, Users, GraduationCap, Building2
} from 'lucide-react'
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-16">
        
        {/* Executive Hero */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            About the Project & Technical Overview
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Pioneering Algorithmic Precision in Personalized Education
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed">
            PathMind AI is an intelligent curriculum recommendation engine designed to resolve the digital learning paradox: transitioning students from fragmented, disconnected tutorials into structured, pedagogically sound, and industry-calibrated learning roadmaps.
          </p>
        </div>

        {/* Section 1: The Core Crisis in Digital Education */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Problem Statement</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">The Paradox of Abundance in Modern E-Learning</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
            Over the past decade, Massive Open Online Courses (MOOCs) and open educational repositories have democratized access to technical content. However, the sheer volume of available courses has introduced a severe pedagogical crisis: <strong>curriculum disorientation</strong> and <strong>sequencing paralysis</strong>.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
              <h3 className="font-bold text-rose-900 dark:text-rose-300 text-sm">Absence of Prerequisite Graphing</h3>
              <p className="text-xs text-rose-800/80 dark:text-rose-400/80">
                Traditional platforms treat courses like e-commerce items, recommending complex frameworks (e.g. PyTorch) before foundational prerequisites (Calculus, Linear Algebra) are mastered.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
              <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Static One-Size Syllabi</h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
                Standard courses impose rigid 40-hour schedules that fail to accommodate student velocity, background strengths, or personal time availability (4 to 30 hours per week).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">Zero Adaptive Remediation</h3>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-400/80">
                When learners fail a quiz, traditional platforms passively offer a retry rather than dynamically recalculating dependencies and injecting targeted revision modules.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Mathematical Architecture & Research Models */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Technical Foundation</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Mathematical Architecture & Scientific Rigor</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Synthesizing Graph Theory, Cognitive Psychology, and Modern Recommendation Algorithms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Pillar 1: DAG Sorting */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Directed Acyclic Graph (DAG) Sequencing</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Curriculum units are represented as vertices in a directed graph where edges specify mandatory prerequisite constraints. PathMind AI runs Kahn's algorithm over the in-degree topology:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-white/[0.06]">
                {'In-Degree(v) = count of unresolved prerequisite edges into v'}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Guarantees zero prerequisite inversions and eliminates premature exposure to advanced material.
              </p>
            </div>

            {/* Pillar 2: Bloom's Taxonomy */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bloom's 6-Tier Cognitive Progression</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Adopting the survey framework from Li et al. (<em>MDPI Electronics, 2026</em>), learning units are categorized across six hierarchical cognitive objectives:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-cyan-600 dark:text-cyan-300 border border-slate-200 dark:border-white/[0.06]">
                Phase 1 (g1: Remember, g2: Understand) &rarr; Middle (g3: Apply, g4: Analyze) &rarr; Final (g5: Evaluate, g6: Create)
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Enforces cognitive smoothness so students build foundational intuition before capstone execution.
              </p>
            </div>

            {/* Pillar 3: KSA Framework */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">KSA Industry Career Readiness Model</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Based on research by Phong et al. (<em>STDJ, 2024</em>), PathMind AI assesses candidate competencies across three orthogonal dimensions:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-emerald-600 dark:text-emerald-300 border border-slate-200 dark:border-white/[0.06]">
                {'Readiness = (Weight_K * Knowledge) + (Weight_S * Skill) + (Weight_A * Attitude)'}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Directly aligns student milestones with professional workplace competency standards.
              </p>
            </div>

            {/* Pillar 4: Closed-Loop Dynamic Adaptation */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Closed-Loop Hybrid Adaptation (GOLPR + LILPR)</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Combines Global Optimal Pathing (GOLPR) with Local Iterative Learning (LILPR). When quiz performance drops below 60%:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-purple-600 dark:text-purple-300 border border-slate-200 dark:border-white/[0.06]">
                {'New_Mastery = 0.60 * Old_Mastery + 0.40 * Quiz_Score -> Injects Revision Unit'}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Prevents knowledge debt from propagating through downstream advanced phases.
              </p>
            </div>

          </div>
        </div>

        {/* Section 3: Comparative Advantage Matrix */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Benchmarking</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">PathMind AI vs. Conventional E-Learning Recommenders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-zinc-500 font-mono uppercase">
                  <th className="py-3 px-3">Evaluation Criterion</th>
                  <th className="py-3 px-3">Traditional MOOC Recommenders</th>
                  <th className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">PathMind AI Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-slate-700 dark:text-zinc-300">
                <tr>
                  <td className="py-3 px-3 font-semibold">Sequencing Methodology</td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400">Click similarity & popularity ranking</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Topological DAG sort over knowledge graphs</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold">Cognitive Framework</td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400">None (flat difficulty labels)</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Bloom's 6-Tier Progression (g1 to g6)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold">Explainability (XAI)</td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400">Black-box matrix factorization</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Explicit prerequisite & gap impact proofs</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold">Dynamic Feedback</td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400">Static curriculum track</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Closed-loop GOLPR + LILPR remediation</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold">Industry Alignment</td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400">Academic theory only</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">KSA Industry Readiness Matrix</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Institutional & Stakeholder Impact */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Impact Analysis</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Multi-Stakeholder Institutional Utility</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">For Learners & Students</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Eliminates trial-and-error course selection, provides crystal-clear weekly schedules, and awards cryptographically verifiable milestone credentials.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">For Universities & Faculty</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Provides real-time learning analytics, identifies systemic cohort skill bottlenecks, and enables flipped classroom personalized pathways.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">For Industry & Recruiters</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Validates graduate readiness via KSA metrics and verified portfolio capstones, dramatically reducing onboarding overhead.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Ready to Experience Personalized Learning?</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
            Build your personalized curriculum roadmap today with PathMind AI.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/legal" className="btn-secondary px-6 py-3 rounded-2xl text-sm font-semibold">
              Review Governance & Ethics
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 text-xs text-center text-slate-500 dark:text-zinc-500 border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
        <p>PathMind AI Systems. All rights reserved. Built for academic, industrial, and ethical excellence.</p>
      </footer>

    </div>
  )
}
