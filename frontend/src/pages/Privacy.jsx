import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, Shield, Sun, Moon } from 'lucide-react'
import useThemeStore from '../store/themeStore'

export default function Privacy() {
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
            <Shield className="w-3.5 h-3.5" /> Privacy Policy
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">How PathMind Handles Your Data</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Last updated: August 2026. PathMind AI is committed to transparent, minimal data practices.
          </p>
        </div>

        {/* Content sections */}
        <div className="card space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
            <p>
              When you create an account and use PathMind AI, we store:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700 dark:text-slate-300">
              <li><strong>Account Credentials:</strong> Name, email address, and encrypted password hash (bcrypt).</li>
              <li><strong>Learner Profile:</strong> Career goals, self-assessed skill levels, available weekly hours, and learning preferences.</li>
              <li><strong>Roadmap State:</strong> Progress records, completed resources, assessment scores, and adaptive pathway adjustments.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. How AI Models Process Your Data</h2>
            <p>
              PathMind AI uses large language models (Google Gemini) to power interactive onboarding chat, goal extraction, and concept Q&A.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700 dark:text-slate-300">
              <li>Your conversational prompts are processed via direct API calls to generate learning recommendations.</li>
              <li>We do not sell, rent, or monetize your inputs or profile data to third-party data brokers.</li>
              <li>You can reset your onboarding conversation history at any time using the <em>Start Over</em> option.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Local Storage and Session Cookies</h2>
            <p>
              We use standard JSON Web Tokens (JWT) stored in your browser's <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-darkBg-cardSub rounded text-xs font-mono">localStorage</code> to maintain authenticated sessions. No invasive tracking cookies are used.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Data Retention & Deletion</h2>
            <p>
              You retain full control over your learning data. If you wish to delete your account and associated roadmap history, your data will be permanently purged from the application database.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200/80 dark:border-darkBg-border">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Developer & Maintainer Contact</h2>
            <p>
              PathMind AI is designed, developed, and maintained by <strong>Aditya Sah</strong>. For questions, data inquiries, or account management, please reach out directly:
            </p>
            <p className="font-mono text-xs text-brand-600 dark:text-brand-400">
              Email: <a href="mailto:er.adityasah@gmail.com" className="underline hover:text-brand-700">er.adityasah@gmail.com</a>
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
