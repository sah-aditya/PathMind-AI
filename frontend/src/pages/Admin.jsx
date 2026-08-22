import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api'
import {
  Shield, Users, Activity, Bell, Wrench, KeyRound,
  Trash2, Search, CheckCircle, Eye, EyeOff, Copy, Check,
  AlertTriangle, RefreshCw, X, Megaphone, Send,
  Cpu, Database, Lock, Sparkles, Server, CheckSquare
} from 'lucide-react'
import useAuthStore from '../store/authStore'

// 6 Selectable Professional Maintenance Modes (Short, Professional, No Emojis)
export const MAINTENANCE_MODES = [
  {
    id: 'scheduled',
    title: 'Scheduled System Maintenance',
    tag: 'Standard Upgrade',
    icon: Wrench,
    description: 'PathMind AI is currently undergoing scheduled system maintenance to enhance platform reliability. Please check back shortly.',
  },
  {
    id: 'ai-engine',
    title: 'AI Recommendation Engine Upgrade',
    tag: 'Model Optimization',
    icon: Cpu,
    description: 'We are deploying updates to the core curriculum and recommendation algorithms. Service will resume shortly.',
  },
  {
    id: 'database',
    title: 'Database Performance Optimization',
    tag: 'Data Infrastructure',
    icon: Database,
    description: 'Routine database indexing and infrastructure optimization in progress. All learning records remain secure.',
  },
  {
    id: 'security',
    title: 'Platform Security & Infrastructure Updates',
    tag: 'Security Patching',
    icon: Lock,
    description: 'Applying critical infrastructure and security updates to protect learner data and improve system availability.',
  },
  {
    id: 'curriculum',
    title: 'Major Feature & Curriculum Deployment',
    tag: 'Feature Release',
    icon: Sparkles,
    description: 'New career tracks and curriculum updates are currently being deployed to the platform. We will be back online soon.',
  },
  {
    id: 'diagnostic',
    title: 'Server Diagnostic & Network Maintenance',
    tag: 'Infrastructure Health',
    icon: Server,
    description: 'Conducting temporary server diagnostics and network health checks. Full access will be restored momentarily.',
  },
]

