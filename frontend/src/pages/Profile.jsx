import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi, pathApi, authApi, certificateApi } from '../services/api'
import {
  User, Mail, Shield, Award, Sparkles, Clock, Compass,
  CheckCircle, AlertCircle, Key, Lock, Volume2, Type,
  Flame, TrendingUp, Sliders, ArrowRight, Download,
  RotateCcw, Save, Check, RefreshCw, Eye, EyeOff, BookOpen,
  VolumeX, Headphones, Zap, Radio
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const { theme } = useThemeStore()
  const queryClient = useQueryClient()

  // 1. Fetch Profile Data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['learnerProfile'],
    queryFn: () => profileApi.get().then(r => r.data),
  })

  // 2. Fetch Active Learning Path Data
  const { data: activePath } = useQuery({
    queryKey: ['activeLearningPath'],
    queryFn: () => pathApi.getActive().then(r => r.data),
  })

  // 3. Fetch User Certificates
  const { data: certificates = [] } = useQuery({
    queryKey: ['userCertificates'],
    queryFn: () => certificateApi.myCertificates().then(r => r.data),
  })

  // Local State: Profile Form
  const [nameInput, setNameInput] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(8)
  const [learningStyle, setLearningStyle] = useState('mixed')
  const [cognitiveMode, setCognitiveMode] = useState(() => {
    try { return localStorage.getItem('pathmind_cognitive_mode') || 'analogies' } catch { return 'analogies' }
  })
  const [fontSizePref, setFontSizePref] = useState(() => {
    try { return localStorage.getItem('pathmind_font_size') || 'normal' } catch { return 'normal' }
  })
  const [ttsSpeed, setTtsSpeed] = useState(() => {
    try { return Number(localStorage.getItem('pathmind_tts_speed')) || 1.0 } catch { return 1.0 }
  })
  const [soundFxEnabled, setSoundFxEnabled] = useState(() => {
    try { return localStorage.getItem('pathmind_sound_fx') !== 'false' } catch { return true }
  })

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: 'success' })

  // Toast / Status Message
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    if (user?.name) setNameInput(user.name)
    if (profileData?.profile?.hours_per_week) setWeeklyHours(profileData.profile.hours_per_week)
    if (profileData?.profile?.learning_style) setLearningStyle(profileData.profile.learning_style)
  }, [user, profileData])

  // Mutation: Update Profile & Pace
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      // 1. Update basic profile info
      await profileApi.update({
        hours_per_week: payload.hours_per_week,
        learning_style: payload.learning_style,
      })
      // 2. Recalibrate active path pace
      return pathApi.recalibratePace(payload.hours_per_week)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['learnerProfile'] })
      queryClient.invalidateQueries({ queryKey: ['activeLearningPath'] })
      setStatusMsg(res.data?.message || 'Preferences and roadmap pacing saved successfully!')
      setTimeout(() => setStatusMsg(''), 4000)
    },
    onError: (err) => {
      setStatusMsg(err.response?.data?.detail || 'Failed to update profile.')
      setTimeout(() => setStatusMsg(''), 4000)
    }
  })

  // Mutation: Update Password
  const updatePasswordMutation = useMutation({
    mutationFn: (data) => authApi.updatePassword(data),
    onSuccess: () => {
      setPwdMsg({ text: 'Password updated successfully!', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwdMsg({ text: '', type: 'success' }), 4000)
    },
    onError: (err) => {
      setPwdMsg({ text: err.response?.data?.detail || 'Failed to update password.', type: 'error' })
      setTimeout(() => setPwdMsg({ text: '', type: 'error' }), 4000)
    }
  })

  // Cognitive Mode Selection
  const handleSelectCognitiveMode = (mode) => {
    setCognitiveMode(mode)
    try { localStorage.setItem('pathmind_cognitive_mode', mode) } catch {}
    setStatusMsg(`AI persona tuned to "${mode === 'analogies' ? 'Intuitive Analogies' : mode === 'code_first' ? 'Code-First Concise' : 'Socratic Mentor'}"`)
    setTimeout(() => setStatusMsg(''), 3000)
  }

  // Accessibility Toggles
  const handleSelectFontSize = (size) => {
    setFontSizePref(size)
    try {
      localStorage.setItem('pathmind_font_size', size)
      document.documentElement.dataset.fontSize = size
    } catch {}
  }

  const handleTestTtsVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const text = `This is PathMind AI voice assistant. Text to speech speed is set to ${ttsSpeed}x.`
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = ttsSpeed
      window.speechSynthesis.speak(utter)
    }
  }

  // Export Learning Summary Card
  const handleDownloadSummaryCard = () => {
    const cardData = {
      name: user?.name || 'Learner',
      email: user?.email,
      target_goal: profileData?.profile?.goal_title || activePath?.title || 'Software Engineering',
      progress: `${Math.round((activePath?.overall_progress || 0) * 100)}%`,
      skills: Object.keys(profileData?.skills || {}),
      certificates_earned: certificates.filter(c => c.status === 'approved').map(c => ({
        course: c.path_title,
        credential_id: c.code,
        issued_date: c.approved_at || c.created_at
      })),
      exported_at: new Date().toLocaleDateString(),
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cardData, null, 2))
    const link = document.createElement('a')
    link.setAttribute("href", dataStr)
    link.setAttribute("download", `pathmind_portfolio_${(user?.name || 'learner').toLowerCase().replace(/\s+/g, '_')}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setStatusMsg('Portfolio summary card exported to JSON!')
    setTimeout(() => setStatusMsg(''), 3000)
  }

  const progressPct = Math.round((activePath?.overall_progress || 0) * 100)
  const totalSkillsCount = Object.keys(profileData?.skills || {}).length
  const completedPhases = activePath?.phases?.filter(p => p.status === 'completed')?.length || 0

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-6 animate-fade-in">
      
      {/* ── Global Alert Banner ── */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-card-lg border bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-slide-up text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-indigo text-[10px] font-mono font-bold uppercase tracking-wider">
              Learner Hub
            </span>
            <span className="badge-neutral text-[10px] font-mono capitalize">
              {profileData?.profile?.experience_level || 'Beginner'} Tier
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <User className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Profile & Accessibility Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Customize cognitive AI persona, adjust study pacing, track consistency streak, and manage credentials.
          </p>
        </div>

        <button
          onClick={handleDownloadSummaryCard}
          className="btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-subtle"
          title="Download verified portfolio summary"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Export Portfolio Summary</span>
        </button>
      </div>

      {/* ── Top Overview: Identity & Consistency Heatmap Strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: User Identity */}
        <div className="card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">{user?.name || 'Learner'}</h3>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Target Career Track</span>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {profileData?.profile?.goal_title || activePath?.title || 'Software Engineer'}
            </p>
          </div>
        </div>

        {/* Card 2: Consistency Streak 🔥 */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Learning Streak</span>
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-zinc-100">7</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Days Active 🔥</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Great momentum! You have completed study units 7 days in a row.
          </p>
          <div className="grid grid-cols-7 gap-1 pt-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center">
                <div className="w-full h-4 rounded bg-emerald-500/90 text-white text-[9px] flex items-center justify-center font-bold">✓</div>
                <span className="text-[9px] font-mono text-slate-400">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Curriculum Progress */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Path Completion</span>
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-zinc-100">{progressPct}%</span>
            <span className="text-xs text-slate-500 font-mono">({activePath?.total_weeks || 8} wks timeline)</span>
          </div>
          <div className="progress-bar h-2">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>{totalSkillsCount} Tracked Skills</span>
            <span>{completedPhases} Phases Done</span>
          </div>
        </div>

      </div>

      {/* ── Main Settings Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── SECTION 1: Cognitive AI Persona & Explanation Tuner ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/[0.04] pb-3">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Cognitive AI Persona & Explanation Mode</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Choose how PathMind AI Studio Chatbot and tutorial summaries explain complex concepts to you:
          </p>

          <div className="space-y-2.5">
            {[
              {
                id: 'analogies',
                title: '💡 Intuitive & Analogy-Driven (Recommended)',
                tag: 'Beginner & Visual',
                desc: 'Explains abstract computer science using real-world analogies (cricket, cooking, gaming) and intuitive mental models.',
              },
              {
                id: 'code_first',
                title: '⚡ Code-First & Concise',
                tag: 'Direct & Fast',
                desc: 'Straight to working syntax, time/space complexity analysis, edge cases, and architectural best practices with zero fluff.',
              },
              {
                id: 'socratic',
                title: '🎓 Socratic & Deep Mastery',
                tag: 'Interactive Mentor',
                desc: 'Guides you step-by-step with progressive questions, test cases, and architectural trade-offs to build deep problem-solving skills.',
              },
            ].map(m => (
              <div
                key={m.id}
                onClick={() => handleSelectCognitiveMode(m.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  cognitiveMode === m.id
                    ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-400 dark:border-purple-600 ring-1 ring-purple-500/30'
                    : 'border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-slate-900 dark:text-zinc-100">{m.title}</p>
                  <span className="badge-neutral text-[10px] font-mono">{m.tag}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 2: Dynamic Study Pacing Slider ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/[0.04] pb-3">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Study Commitment & Roadmap Pacing</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Adjust your weekly availability. PathMind AI will dynamically re-budget your roadmap weeks in 1-click without losing completed progress.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-white/[0.04] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Weekly Hours Slider</span>
              <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-zinc-800 border border-indigo-200/60 dark:border-white/[0.08]">
                {weeklyHours} Hours / Week
              </span>
            </div>

            <input
              type="range"
              min="4"
              max="30"
              step="2"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>4 hrs (Relaxed: ~16 wks)</span>
              <span>12 hrs (Standard: ~8 wks)</span>
              <span>30 hrs (Intensive: ~4 wks)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-500">
              Estimated Duration: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{Math.max(4, Math.min(16, Math.round(64 / weeklyHours)))} Weeks</strong>
            </div>
            <button
              onClick={() => updateProfileMutation.mutate({ hours_per_week: weeklyHours, learning_style: learningStyle })}
              disabled={updateProfileMutation.isPending}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-subtle"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updateProfileMutation.isPending ? 'Recalibrating…' : 'Save & Pacing Shift'}</span>
            </button>
          </div>
        </div>

        {/* ── SECTION 3: Accessibility & Reading Ergonomics ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/[0.04] pb-3">
            <Type className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Accessibility & Focus Ergonomics</h3>
          </div>

          {/* Font Resizing */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">Comfortable Reading Text Size</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Default (14px)' },
                { id: 'large', label: 'Large (16px)' },
                { id: 'xlarge', label: 'Comfort (18px)' },
              ].map(sz => (
                <button
                  key={sz.id}
                  onClick={() => handleSelectFontSize(sz.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    fontSizePref === sz.id
                      ? 'bg-sky-50 dark:bg-zinc-800 border-sky-500 dark:border-sky-400 text-sky-900 dark:text-sky-200'
                      : 'border-slate-200/80 dark:border-white/[0.04] text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text-to-Speech (TTS) Voice Reader */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">Text-to-Speech Voice Rate</label>
              <button
                onClick={handleTestTtsVoice}
                className="text-[11px] text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0.8, 1.0, 1.25].map(sp => (
                <button
                  key={sp}
                  onClick={() => {
                    setTtsSpeed(sp)
                    try { localStorage.setItem('pathmind_tts_speed', String(sp)) } catch {}
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-mono font-semibold border transition-all ${
                    ttsSpeed === sp
                      ? 'bg-sky-50 dark:bg-zinc-800 border-sky-500 text-sky-900 dark:text-sky-200'
                      : 'border-slate-200/80 dark:border-white/[0.04] text-slate-600'
                  }`}
                >
                  {sp}x Speed
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 4: Security & Password Manager ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/[0.04] pb-3">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Security & Password Manager</h3>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (newPassword !== confirmPassword) {
                setPwdMsg({ text: 'New passwords do not match.', type: 'error' })
                return
              }
              if (newPassword.length < 6) {
                setPwdMsg({ text: 'Password must be at least 6 characters.', type: 'error' })
                return
              }
              updatePasswordMutation.mutate({
                current_password: currentPassword,
                new_password: newPassword,
              })
            }}
            className="space-y-3"
          >
            <div>
              <label className="input-label">Current Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="input-label">Confirm New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 flex items-center gap-1"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasswords ? 'Hide characters' : 'Show characters'}</span>
              </button>

              <button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="btn-secondary text-xs py-2 px-4 rounded-xl font-bold"
              >
                {updatePasswordMutation.isPending ? 'Updating…' : 'Update Password'}
              </button>
            </div>

            {pwdMsg.text && (
              <p className={`text-xs font-semibold ${pwdMsg.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {pwdMsg.text}
              </p>
            )}
          </form>
        </div>

      </div>

    </div>
  )
}
