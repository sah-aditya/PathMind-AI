import { Link } from 'react-router-dom'
import { Wrench, Shield, Lock, ArrowRight, Sun, Moon } from 'lucide-react'
import useThemeStore from '../store/themeStore'

export default function Maintenance({ message }) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-darkBg-canvas text-slate-900 dark:text-slate-100 flex flex-col justify-between p-6 sm:p-12 transition-colors duration-200">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">PathMind AI</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Center Maintenance Card */}
      <div className="max-w-lg mx-auto w-full text-center space-y-6 my-auto py-8">
        
        {/* Animated Icon Container */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/20 dark:bg-amber-500/10 animate-ping opacity-50" />
          <div className="relative w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
            <Wrench className="w-8 h-8" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            System Maintenance Mode Active
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Platform Maintenance in Progress
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            {message || "PathMind AI is currently undergoing scheduled system maintenance to enhance platform reliability. Please check back shortly."}
          </p>
        </div>

        {/* Estimated Status Box */}
        <div className="p-4 rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-sm text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 max-w-sm mx-auto">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Engineering optimizations in progress • Data secure</span>
        </div>

      </div>

      {/* Bottom Admin Bypass Link */}
      <div className="max-w-5xl mx-auto w-full text-center pt-8 border-t border-slate-200/80 dark:border-darkBg-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <span>Built with ❤️ in Bharat 🇮🇳 • Aditya Sah</span>
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
        >
          <Lock className="w-3.5 h-3.5" /> Admin Portal Access <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  )
}
