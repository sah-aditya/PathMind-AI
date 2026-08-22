import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, BookOpen } from 'lucide-react'

export default function Terms() {
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
            <BookOpen className="w-3.5 h-3.5" /> Terms of Service
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
          <p className="text-text-secondary text-sm mt-2">
            Last updated: August 2026. Please review these terms governing use of PathMind AI.
          </p>
        </div>

        {/* Content sections */}
        <div className="card space-y-6 text-sm text-text-secondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PathMind AI, you agree to comply with these terms. If you disagree with any part of these terms, you should discontinue using the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Educational Guidance Disclaimer</h2>
            <p>
              PathMind AI generates roadmaps, curriculum suggestions, and assessment checks based on mathematical recommendation algorithms and AI language models. These materials are provided for personal educational guidance and self-directed study. They do not constitute formal academic certification or professional accredited degrees.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. User Responsibilities</h2>
            <p>
              You agree to use PathMind AI for lawful learning purposes. You are responsible for safeguarding your account credentials and for all activities conducted through your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Third-Party Learning Content</h2>
            <p>
              Roadmaps may reference external courses, documentation, and open learning platforms (such as MDN, freeCodeCamp, official docs, and academy materials). PathMind does not claim ownership of external third-party content and respects all respective authors and trademarks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Service Availability</h2>
            <p>
              PathMind AI is provided on an "as is" and "as available" basis. We continually improve system accuracy and reserve the right to modify or update features to support enhanced learning outcomes.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
