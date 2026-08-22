import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, BookOpen, Sun, Moon } from 'lucide-react'
import useThemeStore from '../store/themeStore'

export default function Terms() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-darkBg-canvas text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-darkBg-border pb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to PathMind
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">PathMind AI</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Terms of Service
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Last updated: August 2026. Please review these terms governing use of PathMind AI.
          </p>
        </div>

        {/* Content sections */}
        <div className="card space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PathMind AI, you agree to comply with these terms. If you disagree with any part of these terms, you should discontinue using the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Educational Guidance Disclaimer</h2>
            <p>
              PathMind AI generates roadmaps, curriculum suggestions, and assessment checks based on mathematical recommendation algorithms and AI language models. These materials are provided for personal educational guidance and self-directed study. They do not constitute formal academic certification or professional accredited degrees.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. User Responsibilities</h2>
            <p>
              You agree to use PathMind AI for lawful learning purposes. You are responsible for safeguarding your account credentials and for all activities conducted through your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Third-Party Learning Content</h2>
            <p>
              Roadmaps may reference external courses, documentation, and open learning platforms (such as MDN, freeCodeCamp, official docs, and academy materials). PathMind does not claim ownership of external third-party content and respects all respective authors and trademarks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Service Availability</h2>
            <p>
              PathMind AI is provided on an "as is" and "as available" basis. We continually improve system accuracy and reserve the right to modify or update features to support enhanced learning outcomes.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200/80 dark:border-darkBg-border">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Project Ownership & Contact</h2>
            <p>
              PathMind AI is designed, developed, and maintained by <strong>Aditya Sah</strong>. For inquiries, feedback, or support, please contact{' '}
              <a href="mailto:er.adityasah@gmail.com" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                er.adityasah@gmail.com
              </a>.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
