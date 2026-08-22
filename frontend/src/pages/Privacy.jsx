import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, Shield, CheckCircle } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-surface text-text-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-surface-200 pb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to PathMind
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">PathMind AI</span>
          </div>
        </div>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" /> Privacy Policy
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">How PathMind Handles Your Data</h1>
          <p className="text-text-secondary text-sm mt-2">
            Last updated: August 2026. PathMind AI is committed to transparent, minimal data practices.
          </p>
        </div>

        {/* Content sections */}
        <div className="card space-y-6 text-sm text-text-secondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              When you create an account and use PathMind AI, we store:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700">
              <li><strong>Account Credentials:</strong> Name, email address, and encrypted password hash (bcrypt).</li>
              <li><strong>Learner Profile:</strong> Career goals, self-assessed skill levels, available weekly hours, and learning preferences.</li>
              <li><strong>Roadmap State:</strong> Progress records, completed resources, assessment scores, and adaptive pathway adjustments.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. How AI Models Process Your Data</h2>
            <p>
              PathMind AI uses large language models (Google Gemini) to power interactive onboarding chat, goal extraction, and concept Q&A.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700">
              <li>Your conversational prompts are processed via direct API calls to generate learning recommendations.</li>
              <li>We do not sell, rent, or monetize your inputs or profile data to third-party data brokers.</li>
              <li>You can reset your onboarding conversation history at any time using the <em>Start Over</em> option.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Local Storage and Session Cookies</h2>
            <p>
              We use standard JSON Web Tokens (JWT) stored in your browser's <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">localStorage</code> to maintain authenticated sessions. No invasive tracking cookies are used.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Data Retention & Deletion</h2>
            <p>
              You retain full control over your learning data. If you wish to delete your account and associated roadmap history, your data will be permanently purged from the application database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Contact & Maintainer</h2>
            <p>
              PathMind AI is an open educational project created and maintained by <strong>Aditya Sah</strong>. For questions, data requests, or inquiries, reach out at{' '}
              <a href="mailto:er.adityasah@gmail.com" className="text-brand-600 font-semibold hover:underline">
                er.adityasah@gmail.com
              </a>{' '}
              or via the project's GitHub repository.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
