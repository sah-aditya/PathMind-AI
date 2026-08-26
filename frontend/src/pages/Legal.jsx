import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Shield, FileText, Lock, Scale, ArrowLeft, Sun, Moon } from 'lucide-react'
import useThemeStore from '../store/themeStore'

export default function Legal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'terms')
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (tabParam && ['terms', 'privacy', 'ethics', 'citations'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-8">
        
        <div className="space-y-3 text-center max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Regulatory Compliance & Governance Registry
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Master Terms of Service & Privacy Governance
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Document Reference: LEG-2026-V4.2 • Effective Date: January 1, 2026 • Jurisdiction: Republic of India & Global Academic Standards
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] max-w-3xl mx-auto shadow-sm">
          {[
            { id: 'terms', label: '1. Terms of Service', icon: FileText },
            { id: 'privacy', label: '2. Privacy & Data Protection', icon: Lock },
            { id: 'ethics', label: '3. AI Ethics & Model Governance', icon: Shield },
            { id: 'citations', label: '4. Research & Academic Citations', icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon
            const isCurrent = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-card space-y-10 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          
          {/* TAB 1: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Preamble & Binding Agreement</h2>
                <p>
                  These Terms of Service ("Terms", "Agreement") constitute a legally binding agreement between you ("Learner", "User", "Institution") and PathMind AI ("Platform", "We", "Us"). By accessing the website, utilizing the conversational onboarding studio, querying the Directed Acyclic Graph (DAG) sequencing engine, or generating digital completion credentials, you acknowledge that you have read, understood, and agreed to be bound by all provisions set forth herein. If you are entering into this Agreement on behalf of a university, faculty department, or educational institution, you represent that you possess the requisite authority to bind such entity.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Description of Algorithmic Service & Advisory Disclaimer</h2>
                <p>
                  PathMind AI provides automated, algorithmic curriculum planning and skill gap analysis. The Platform models educational competencies into mathematical graphs and generates phased learning paths via Kahn’s Topological Sort, Bloom’s Cognitive Taxonomy progression, and hybrid recommendation heuristics. 
                </p>
                <p className="mt-2 text-xs font-mono text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-white/[0.06]">
                  DISCLAIMER: All generated roadmaps, estimated completion hours, match percentages, and milestone prerequisites are advisory computational heuristics. PathMind AI does not guarantee academic credit transfer, university degree equivalency, or employment recruitment outcomes. The platform functions as an intelligent accelerator for structured learning.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. User Authentication, Security & Integrity</h2>
                <p>
                  Users must maintain the confidentiality of their authentication credentials, including JSON Web Tokens (JWT) and passwords. Users agree not to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Engage in automated scraping, denial-of-service (DoS) attempts, or vulnerability penetration testing against API endpoints without prior authorization.</li>
                  <li>Circumvent or manipulate assessment checks, automated grading scripts, or knowledge tracing algorithms.</li>
                  <li>Falsify digital completion certificates, SHA-256 verification hashes, or public QR records.</li>
                  <li>Share administrative credentials or bypass Role-Based Access Controls (RBAC).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Intellectual Property & Open Licensing</h2>
                <p>
                  The core source code, proprietary graph sequencing algorithms, Bloom taxonomy classification models, user interface tokens, and platform documentation are protected by intellectual property laws. Unless otherwise specified under an open-source license, unauthorized redistribution, commercial white-labeling, or deceptive duplication of the PathMind AI system is strictly prohibited.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">5. Cryptographic Certificate Verification</h2>
                <p>
                  Certificates generated upon milestone completion reflect verified progress in the platform database. Each certificate is assigned a unique cryptographic verification identifier and timestamp. PathMind AI maintains a public registry at <span className="font-mono text-indigo-600 dark:text-indigo-400">/verify/:code</span> to permit third-party verification of student achievement without compromising personally identifiable data.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by applicable law, PathMind AI, its contributors, and developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of anticipated career advancement, or interruptions in cloud platform availability.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">7. Governing Law & Dispute Resolution</h2>
                <p>
                  This Agreement shall be governed by and construed in accordance with the laws of the Republic of India. Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the competent courts in New Delhi / Bengaluru, India.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & DATA PROTECTION */}
          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Data Privacy Philosophy</h2>
                <p>
                  PathMind AI is architected around principles of Data Minimization, Storage Limitation, and User Autonomy. We collect only the telemetry strictly essential to power personalized recommendations and preserve longitudinal learning states.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Taxonomy of Collected Information</h2>
                <div className="grid sm:grid-cols-2 gap-4 mt-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/[0.06] space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase font-mono">Explicit Account Data</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">Name, verified email address, bcrypt-hashed passwords, and user role identifiers.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/[0.06] space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase font-mono">Learner Feature Vector</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">Self-reported skill proficiencies, target career ambitions, weekly study availability, and format preferences.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/[0.06] space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase font-mono">Learning Telemetry</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">Milestone completion states, assessment check scores, revision triggers, and study streaks.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/[0.06] space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase font-mono">System Audit Logs</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">Diagnostic API latency timestamps, error codes, and superadmin configuration updates.</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Prohibition of Third-Party Commercial Exploitation</h2>
                <p>
                  PathMind AI maintains a strict zero-monetization policy regarding learner telemetry. We do not sell, rent, license, or transfer student behavioral records, assessment scores, or cognitive profiles to third-party advertisers, data aggregators, or marketing networks.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Cryptographic Security & Infrastructure Safeguards</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>In-Transit Encryption:</strong> All client-server communications are enforced via HTTPS with TLS 1.3 cryptographic ciphers.</li>
                  <li><strong>At-Rest Encryption:</strong> PostgreSQL databases on Supabase utilize AES-256 block-level encryption.</li>
                  <li><strong>Token Architecture:</strong> Stateless authentication using HMAC-SHA256 signed JSON Web Tokens with strict time-to-live expiration.</li>
                  <li><strong>Password Storage:</strong> Cryptographic password hashing utilizing adaptive bcrypt salting with cost factor 12.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">5. User Data Rights & GDPR/DPDP Alignment</h2>
                <p>
                  Learners retain the right to request a full export of their learning history, recalibrate their skill profile, or request complete account deletion by contacting the compliance desk at <span className="font-mono text-indigo-600 dark:text-indigo-400">privacy@pathmind.ai</span>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: AI ETHICS & MODEL GOVERNANCE */}
          {activeTab === 'ethics' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Explainable AI (XAI) & Anti-Black-Box Architecture</h2>
                <p>
                  In compliance with UNESCO and IEEE guidelines on Artificial Intelligence in Education, PathMind AI rejects opaque, uninterpretable decision systems. Every single course, project, and milestone recommended to a student exposes a verifiable explainability payload:
                </p>
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-2 font-mono text-xs">
                  <p><strong className="text-indigo-600 dark:text-indigo-400">1. Prerequisite Proof:</strong> Exact validation that preceding DAG nodes have been completed.</p>
                  <p><strong className="text-indigo-600 dark:text-indigo-400">2. Competency Gap Impact:</strong> Explicit delta measurement against target job benchmarks.</p>
                  <p><strong className="text-indigo-600 dark:text-indigo-400">3. Bloom Cognitive Classification:</strong> Pedagogical alignment to cognitive levels g1 through g6.</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Candidate Space Pruning & Bias Mitigation</h2>
                <p>
                  Conventional collaborative filtering algorithms frequently amplify historical popularity biases, systematically locking non-traditional learners out of advanced content. PathMind AI enforces strict candidate-space filtering:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Zero-score thresholding for resources lacking direct semantic overlap with target skills.</li>
                  <li>Decoupled difficulty grading that evaluates prerequisite readiness rather than user demographic proxies.</li>
                  <li>Balanced exploration-exploitation trade-offs to prevent filter-bubble homogenization.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Closed-Loop Adaptive Remediation (GOLPR + LILPR)</h2>
                <p>
                  When assessment scores indicate incomplete mastery (Score under 60%), the adaptive engine prevents compounding learning deficits by injecting targeted remediation units rather than penalizing the student standing.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: RESEARCH & CITATIONS */}
          {activeTab === 'citations' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Research Citations & Scientific Integrity</h2>
                <p>
                  PathMind AI is built upon validated methodologies from peer-reviewed literature in educational psychology and recommender systems. We formally cite and attribute the following foundational papers:
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    MDPI Electronics 2026 Survey
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Personalized Learning Path Recommendation Based on Knowledge Graphs: A Survey
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Authors: Aili Li, Yong Li, Xiyu Gao (2026). Published in <em>Electronics</em>, 15(1), 238. DOI: 10.3390/electronics15010238.
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    <strong>Utilized Concepts:</strong> Bloom 6-tier Cognitive Progression (g1: Remember to g6: Create), Closed-Loop Hybrid Planning (GOLPR + LILPR), and Explainability Similarity Metrics.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                    STDJ Economics, Law & Management 2024
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Personalized Learning Paths Recommendation System with Collaborative Filtering and Content-Based Approaches
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Authors: Tran Duong Thanh Phong, Vu Bao Khang, Doan Nhat Minh, Dang Truc Quynh, Dang Viet Quang, Ho Trung Thanh (2024). Published in <em>Science & Technology Development Journal</em>, 8(2), 5243-5253. DOI: 10.32508/stdjelm.v8i2.1370.
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    <strong>Utilized Concepts:</strong> Knowledge-Skill-Attitude (KSA) competency decomposition, hybrid content-based (high recall) and collaborative filtering (high precision) cosine scoring formulas.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Institutional MOUs & Accreditation</h2>
                <p>
                  Universities, polytechnics, and corporate training divisions may integrate PathMind AI via custom API endpoints under formal academic Memorandums of Understanding (MOUs). For partnership requests, contact: <span className="font-mono text-indigo-600 dark:text-indigo-400">partnerships@pathmind.ai</span>.
                </p>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 text-xs text-center text-slate-500 dark:text-zinc-500 border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
        <p>PathMind AI Systems. All rights reserved. Built for academic, industrial, and ethical excellence.</p>
      </footer>

    </div>
  )
}
