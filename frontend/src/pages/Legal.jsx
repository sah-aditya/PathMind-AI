import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, FileText, Lock, Scale, ArrowLeft, Sun, Moon } from 'lucide-react'
import useThemeStore from '../store/themeStore'

export default function Legal() {
  const [activeTab, setActiveTab] = useState('terms')
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

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 space-y-8">
        
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Legal, Privacy & Governance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Terms of Service & Privacy Policy
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Effective Date: January 1, 2026 • Version 2.4 (Academic & Enterprise Edition)
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] max-w-2xl mx-auto shadow-sm">
          {[
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock },
            { id: 'ethics', label: 'AI Governance & Ethics', icon: Shield },
            { id: 'academic', label: 'Academic & Data Protection', icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon
            const isCurrent = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Document Content Box */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-8 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          
          {/* TAB 1: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
                <p>
                  By accessing, registering for, or using the PathMind AI platform ("Service", "System"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the platform. These terms apply to all registered learners, academic researchers, evaluators, and system administrators.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Scope of Service & Algorithmic Recommendation</h2>
                <p>
                  PathMind AI provides personalized learning path recommendations utilizing Natural Language Processing (NLP), Directed Acyclic Graph (DAG) topological sequencing, Bloom's Cognitive Taxonomy modeling, and heuristic recommendation scorers. While recommendations are generated using state-of-the-art educational models, curriculum trajectories are advisory in nature and subject to individual learner execution and commitment.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. User Accounts & Security</h2>
                <p>
                  Learners are responsible for maintaining the confidentiality of their credentials and session tokens. Any unauthorized activity conducted under an account must be reported immediately. The system reserves the right to suspend accounts engaged in automated scraping, denial-of-service attempts, or reverse-engineering of algorithmic weights.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Digital Credentialing & Verification</h2>
                <p>
                  Certificates generated upon milestone completion represent automated validation of curriculum progression. Credentials contain a unique cryptographic hash and public verification registry identifier. PathMind AI disclaims liability for unauthorized external representation or commercial warranties regarding employment acquisition.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Data Collection & Processing</h2>
                <p>
                  PathMind AI collects only data strictly necessary for personalized curriculum generation and performance tracking:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Account Profile:</strong> Name, email address, hashed authentication credentials, and role assignments.</li>
                  <li><strong>Learner Feature Vector:</strong> Self-reported experience levels, career objectives, time availability, and modality preferences.</li>
                  <li><strong>Learning Telemetry:</strong> Milestone completion timestamps, assessment check scores, and dynamic adaptation history.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. No Third-Party Commercial Data Brokerage</h2>
                <p>
                  PathMind AI does not sell, rent, or trade learner behavioral records, knowledge tracing matrices, or personal identifiers to third-party advertisers or data brokers. All telemetry is utilized solely to train internal scoring heuristics and improve curriculum coherence.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Storage & Encryption Standards</h2>
                <p>
                  Data is stored in managed PostgreSQL databases with SSL in-transit encryption (TLS 1.3) and AES-256 at-rest encryption. Authentication relies on industry-standard JSON Web Tokens (JWT) signed with secure cryptographic keys.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: AI ETHICS & GOVERNANCE */}
          {activeTab === 'ethics' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Algorithmic Transparency & Explainability</h2>
                <p>
                  Consistent with recommendations from educational AI literature (e.g., Li et al., 2026; Phong et al., 2024), PathMind AI rejects "black-box" decision making. Every recommended curriculum unit provides an explicit "Why Recommended?" breakdown detailing:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Prerequisite Fulfillment:</strong> Verification that necessary foundational knowledge has been acquired.</li>
                  <li><strong>Target Gap Closure:</strong> The specific competencies addressed by the unit.</li>
                  <li><strong>Bloom's Cognitive Tier:</strong> The level of cognitive complexity (Remember, Understand, Apply, Analyze, Evaluate, Create).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Bias Mitigation & Educational Equity</h2>
                <p>
                  The recommendation engine incorporates strict candidate-space filtering and goal-skill overlap constraints to prevent demographic or historical interaction biases from skewing path difficulty or pigeonholing learners into restrictive tracks.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Closed-Loop Adaptive Fairness</h2>
                <p>
                  When assessment scores trigger adaptive remediation ($S &lt; 0.60$), the system inserts targeted review modules to ensure concept mastery before advancing, preventing cumulative knowledge deficits.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMIC INTEGRITY & PROTECTION */}
          {activeTab === 'academic' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Research & Open Citation Compliance</h2>
                <p>
                  PathMind AI incorporates theoretical frameworks from established peer-reviewed academic literature:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>
                    <strong>Bloom's Cognitive Taxonomy Progression:</strong> Based on <em>"Personalized Learning Path Recommendation Based on Knowledge Graphs: A Survey"</em>, MDPI Electronics, Vol. 15, 2026.
                  </li>
                  <li>
                    <strong>KSA (Knowledge-Skill-Attitude) Framework & Hybrid Filtering:</strong> Based on <em>"Personalized learning paths recommendation system with collaborative filtering and content-based approaches"</em>, Science & Technology Development Journal, Vol. 8, 2024.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Institutional Deployment Rights</h2>
                <p>
                  Universities, corporate learning divisions, and educational institutions are permitted to deploy PathMind AI for non-commercial student support, academic curriculum planning, and research evaluation.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Contact for Legal & Compliance Enquiries</h2>
                <p>
                  For formal enquiries regarding data protection, governance audits, or institutional compliance, contact: <span className="font-mono text-indigo-600 dark:text-indigo-400">compliance@pathmind.ai</span>.
                </p>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 text-xs text-center text-slate-500 dark:text-zinc-500 border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
        <p>PathMind AI Systems. All rights reserved. Built for academic and professional excellence.</p>
      </footer>

    </div>
  )
}