export default function Admin() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  
  // Password Visibility state per user { [userId]: boolean }
  const [revealedPasswords, setRevealedPasswords] = useState({})
  const [copiedUserId, setCopiedUserId] = useState(null)

  // Password Reset Modal state
  const [selectedUserForPwd, setSelectedUserForPwd] = useState(null)
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('')

  // Maintenance Selection Modal state
  const [maintModalOpen, setMaintModalOpen] = useState(false)
  const [selectedMaintMode, setSelectedMaintMode] = useState(MAINTENANCE_MODES[0].id)
  const [customMaintText, setCustomMaintText] = useState('')

  // New Announcement form state
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMsg, setNotifMsg] = useState('')
  const [notifType, setNotifType] = useState('info')
  const [notifSuccessMsg, setNotifSuccessMsg] = useState('')

  // 1. Fetch Stats
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats().then(r => r.data),
    refetchInterval: 15000,
  })

  // 2. Fetch Users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers().then(r => r.data),
  })

  // 3. Fetch Settings
  const { data: settings } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: () => adminApi.getSettings().then(r => r.data),
  })

  // 4. Fetch Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: () => adminApi.getNotifications().then(r => r.data),
  })

  // Mutations
  const maintenanceMutation = useMutation({
    mutationFn: ({ enabled, message }) => adminApi.toggleMaintenance(enabled, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setMaintModalOpen(false)
    },
  })

  const updatePasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }) => adminApi.updatePassword(userId, newPassword),
    onSuccess: (res) => {
      setPwdSuccessMsg(res.data.message)
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setTimeout(() => {
        setSelectedUserForPwd(null)
        setNewPasswordInput('')
        setPwdSuccessMsg('')
      }, 1500)
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminApi.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (userId) => adminApi.toggleStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
  })

  const createNotifMutation = useMutation({
    mutationFn: (data) => adminApi.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setNotifTitle('')
      setNotifMsg('')
      setNotifSuccessMsg('Announcement broadcasted successfully.')
      setTimeout(() => setNotifSuccessMsg(''), 3000)
    },
  })

  const deleteNotifMutation = useMutation({
    mutationFn: (id) => adminApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
  })

  const togglePasswordVisibility = (userId) => {
    setRevealedPasswords(prev => ({ ...prev, [userId]: !prev[userId] }))
  }

  const copyToClipboard = (text, userId) => {
    navigator.clipboard.writeText(text)
    setCopiedUserId(userId)
    setTimeout(() => setCopiedUserId(null), 2000)
  }

  // Handle Maintenance Toggle Click
  const handleMaintenanceToggle = () => {
    if (settings?.maintenance_mode) {
      // Currently ON -> Turn OFF immediately
      maintenanceMutation.mutate({
        enabled: false,
        message: settings?.maintenance_message,
      })
    } else {
      // Currently OFF -> Prompt to select 1 of 6 professional modes
      setMaintModalOpen(true)
    }
  }

  // Confirm and activate selected maintenance mode
  const handleConfirmMaintenanceMode = () => {
    const chosenMode = MAINTENANCE_MODES.find(m => m.id === selectedMaintMode)
    const finalMessage = customMaintText.trim() || chosenMode?.description || MAINTENANCE_MODES[0].description
    
    maintenanceMutation.mutate({
      enabled: true,
      message: finalMessage,
    })
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.goal_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const activeLearnersCount = users.filter(u => u.is_active).length

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-6 space-y-8">

      {/* ── Page Title Header ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-darkBg-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" /> Superadmin Command Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Control & User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <span className="font-semibold text-brand-600 dark:text-brand-400">{user?.email}</span> • Built with ❤️ in Bharat 🇮🇳
          </p>
        </div>

        <button
          onClick={() => {
            queryClient.invalidateQueries()
          }}
          className="btn-secondary self-start sm:self-auto rounded-2xl text-xs py-2 px-3.5 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* ── Top Metric Tiles ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Users */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-subtle">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {stats?.total_users ?? '…'}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {activeLearnersCount} active accounts
            </p>
          </div>
        </div>

        {/* Active Paths */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Active Roadmaps</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-subtle">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {stats?.active_paths ?? '…'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Topological DAGs running
            </p>
          </div>
        </div>

        {/* Announcements */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Announcements</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-subtle">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {stats?.total_notifications ?? '…'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Global broadcast messages
            </p>
          </div>
        </div>

        {/* Maintenance Status */}
        <div className={`p-5 rounded-3xl border shadow-card flex flex-col justify-between h-32 transition-colors ${
          settings?.maintenance_mode
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
            : 'bg-white dark:bg-darkBg-card border-slate-200/80 dark:border-darkBg-border'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">System Mode</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              settings?.maintenance_mode ? 'bg-amber-500 text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
            }`}>
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${settings?.maintenance_mode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {settings?.maintenance_mode ? 'Maintenance Active' : 'All Systems Live'}
            </p>
          </div>
        </div>

      </div>

      {/* ── Global Maintenance Mode Lockdown Card ──────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Global Maintenance Mode Lockdown</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Select from 6 professional maintenance presets to display to visitors. Superadmins retain full access to this portal.
            </p>
          </div>

          {/* Maintenance Switch & Change Button */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {settings?.maintenance_mode && (
              <button
                onClick={() => setMaintModalOpen(true)}
                className="btn-secondary text-xs px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
              >
                Change Mode
              </button>
            )}

            <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">
              {settings?.maintenance_mode ? 'ON' : 'OFF'}
            </span>

            <button
              onClick={handleMaintenanceToggle}
              disabled={maintenanceMutation.isPending}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                settings?.maintenance_mode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-darkBg-cardSub'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                  settings?.maintenance_mode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Active notice display */}
        {settings?.maintenance_mode && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Active Maintenance Announcement Broadcasted to Users:</p>
              <p className="mt-0.5 leading-relaxed font-mono text-[11px] text-amber-800 dark:text-amber-300">
                "{settings?.maintenance_message}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── User Management Section ──────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registered Users & Passwords</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View registered credentials, reveal user passwords, update credentials, or suspend accounts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, email, goal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56 pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex rounded-2xl border border-slate-200 dark:border-darkBg-border p-1 bg-slate-100 dark:bg-darkBg-canvas text-xs font-semibold">
              {['ALL', 'user', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-xl transition-colors capitalize ${
                    roleFilter === r
                      ? 'bg-white dark:bg-darkBg-card text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-darkBg-cardSub/60 border-b border-slate-200/80 dark:border-darkBg-border text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Password</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Career Goal</th>
                  <th className="px-5 py-3.5">Progress</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBg-border">
                {usersLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">Loading user directory…</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">No users found matching query.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSuperadmin = u.email === 'er.adityasah@gmail.com'
                    const progressPct = Math.round((u.overall_progress || 0) * 100)
                    const isRevealed = revealedPasswords[u.id]

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-darkBg-cardSub/40 transition-colors">
                        
                        {/* User Profile */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                              u.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                            }`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Password Column with Reveal Toggle */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-darkBg-cardSub px-2 py-1 rounded-lg">
                              {isRevealed ? u.raw_password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title={isRevealed ? "Hide Password" : "Show Password"}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            {isRevealed && u.raw_password !== '—' && (
                              <button
                                onClick={() => copyToClipboard(u.raw_password, u.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-brand-600"
                                title="Copy Password"
                              >
                                {copiedUserId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <select
                            value={u.role}
                            disabled={isSuperadmin}
                            onChange={(e) => updateRoleMutation.mutate({ userId: u.id, role: e.target.value })}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono border focus:outline-none transition-colors ${
                              u.role === 'admin'
                                ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-darkBg-cardSub border-slate-200 dark:border-darkBg-border text-slate-700 dark:text-slate-300'
                            } ${isSuperadmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          >
                            <option value="user" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">User</option>
                            <option value="admin" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white">Admin</option>
                          </select>
                        </td>

                        {/* Status (Active / Suspended) */}
                        <td className="px-5 py-4">
                          <button
                            disabled={isSuperadmin}
                            onClick={() => toggleStatusMutation.mutate(u.id)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 border transition-colors ${
                              u.is_active
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                            }`}
                            title={isSuperadmin ? "Superadmin is always active" : (u.is_active ? "Click to suspend account" : "Click to activate account")}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {u.is_active ? 'Active' : 'Suspended'}
                          </button>
                        </td>

                        {/* Goal */}
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{u.goal_title}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{u.experience_level} • {u.skills_count} skills</p>
                        </td>

                        {/* Progress */}
                        <td className="px-5 py-4">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              <span>{progressPct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-darkBg-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-600 dark:bg-brand-500 rounded-full"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            
                            {/* Reset Password Button */}
                            <button
                              onClick={() => {
                                setSelectedUserForPwd(u)
                                setNewPasswordInput('')
                                setPwdSuccessMsg('')
                              }}
                              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub hover:text-brand-600 border border-slate-200 dark:border-darkBg-border transition-colors"
                              title="Update Password Manually"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete User */}
                            {!isSuperadmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to permanently delete user "${u.email}"?`)) {
                                    deleteUserMutation.mutate(u.id)
                                  }
                                }}
                                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Broadcast Announcements Section ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Broadcast Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Broadcast Announcement</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Send a global alert that immediately renders in all learners' notification bells.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!notifTitle.trim() || !notifMsg.trim()) return
              createNotifMutation.mutate({
                title: notifTitle.trim(),
                message: notifMsg.trim(),
                type: notifType,
              })
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Announcement Title
              </label>
              <input
                type="text"
                placeholder="e.g. New Distributed Systems Track Available"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Notification Type
              </label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="info" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white py-1">Information (Blue)</option>
                <option value="success" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white py-1">Success (Green)</option>
                <option value="warning" className="bg-white dark:bg-darkBg-card text-slate-900 dark:text-white py-1">Alert (Yellow)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Announcement Message
              </label>
              <textarea
                rows="3"
                placeholder="Write your announcement details..."
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {notifSuccessMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{notifSuccessMsg}</p>
            )}

            <button
              type="submit"
              disabled={createNotifMutation.isPending}
              className="btn-primary w-full py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Send Broadcast
            </button>
          </form>
        </div>

        {/* Existing Announcements List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Broadcast History</h3>
          
          <div className="divide-y divide-slate-100 dark:divide-darkBg-border max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active broadcasts published.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        n.type === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : n.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {n.type}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{n.message}</p>
                    <p className="text-[10px] text-slate-400">
                      By {n.created_by} • {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteNotifMutation.mutate(n.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── 6 Selectable Professional Maintenance Modes Modal ── */}
      {maintModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-4">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <Wrench className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    Select Maintenance Mode Message
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose one of 6 professional, emoji-free announcements for the website
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMaintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 6 Selectable Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MAINTENANCE_MODES.map((mode) => {
                const isSelected = selectedMaintMode === mode.id
                const IconComponent = mode.icon

                return (
                  <div
                    key={mode.id}
                    onClick={() => {
                      setSelectedMaintMode(mode.id)
                      setCustomMaintText(mode.description)
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40'
                        : 'bg-slate-50 dark:bg-darkBg-cardSub/60 border-slate-200 dark:border-darkBg-border hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-darkBg-border text-slate-600 dark:text-slate-400'
                        }`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{mode.title}</span>
                      </div>
                      {isSelected && (
                        <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{mode.description}"
                    </p>

                    <div className="pt-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500">
                        {mode.tag}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Custom Edit Box */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-darkBg-border">
              <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Selected Message Preview (or Customize):
              </label>
              <textarea
                rows="2"
                value={customMaintText || (MAINTENANCE_MODES.find(m => m.id === selectedMaintMode)?.description || '')}
                onChange={(e) => setCustomMaintText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMaintModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMaintenanceMode}
                disabled={maintenanceMutation.isPending}
                className="btn-primary text-xs px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 text-white font-semibold"
              >
                {maintenanceMutation.isPending ? 'Activating…' : 'Activate Maintenance Mode'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Password Reset Modal ─────────────────────── */}
      {selectedUserForPwd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Update Password Manually</h3>
              </div>
              <button
                onClick={() => setSelectedUserForPwd(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setting a new password for <strong>{selectedUserForPwd.email}</strong>.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (newPasswordInput.length < 6) return
                updatePasswordMutation.mutate({
                  userId: selectedUserForPwd.id,
                  newPassword: newPasswordInput,
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">New Password</label>
                <input
                  type="text"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {pwdSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {pwdSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPwd(null)}
                  className="btn-secondary text-xs px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="btn-primary text-xs px-4 py-2 rounded-xl"
                >
                  Save New Password
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
