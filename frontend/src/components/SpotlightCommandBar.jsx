import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, Target, Compass, Award,
  User, LifeBuoy, Shield, Moon, Sun, MessageCircle,
  RotateCcw, Sparkles, ArrowRight, CornerDownLeft, X,
  BookOpen, Terminal, CheckSquare, Zap, ExternalLink, GitBranch
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

export default function SpotlightCommandBar({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // All actionable items
  const allCommands = useMemo(() => {
    const items = [
      // Navigation
      {
        id: 'nav-dashboard',
        category: 'Navigation',
        title: 'Main Dashboard',
        desc: 'Overview of daily goals, roadmap progress, and next lessons',
        icon: LayoutDashboard,
        badge: 'G D',
        action: () => { navigate('/dashboard'); onClose(); }
      },
      {
        id: 'nav-roadmap',
        category: 'Navigation',
        title: 'Curriculum Roadmap',
        desc: 'Explore your multi-phase weekly curriculum roadmap',
        icon: Compass,
        badge: 'G R',
        action: () => { navigate('/roadmap'); onClose(); }
      },
      {
        id: 'nav-skill-tree',
        category: 'Navigation',
        title: 'Prerequisite Skill Tree (DAG Graph)',
        desc: 'Visual node graph displaying mastered competencies & prerequisite topology',
        icon: GitBranch,
        badge: 'G T',
        action: () => { navigate('/skill-tree'); onClose(); }
      },
      {
        id: 'nav-skill-gap',
        category: 'Navigation',
        title: 'Skill Gap Matrix',
        desc: 'Review target competencies, radar charts, and assessments',
        icon: Target,
        badge: 'G S',
        action: () => { navigate('/skill-gap'); onClose(); }
      },
      {
        id: 'nav-certificates',
        category: 'Navigation',
        title: 'Verified Certificates',
        desc: 'View, download, and share your earned course credentials',
        icon: Award,
        badge: 'G C',
        action: () => { navigate('/certificates'); onClose(); }
      },
      {
        id: 'nav-profile',
        category: 'Navigation',
        title: 'Learner Hub & Profile',
        desc: 'Manage study pacing, cognitive preferences, and profile identity',
        icon: User,
        badge: 'G P',
        action: () => { navigate('/profile'); onClose(); }
      },
      {
        id: 'nav-help',
        category: 'Navigation',
        title: 'Help & Support Desk',
        desc: 'File queries, track ticket resolutions, and FAQs',
        icon: LifeBuoy,
        badge: 'G H',
        action: () => { navigate('/help'); onClose(); }
      },

      // Quick Actions
      {
        id: 'action-chat',
        category: 'Quick Actions',
        title: 'Open AI Advisor Chatbot',
        desc: 'Ask your personalized AI mentor anything about your curriculum',
        icon: MessageCircle,
        badge: 'Ctrl + /',
        action: () => {
          onClose()
          window.dispatchEvent(new CustomEvent('open-advisor-chat'))
        }
      },
      {
        id: 'action-theme',
        category: 'Quick Actions',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        desc: 'Toggle platform interface color theme',
        icon: theme === 'dark' ? Sun : Moon,
        badge: 'Theme',
        action: () => { toggleTheme(); onClose(); }
      },
      {
        id: 'action-re-onboard',
        category: 'Quick Actions',
        title: 'Recalibrate Career Goal',
        desc: 'Change your target tech role or start onboarding interview',
        icon: RotateCcw,
        badge: 'Reset',
        action: () => { navigate('/onboarding'); onClose(); }
      },
      {
        id: 'action-speech',
        category: 'Quick Actions',
        title: 'Listen to Daily Overview (Voice Audio)',
        desc: 'Read out your current progress and next learning tasks',
        icon: Sparkles,
        badge: 'Audio TTS',
        action: () => {
          onClose()
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel()
            const text = `Welcome back ${user?.name || 'Learner'}! You are currently on track with your curriculum. Open your roadmap to continue your daily unit.`
            const utter = new SpeechSynthesisUtterance(text)
            utter.rate = 1.0
            window.speechSynthesis.speak(utter)
          }
        }
      },
    ]

    // Admin option
    if (user?.role === 'admin' || user?.role === 'superadmin' || user?.is_superadmin || user?.email?.toLowerCase() === 'er.adityasah@gmail.com') {
      const isHead = Boolean(user?.is_superadmin || user?.role === 'superadmin' || user?.email?.toLowerCase() === 'er.adityasah@gmail.com')
      items.unshift({
        id: 'nav-admin',
        category: 'Administration',
        title: 'Platform Governance & Admin Console',
        desc: 'Manage scholars, service switchboard, and cloud telemetry',
        icon: Shield,
        badge: isHead ? 'Head of Academy' : 'Program Lead',
        action: () => { navigate('/admin'); onClose(); }
      })
    }

    return items
  }, [user, theme, navigate, onClose, toggleTheme])

  // Filter items based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands
    const q = query.toLowerCase()
    return allCommands.filter(
      cmd =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.desc.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    )
  }, [allCommands, query])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. roadmap, theme, certificates)..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching commands or navigation items found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const IconComp = cmd.icon
              const isSelected = idx === selectedIndex

              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-zinc-800/90 text-indigo-950 dark:text-zinc-100 ring-1 ring-indigo-500/20'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                        {cmd.title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-400 truncate">
                        {cmd.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/80 dark:border-white/[0.04]">
                      {cmd.badge}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">↑</kbd> <kbd className="bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">↓</kbd> Navigate</span>
            <span><kbd className="bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">↵</kbd> Select</span>
          </div>
          <span>PathMind Spotlight</span>
        </div>
      </div>
    </div>
  )
}
