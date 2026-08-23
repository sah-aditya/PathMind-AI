import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api'
import {
  Shield, Users, Activity, Bell, Wrench, KeyRound,
  Trash2, Search, CheckCircle, Eye, EyeOff, Copy, Check,
  AlertTriangle, RefreshCw, X, Megaphone, Send,
  Cpu, Database, Lock, Unlock, Key, Sparkles, Server, CheckSquare,
  Pencil, LifeBuoy, MessageSquare, MessageCircle, CornerDownRight,
  Filter, UserCheck, Inbox, ArrowRight, ShieldAlert,
  ChevronRight, Clock, MapPin, Layers, AlertCircle,
  Download, FileSpreadsheet, FileJson, BarChart3,
  BookOpen, Plus, ExternalLink, Zap, Compass, HelpCircle,
  Award, Flame, TrendingUp, History, Radio, Gauge, Sliders,
  Rocket, UserPlus, RefreshCcw, LayoutDashboard, Map, GitBranch,
  ToggleLeft, ToggleRight
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

// 9 Granular Feature & Service Switchboard Controls
export const SERVICE_DEFINITIONS = [
  { id: 'support_page', name: 'Help & Support Desk', tag: 'Support', icon: LifeBuoy, desc: 'Enables user support ticket filing, live chats, and student query resolution.' },
  { id: 'ai_chatbot', name: 'AI Advisor Chatbot', tag: 'AI Engine', icon: MessageCircle, desc: 'Enables Studio AI floating chat advisor, quick recommendations, and conversational mentor.' },
  { id: 'onboarding', name: 'Student Onboarding', tag: 'Onboarding', icon: Rocket, desc: 'Enables initial multi-turn AI onboarding and personalized curriculum creation.' },
  { id: 'dashboard', name: 'Main Dashboard', tag: 'Learner Portal', icon: LayoutDashboard, desc: 'Enables student dashboard, overview tiles, and daily study units.' },
  { id: 'roadmap', name: 'Curriculum Roadmap', tag: 'Curriculum', icon: Map, desc: 'Enables interactive multi-phase curriculum roadmap and unit progression.' },
  { id: 'skill_gap', name: 'Skill Gap Analysis', tag: 'Assessments', icon: GitBranch, desc: 'Enables target competency assessment radar and gap reports.' },
  { id: 're_onboard', name: 'Re-Onboard Goal Option', tag: 'Calibration', icon: RefreshCcw, desc: 'Enables learners to reset their goals and recalibrate their career track.' },
  { id: 'new_signups', name: 'New User Signups', tag: 'Registration', icon: UserPlus, desc: 'Enables public registration and new learner account creation.' },
  { id: 'login', name: 'User Authentication / Login', tag: 'Auth Access', icon: Lock, desc: 'Enables student portal sign-in (Superadmins retain bypass access).' },
]

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
    title: 'Security & Infrastructure Hardening',
    tag: 'Security Protocol',
    icon: Lock,
    description: 'Applying critical security protocols and database authentication upgrades. Temporary restriction in effect.',
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
  const { theme } = useThemeStore()
  const queryClient = useQueryClient()
  
  // Navigation tab state: 'all' | 'users' | 'analytics' | 'resources' | 'ai' | 'support' | 'activity' | 'maintenance' | 'broadcasts'
  const [activeTab, setActiveTab] = useState('all')

  // Search and filter states for users
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  
  // Inline Name Editing state
  const [editingNameUserId, setEditingNameUserId] = useState(null)
  const [editingNameInput, setEditingNameInput] = useState('')

  // Password Visibility state per user { [userId]: boolean }
  const [revealedPasswords, setRevealedPasswords] = useState({})
  const [copiedUserId, setCopiedUserId] = useState(null)

  // Password Reset Modal state
  const [selectedUserForPwd, setSelectedUserForPwd] = useState(null)
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('')

  // Delete User Confirmation Modal state
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  // Inspect User Roadmap Modal state
  const [inspectedUserId, setInspectedUserId] = useState(null)

  // Resource Management states
  const [resourceSearch, setResourceSearch] = useState('')
  const [resourceDiffFilter, setResourceDiffFilter] = useState('ALL')
  const [resourceTypeFilter, setResourceTypeFilter] = useState('ALL')
  const [addResourceModalOpen, setAddResourceModalOpen] = useState(false)
  const [newResourceForm, setNewResourceForm] = useState({
    title: '',
    description: '',
    provider: 'PathMind Academy',
    type: 'course',
    difficulty: 'beginner',
    duration_hours: 8,
    url: 'https://learn.pathmind.ai',
    skills_taught: '',
    tags: '',
  })

  // AI Ping Test State
  const [pingResult, setPingResult] = useState(null)
  const [pingLoading, setPingLoading] = useState(false)

  // Global Notification Toast state
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState('success') // 'success' | 'error'

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg)
    setToastType(type)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Maintenance Selection Modal state
  const [maintModalOpen, setMaintModalOpen] = useState(false)
  const [selectedMaintMode, setSelectedMaintMode] = useState(MAINTENANCE_MODES[0].id)
  const [customMaintText, setCustomMaintText] = useState('')

  // Support Helpdesk state
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL')
  const [selectedTicketForAdmin, setSelectedTicketForAdmin] = useState(null)
  const [adminReplyInput, setAdminReplyInput] = useState('')
  const [adminReplyStatus, setAdminReplyStatus] = useState('in_progress')
  const [supportSuccessToast, setSupportSuccessToast] = useState('')

  // New Announcement form state
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMsg, setNotifMsg] = useState('')
  const [notifType, setNotifType] = useState('info')
  const [notifSuccessMsg, setNotifSuccessMsg] = useState('')

  // 1. Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
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

  // 5. Fetch Support Tickets
  const { data: supportTickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['adminSupportTickets', ticketStatusFilter],
    queryFn: () => adminApi.getSupportTickets(ticketStatusFilter, 'ALL').then(r => r.data),
    refetchInterval: 10000,
  })

  // 6. Fetch Single Ticket Thread Detail for Modal
  const { data: adminTicketDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['adminSupportTicketDetail', selectedTicketForAdmin?.id],
    queryFn: () => adminApi.getSupportTicketDetail(selectedTicketForAdmin.id).then(r => r.data),
    enabled: !!selectedTicketForAdmin,
    refetchInterval: 4000,
  })

  // 7. Fetch Inspected User Roadmap
  const { data: inspectedRoadmapData, isLoading: inspectedRoadmapLoading } = useQuery({
    queryKey: ['adminUserRoadmap', inspectedUserId],
    queryFn: () => adminApi.getUserRoadmap(inspectedUserId).then(r => r.data),
    enabled: !!inspectedUserId,
  })

  // 8. Fetch AI Telemetry
  const { data: aiTelemetry } = useQuery({
    queryKey: ['adminAiTelemetry'],
    queryFn: () => adminApi.getAiTelemetry().then(r => r.data),
    refetchInterval: 30000,
  })

  // 9. Fetch Analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => adminApi.getAnalytics().then(r => r.data),
  })

  // 10. Fetch Resources
  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['adminResources', resourceSearch, resourceDiffFilter, resourceTypeFilter],
    queryFn: () => adminApi.getResources({
      query: resourceSearch || undefined,
      difficulty: resourceDiffFilter !== 'ALL' ? resourceDiffFilter : undefined,
      type_filter: resourceTypeFilter !== 'ALL' ? resourceTypeFilter : undefined,
    }).then(r => r.data),
  })

  // 11. Fetch Activity Stream
  const { data: activityStream = [], isLoading: activityLoading } = useQuery({
    queryKey: ['adminActivityStream'],
    queryFn: () => adminApi.getActivityStream().then(r => r.data),
    refetchInterval: 15000,
  })

  // 12. Fetch Granular Service Flags
  const { data: serviceFlags = {
    support_page: true,
    ai_chatbot: true,
    onboarding: true,
    dashboard: true,
    roadmap: true,
    skill_gap: true,
    re_onboard: true,
    new_signups: true,
    login: true,
  }, isLoading: serviceFlagsLoading } = useQuery({
    queryKey: ['adminServiceFlags'],
    queryFn: () => adminApi.getServiceFlags().then(r => r.data),
  })

  // Mutations
  const updateServiceFlagMutation = useMutation({
    mutationFn: (updatedFlags) => adminApi.updateServiceFlags(updatedFlags),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminServiceFlags'] })
      triggerToast('Service Switchboard updated successfully.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to update service flag.', 'error')
    }
  })

  const updateUserPermissionsMutation = useMutation({
    mutationFn: ({ userId, permissions }) => adminApi.updateUserPermissions(userId, permissions),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      triggerToast(res.data?.message || 'Learner permissions updated.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to update user permissions.', 'error')
    }
  })

  const updateNameMutation = useMutation({
    mutationFn: ({ userId, name }) => adminApi.updateName(userId, name),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setEditingNameUserId(null)
      setEditingNameInput('')
      triggerToast(res.data?.message || 'Learner name updated successfully.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to update name.', 'error')
    }
  })

  const maintenanceMutation = useMutation({
    mutationFn: ({ enabled, message }) => adminApi.toggleMaintenance(enabled, message),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setMaintModalOpen(false)
      triggerToast(res.data?.message || 'Maintenance setting updated.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to update maintenance mode.', 'error')
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }) => adminApi.updatePassword(userId, newPassword),
    onSuccess: (res) => {
      setPwdSuccessMsg(res.data?.message || 'Password updated.')
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setTimeout(() => {
        setSelectedUserForPwd(null)
        setNewPasswordInput('')
        setPwdSuccessMsg('')
        triggerToast('Password updated successfully.')
      }, 1200)
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to update password.', 'error')
    }
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminApi.updateRole(userId, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      triggerToast(res.data?.message || 'User role updated.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to update role.', 'error')
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (userId) => adminApi.toggleStatus(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      triggerToast(res.data?.message || 'Account status updated.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to toggle account status.', 'error')
    }
  })

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      queryClient.invalidateQueries({ queryKey: ['adminActivityStream'] })
      setUserToDelete(null)
      setDeleteError('')
      triggerToast(res.data?.message || 'User account and all related records deleted permanently.')
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || 'Failed to delete user.'
      setDeleteError(errorMsg)
      triggerToast(errorMsg, 'error')
    },
  })

  // Create Resource Mutation
  const createResourceMutation = useMutation({
    mutationFn: (payload) => adminApi.createResource(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminResources'] })
      setAddResourceModalOpen(false)
      setNewResourceForm({
        title: '',
        description: '',
        provider: 'PathMind Academy',
        type: 'course',
        difficulty: 'beginner',
        duration_hours: 8,
        url: 'https://learn.pathmind.ai',
        skills_taught: '',
        tags: '',
      })
      triggerToast(res.data?.message || 'New learning unit added to curriculum catalog.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to create resource.', 'error')
    }
  })

  // Delete Resource Mutation
  const deleteResourceMutation = useMutation({
    mutationFn: (id) => adminApi.deleteResource(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminResources'] })
      triggerToast(res.data?.message || 'Resource deleted from catalog.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to delete resource.', 'error')
    }
  })

  const createNotifMutation = useMutation({
    mutationFn: (data) => adminApi.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      queryClient.invalidateQueries({ queryKey: ['adminActivityStream'] })
      setNotifTitle('')
      setNotifMsg('')
      setNotifSuccessMsg('Announcement broadcasted successfully.')
      triggerToast('Announcement broadcasted to all active learner bells.')
      setTimeout(() => setNotifSuccessMsg(''), 3000)
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to dispatch broadcast.', 'error')
    }
  })

  const deleteNotifMutation = useMutation({
    mutationFn: (id) => adminApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      triggerToast('Broadcast announcement removed.')
    },
  })

  // Support Mutations
  const adminReplyTicketMutation = useMutation({
    mutationFn: ({ ticketId, message, status }) => adminApi.replySupportTicket(ticketId, message, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTicketDetail', selectedTicketForAdmin?.id] })
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      queryClient.invalidateQueries({ queryKey: ['adminActivityStream'] })
      setAdminReplyInput('')
      setSupportSuccessToast('Reply dispatched directly to user window.')
      triggerToast('Support reply sent to learner.')
      setTimeout(() => setSupportSuccessToast(''), 3000)
    },
  })

  const updateTicketStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }) => adminApi.updateSupportTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTicketDetail', selectedTicketForAdmin?.id] })
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      triggerToast('Ticket status updated.')
    },
  })

  const deleteTicketMutation = useMutation({
    mutationFn: (ticketId) => adminApi.deleteSupportTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setSelectedTicketForAdmin(null)
      triggerToast('Support ticket disposed.')
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
      maintenanceMutation.mutate({
        enabled: false,
        message: settings?.maintenance_message,
      })
    } else {
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

  // Handle Live AI Ping
  const handleTestAiPing = async () => {
    setPingLoading(true)
    try {
      const res = await adminApi.pingAi()
      setPingResult(res.data)
      triggerToast(`AI Ping returned in ${res.data.latency_ms}ms`)
    } catch (err) {
      setPingResult({ status: 'error', error_detail: err.message })
      triggerToast('AI Ping failed to connect.', 'error')
    } finally {
      setPingLoading(false)
    }
  }

  // 1-Click Export CSV
  const handleExportCSV = () => {
    if (!users.length) return
    const headers = ["ID", "Name", "Email", "Role", "Status", "Goal", "ExperienceLevel", "SkillsCount", "ProgressPct", "CreatedDate"]
    const rows = users.map(u => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.role || 'user',
      u.is_active ? 'Active' : 'Suspended',
      `"${(u.goal_title || 'No Goal').replace(/"/g, '""')}"`,
      u.experience_level || 'beginner',
      u.skills_count || 0,
      `${Math.round((u.overall_progress || 0) * 100)}%`,
      u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : ''
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `pathmind_learners_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast("Learner records exported to CSV successfully.")
  }

  // 1-Click Export JSON
  const handleExportJSON = () => {
    if (!users.length) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2))
    const link = document.createElement('a')
    link.setAttribute("href", dataStr)
    link.setAttribute("download", `pathmind_learners_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast("Learner records exported to JSON successfully.")
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.goal_title && u.goal_title.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const activeLearnersCount = users.filter(u => u.is_active).length
  const firstName = user?.name?.split(' ')[0] || 'Admin'

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-6 space-y-8 animate-in fade-in">

      {/* ── Global Toast Message Banner ── */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-elevated border flex items-center gap-3 animate-slide-up text-sm font-semibold ${
          toastType === 'error'
            ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
        }`}>
          {toastType === 'error' ? <AlertCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Friendly Hero Greeting (Dashboard Theme) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" /> Superadmin Command Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hi {firstName},
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium">
            Supervise platform learners, monitor AI telemetry, and orchestrate curriculum assets.
          </p>
        </div>

        {/* Action Buttons: Export CSV / JSON & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleExportCSV}
            className="btn-secondary rounded-2xl text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-subtle hover:border-emerald-400 transition-all text-emerald-700 dark:text-emerald-300"
            title="Download formatted CSV spreadsheet of all registered learners"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="btn-secondary rounded-2xl text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-subtle hover:border-sky-400 transition-all text-sky-700 dark:text-sky-300"
            title="Download JSON export"
          >
            <FileJson className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button
            onClick={() => queryClient.invalidateQueries()}
            className="btn-secondary rounded-2xl text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-subtle hover:shadow-card transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Refresh
          </button>
        </div>
      </div>

      {/* ── 5 Big Pastel Touch Tiles ── */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
          Platform Overview & Control Tiles
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Tile 1: Registered Learners (Sky Blue) */}
          <div
            onClick={() => setActiveTab('users')}
            className={`p-4 sm:p-5 rounded-3xl border cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 ${
              activeTab === 'users'
                ? 'bg-sky-100/80 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 ring-2 ring-sky-400/40 shadow-card'
                : 'bg-sky-50 dark:bg-sky-950/30 border-sky-200/80 dark:border-sky-800/50 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-white dark:bg-darkBg-card flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-subtle">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-sky-700 dark:text-sky-300 bg-sky-200/60 dark:bg-sky-900/60 px-2 py-0.5 rounded-lg">
                Directory
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {usersLoading ? '…' : users.length}
                </span>
                <span className="text-xs text-sky-700 dark:text-sky-300 font-semibold">Learners</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {activeLearnersCount} active accounts
              </p>
            </div>
          </div>

          {/* Tile 2: Support Desk Queries (Rose) */}
          <div
            onClick={() => setActiveTab('support')}
            className={`p-4 sm:p-5 rounded-3xl border cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 ${
              activeTab === 'support'
                ? 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/40 shadow-card'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/50 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-white dark:bg-darkBg-card flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-subtle">
                <LifeBuoy className="w-4 h-4" />
              </div>
              {stats?.open_tickets > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-200/60 dark:bg-rose-900/60 px-1.5 py-0.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Urgent
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {stats?.open_tickets ?? 0}
                </span>
                <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Open Queries</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {supportTickets.length} total tickets
              </p>
            </div>
          </div>

          {/* Tile 3: Platform Analytics (Emerald) */}
          <div
            onClick={() => setActiveTab('analytics')}
            className={`p-4 sm:p-5 rounded-3xl border cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 ${
              activeTab === 'analytics'
                ? 'bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/40 shadow-card'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-white dark:bg-darkBg-card flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-subtle">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg">
                Insights
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {stats?.active_paths ?? '…'}
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Active Paths</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Goal & Skill breakdown
              </p>
            </div>
          </div>

          {/* Tile 4: AI Telemetry & Engine (Violet) */}
          <div
            onClick={() => setActiveTab('ai')}
            className={`p-4 sm:p-5 rounded-3xl border cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 ${
              activeTab === 'ai'
                ? 'bg-purple-100/80 dark:bg-purple-950/60 border-purple-400 dark:border-purple-600 ring-2 ring-purple-400/40 shadow-card'
                : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-white dark:bg-darkBg-card flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-subtle">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-700 dark:text-purple-300 bg-purple-200/60 dark:bg-purple-900/60 px-2 py-0.5 rounded-lg">
                Gemini
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">AI Engine Live</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Test latency & telemetry
              </p>
            </div>
          </div>

          {/* Tile 5: Maintenance Lockdown (Amber) */}
          <div
            onClick={() => setActiveTab('maintenance')}
            className={`p-4 sm:p-5 rounded-3xl border cursor-pointer transition-all duration-150 flex flex-col justify-between h-36 ${
              settings?.maintenance_mode
                ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40 shadow-card'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-subtle ${
                settings?.maintenance_mode
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-darkBg-card text-amber-600 dark:text-amber-400'
              }`}>
                <Wrench className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg ${
                settings?.maintenance_mode
                  ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                  : 'bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
              }`}>
                {settings?.maintenance_mode ? 'Locked' : 'Live'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${settings?.maintenance_mode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {settings?.maintenance_mode ? 'Maintenance On' : 'Systems Ready'}
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {settings?.maintenance_mode ? 'Lockdown screen active' : 'Full student access'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Segmented Tab Selector Bar ── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-darkBg-border pb-4 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border text-xs font-bold flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> All
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Learners ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Resources ({resourcesData?.total ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> AI Telemetry
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'support'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" /> Support ({stats?.open_tickets ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Live Stream
          </button>
          <button
            onClick={() => setActiveTab('switchboard')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'switchboard'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Services Switchboard
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Maintenance
          </button>
          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'broadcasts'
                ? 'bg-white dark:bg-darkBg-cardSub text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" /> Broadcasts
          </button>
        </div>
      </div>

      {/* ── TAB CONTENT: 1. LEARNER DIRECTORY & PASSWORDS ── */}
      {(activeTab === 'all' || activeTab === 'users') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                Learner Directory & Passwords
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect live student curriculums, edit names, manage self-edit permissions, reveal passwords, or delete accounts safely.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user, email, goal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-56 sm:w-64 pl-9 pr-4 py-2 text-xs rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-subtle"
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
                    <th className="px-5 py-3.5">Learner (Click Name to Edit)</th>
                    <th className="px-5 py-3.5">Password</th>
                    <th className="px-5 py-3.5">Self-Edit Permissions</th>
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
                      <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">Loading user directory…</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">
                        No learners found matching query "{searchTerm}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSuperadmin = u.email === 'er.adityasah@gmail.com'
                      const progressPct = Math.round((u.overall_progress || 0) * 100)
                      const isRevealed = revealedPasswords[u.id]
                      const rawPwdValue = u.raw_password || u.password || 'User@123'
                      const isEditingName = editingNameUserId === u.id

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-darkBg-cardSub/40 transition-colors">
                          
                          {/* User Avatar + Editable Name */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-subtle ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                                  : 'bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400'
                              }`}>
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                {isEditingName ? (
                                  <div className="flex items-center gap-1.5 py-0.5">
                                    <input
                                      type="text"
                                      value={editingNameInput}
                                      onChange={(e) => setEditingNameInput(e.target.value)}
                                      className="px-2.5 py-1 text-xs rounded-xl bg-white dark:bg-darkBg-card border-2 border-brand-500 text-slate-900 dark:text-white font-bold w-40 focus:outline-none shadow-subtle"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          if (editingNameInput.trim()) {
                                            updateNameMutation.mutate({ userId: u.id, name: editingNameInput.trim() })
                                          }
                                        } else if (e.key === 'Escape') {
                                          setEditingNameUserId(null)
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        if (editingNameInput.trim()) {
                                          updateNameMutation.mutate({ userId: u.id, name: editingNameInput.trim() })
                                        }
                                      }}
                                      disabled={updateNameMutation.isPending}
                                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                      title="Save name"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setEditingNameUserId(null)}
                                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-darkBg-border text-slate-600 dark:text-slate-300"
                                      title="Cancel"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 group">
                                    <span
                                      onClick={() => {
                                        setEditingNameUserId(u.id)
                                        setEditingNameInput(u.name)
                                      }}
                                      className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                      title="Click to edit name"
                                    >
                                      {u.name}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingNameUserId(u.id)
                                        setEditingNameInput(u.name)
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-600 transition-opacity"
                                      title="Edit Name"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                                <p className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Password Column with Reveal Toggle */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-darkBg-cardSub px-2.5 py-1 rounded-xl border border-slate-200 dark:border-darkBg-border">
                                {isRevealed ? rawPwdValue : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(u.id)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub transition-colors"
                                title={isRevealed ? "Hide Password" : "Show Password"}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                              </button>
                              {isRevealed && rawPwdValue !== '—' && (
                                <button
                                  onClick={() => copyToClipboard(rawPwdValue, u.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub transition-colors"
                                  title="Copy Password"
                                >
                                  {copiedUserId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Self-Edit Permissions (Name & Password Toggles) */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              {/* Name Permission Toggle */}
                              <button
                                disabled={isSuperadmin}
                                onClick={() => {
                                  const currentCanName = u.can_change_name !== false
                                  updateUserPermissionsMutation.mutate({
                                    userId: u.id,
                                    permissions: { can_change_name: !currentCanName }
                                  })
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1.5 transition-colors border ${
                                  u.can_change_name !== false
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                                } ${isSuperadmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={u.can_change_name !== false ? "Click to lock name editing" : "Click to allow name editing"}
                              >
                                {u.can_change_name !== false ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                <span>Name: {u.can_change_name !== false ? 'Allowed' : 'Locked'}</span>
                              </button>

                              {/* Password Permission Toggle */}
                              <button
                                disabled={isSuperadmin}
                                onClick={() => {
                                  const currentCanPass = u.can_change_password !== false
                                  updateUserPermissionsMutation.mutate({
                                    userId: u.id,
                                    permissions: { can_change_password: !currentCanPass }
                                  })
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1.5 transition-colors border ${
                                  u.can_change_password !== false
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                                } ${isSuperadmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={u.can_change_password !== false ? "Click to lock password changes" : "Click to allow password changes"}
                              >
                                {u.can_change_password !== false ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                <span>Password: {u.can_change_password !== false ? 'Allowed' : 'Locked'}</span>
                              </button>
                            </div>
                          </td>

                          {/* Role Dropdown */}
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
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 border transition-colors ${
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
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{u.goal_title || 'No Goal Set'}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{u.experience_level} • {u.skills_count} skills</p>
                          </td>

                          {/* Progress */}
                          <td className="px-5 py-4">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                <span>{progressPct}% Done</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 dark:bg-darkBg-border rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              
                              {/* Inspect Student Roadmap Button */}
                              <button
                                onClick={() => setInspectedUserId(u.id)}
                                className="p-2 rounded-xl text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-sky-200 dark:border-sky-800/80 transition-colors shadow-subtle"
                                title="Inspect Student Roadmap & Skills"
                              >
                                <Compass className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password Button */}
                              <button
                                onClick={() => {
                                  setSelectedUserForPwd(u)
                                  setNewPasswordInput('')
                                  setPwdSuccessMsg('')
                                }}
                                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub hover:text-brand-600 border border-slate-200 dark:border-darkBg-border transition-colors shadow-subtle"
                                title="Update Password Manually"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User Button (Fixed with Modal Confirmation) */}
                              {!isSuperadmin && (
                                <button
                                  onClick={() => {
                                    setUserToDelete(u)
                                    setDeleteError('')
                                  }}
                                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors shadow-subtle hover:border-rose-400"
                                  title="Delete User Permanently"
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
      )}

      {/* ── TAB CONTENT: 2. PLATFORM ANALYTICS ── */}
      {(activeTab === 'all' || activeTab === 'analytics') && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Platform Analytics & Skill Insights
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregate distributions across career goals, experience tiers, skill competencies, and completion metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Goal Popularity Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Career Goal Distribution</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Popularity</span>
              </div>
              <div className="space-y-3">
                {analyticsData?.goals_distribution?.length ? (
                  analyticsData.goals_distribution.map((g, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{g.goal}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{g.count} learners</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-darkBg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 dark:bg-brand-500 rounded-full"
                          style={{ width: `${Math.min(100, (g.count / (users.length || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No career goals set yet.</p>
                )}
              </div>
            </div>

            {/* Experience & Style Splits */}
            <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-5">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Experience Level Tiers</h3>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {analyticsData?.experience_distribution?.map((e, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-darkBg-cardSub/50 text-center space-y-0.5 border border-slate-200/60 dark:border-darkBg-border">
                      <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{e.count}</p>
                      <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">{e.level}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Learning Style Preferences
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analyticsData?.styles_distribution?.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      {s.style}: {s.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Buckets & Ticket Resolution */}
            <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Curriculum Progress Buckets</h3>
                </div>
              </div>
              <div className="space-y-2.5">
                {analyticsData?.progress_distribution?.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub/40">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{b.bucket} Finished</span>
                    <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-darkBg-card text-brand-600 dark:text-brand-400 font-bold border border-slate-200 dark:border-darkBg-border">
                      {b.count} paths
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-darkBg-border flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Support Resolution Rate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {analyticsData?.tickets_metrics?.resolution_rate_pct ?? 100}%
                </span>
              </div>
            </div>

          </div>

          {/* Top 10 Tracked Skills Chips */}
          <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" /> Most Tracked Learner Skills Across System
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {analyticsData?.top_skills?.map((sk, i) => (
                <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-darkBg-cardSub text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-darkBg-border text-xs font-semibold">
                  <span>{sk.skill}</span>
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[10px] font-bold">
                    {sk.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: 3. RESOURCE & CURRICULUM MANAGER ── */}
      {(activeTab === 'all' || activeTab === 'resources') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Curriculum Catalog & Learning Resources
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Browse, search, and add custom tutorials, video courses, and hands-on projects directly to the AI generator catalog.
              </p>
            </div>

            <button
              onClick={() => setAddResourceModalOpen(true)}
              className="btn-primary self-start sm:self-auto rounded-2xl text-xs py-2 px-4 flex items-center gap-1.5 shadow-card"
            >
              <Plus className="w-4 h-4" /> Add Learning Unit
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tutorials, skills, tags..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 text-xs rounded-2xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-subtle"
              />
            </div>

            <select
              value={resourceDiffFilter}
              onChange={(e) => setResourceDiffFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl text-xs font-semibold bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl text-xs font-semibold bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="course">Course</option>
              <option value="project">Project</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>

          {/* Resources Table */}
          <div className="rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card overflow-hidden">
            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-darkBg-cardSub border-b border-slate-200/80 dark:border-darkBg-border text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider z-10">
                  <tr>
                    <th className="px-5 py-3.5">ID & Title</th>
                    <th className="px-5 py-3.5">Type & Level</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Skills Taught</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-darkBg-border">
                  {resourcesLoading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Loading curriculum catalog…</td>
                    </tr>
                  ) : resourcesData?.resources?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                        No resources matched your filter.
                      </td>
                    </tr>
                  ) : (
                    resourcesData?.resources?.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-darkBg-cardSub/40 transition-colors">
                        <td className="px-5 py-3.5 max-w-sm">
                          <span className="font-mono text-[10px] text-slate-400 block">{r.id} • {r.provider}</span>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{r.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1 mt-0.5">{r.description}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase mr-1.5 ${
                            r.type === 'project' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                          }`}>
                            {r.type}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{r.difficulty}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {r.duration_hours}h
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {r.skills_taught?.slice(0, 3).map((sk, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-darkBg-cardSub text-slate-700 dark:text-slate-300 text-[10px] font-mono">
                                {sk}
                              </span>
                            ))}
                            {r.skills_taught?.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-mono">+{r.skills_taught.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {r.url && (
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-darkBg-cardSub"
                                title="Open Resource URL"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`Remove resource "${r.title}" from platform catalog?`)) {
                                  deleteResourceMutation.mutate(r.id)
                                }
                              }}
                              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete from Catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: 4. AI ENGINE HEALTH & TELEMETRY ── */}
      {(activeTab === 'all' || activeTab === 'ai') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                AI Recommendation Engine & Gemini Telemetry
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time connection monitor, cascade fallback models, safety directives, and live latency benchmark ping.
              </p>
            </div>

            <button
              onClick={handleTestAiPing}
              disabled={pingLoading}
              className="btn-primary self-start sm:self-auto rounded-2xl text-xs py-2 px-4 flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-card"
            >
              <Radio className={`w-4 h-4 ${pingLoading ? 'animate-spin' : ''}`} />
              {pingLoading ? 'Testing AI Latency…' : 'Ping Gemini AI Engine'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Model & Key Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Primary Generative Model</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
                {aiTelemetry?.primary_model || 'gemini-3.5-flash-lite'}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-darkBg-border text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>API Key: <strong className="font-mono text-slate-700 dark:text-slate-300">{aiTelemetry?.masked_key}</strong></p>
                <p>Status: <strong className="text-emerald-600 dark:text-emerald-400">{aiTelemetry?.system_status}</strong></p>
              </div>
            </div>

            {/* Fallback Cascades Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400">Resilient Model Cascade</span>
              <div className="space-y-1.5">
                {aiTelemetry?.fallback_models?.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-darkBg-cardSub px-2.5 py-1 rounded-xl">
                    <span>{m}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Ready</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Ping Benchmark Result */}
            <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400">Live Health Benchmark</span>
              {pingResult ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      {pingResult.latency_ms} ms
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      {pingResult.latency_ms < 900 ? '⚡ Ultra Fast' : '🟢 Normal'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-darkBg-cardSub p-2.5 rounded-xl border border-slate-200/60 dark:border-darkBg-border">
                    "{pingResult.response || pingResult.error_detail}"
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Last pinged: {new Date(pingResult.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 space-y-2">
                  <Gauge className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p>Click "Ping Gemini AI Engine" to test live latency benchmark.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── TAB CONTENT: 5. REAL-TIME SYSTEM ACTIVITY STREAM ── */}
      {(activeTab === 'all' || activeTab === 'activity') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Real-Time System Audit Stream</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live feed of student registrations, AI synthesis runs, and ticket interactions</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Polling
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-darkBg-border max-h-96 overflow-y-auto">
            {activityLoading ? (
              <p className="text-xs text-slate-400 py-8 text-center font-medium">Loading live activity feed…</p>
            ) : activityStream.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center font-medium">No recorded events in log yet.</p>
            ) : (
              activityStream.map((evt) => (
                <div key={evt.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-darkBg-cardSub/30 px-2 rounded-xl transition-colors">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    evt.type === 'signup' ? 'bg-sky-100 dark:bg-sky-950 text-sky-600' :
                    evt.type === 'path_generated' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' :
                    evt.type === 'assessment' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                    'bg-rose-100 dark:bg-rose-950 text-rose-600'
                  }`}>
                    {evt.type === 'signup' ? <Users className="w-4 h-4" /> :
                     evt.type === 'path_generated' ? <Compass className="w-4 h-4" /> :
                     evt.type === 'assessment' ? <CheckCircle className="w-4 h-4" /> :
                     <LifeBuoy className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{evt.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(evt.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{evt.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">Actor: {evt.actor}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: 6. SUPPORT HELPDESK ── */}
      {(activeTab === 'all' || activeTab === 'support') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-6 h-6 text-rose-500" />
                Learner Support Desk & Queries
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Review student tickets, reply directly to their window in real-time, and mark resolved.
              </p>
            </div>

            {/* Ticket Status Filter Tabs */}
            <div className="flex rounded-2xl border border-slate-200 dark:border-darkBg-border p-1 bg-slate-100 dark:bg-darkBg-canvas text-xs font-semibold">
              {['ALL', 'open', 'in_progress', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl transition-colors capitalize ${
                    ticketStatusFilter === st
                      ? 'bg-white dark:bg-darkBg-card text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Table */}
          <div className="rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-darkBg-cardSub/60 border-b border-slate-200/80 dark:border-darkBg-border text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Learner</th>
                    <th className="px-5 py-3.5">Subject & Preview</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-darkBg-border">
                  {ticketsLoading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">Loading support queries…</td>
                    </tr>
                  ) : supportTickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                        No support tickets found in this queue.
                      </td>
                    </tr>
                  ) : (
                    supportTickets.map((t) => {
                      const isResolved = t.status === 'resolved' || t.status === 'closed'
                      const isUserLast = t.last_sender_role === 'user'

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-darkBg-cardSub/40 transition-colors">
                          
                          {/* Learner Info */}
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900 dark:text-white">{t.user_name}</p>
                            <p className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{t.user_email}</p>
                            <p className="text-[10px] text-slate-400">{t.user_goal}</p>
                          </td>

                          {/* Subject & Latest Message */}
                          <td className="px-5 py-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{t.subject}</span>
                              {isUserLast && !isResolved && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" title="Awaiting Admin Reply" />
                              )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1">
                              {t.latest_message}
                            </p>
                          </td>

                          {/* Category & Priority */}
                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize text-xs block">
                              {t.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              {t.priority}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl inline-block border ${
                              isResolved
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                : t.status === 'in_progress'
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                                : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                            }`}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-[11px] text-slate-400">
                            {t.updated_at ? new Date(t.updated_at).toLocaleDateString() : ''}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedTicketForAdmin(t)}
                                className="btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-subtle"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Reply
                              </button>

                              {!isResolved && (
                                <button
                                  onClick={() => updateTicketStatusMutation.mutate({ ticketId: t.id, status: 'resolved' })}
                                  className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
                                  title="Mark as Resolved"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Dispose and delete support ticket "${t.subject}"?`)) {
                                    deleteTicketMutation.mutate(t.id)
                                  }
                                }}
                                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
      )}

      {/* ── TAB CONTENT: 7. MAINTENANCE LOCKDOWN ── */}
      {(activeTab === 'all' || activeTab === 'maintenance') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-darkBg-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-subtle">
                  <Wrench className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Global Maintenance Lockdown</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                When enabled, visitors will see the dedicated maintenance page while superadmins keep access.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto font-mono text-xs">
              {settings?.maintenance_mode && (
                <button
                  onClick={() => setMaintModalOpen(true)}
                  className="btn-secondary text-xs px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                >
                  Change Preset
                </button>
              )}

              <span className={`px-2.5 py-1 rounded-xl font-bold ${
                settings?.maintenance_mode
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-darkBg-cardSub text-slate-600 dark:text-slate-400'
              }`}>
                {settings?.maintenance_mode ? 'STATUS: ACTIVE' : 'STATUS: DISABLED'}
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

          {settings?.maintenance_mode ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Active Maintenance Announcement Broadcasted to Users:</p>
                <p className="leading-relaxed font-mono text-xs text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  "{settings?.maintenance_message}"
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-cardSub/50 border border-slate-200/80 dark:border-darkBg-border text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Platform is fully live and all student endpoints are processing requests smoothly.</span>
              <button
                onClick={() => setMaintModalOpen(true)}
                className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                Preview 6 maintenance presets →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: 8. BROADCAST ANNOUNCEMENTS ── */}
      {(activeTab === 'all' || activeTab === 'broadcasts') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Broadcast Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-subtle">
                <Megaphone className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Broadcast Announcement</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Send a real-time notification that renders across all learner dashboard notification bells.
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Notification Type
                </label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
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
                  placeholder="Write your broadcast details..."
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {notifSuccessMsg && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{notifSuccessMsg}</p>
              )}

              <button
                type="submit"
                disabled={createNotifMutation.isPending}
                className="btn-primary w-full py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-card"
              >
                <Send className="w-3.5 h-3.5" /> Broadcast Now
              </button>
            </form>
          </div>

          {/* Active Broadcasts History */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200/80 dark:border-darkBg-border shadow-card space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Broadcast History</h3>
            
            <div className="divide-y divide-slate-100 dark:divide-darkBg-border max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center font-medium">No active broadcasts published.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="py-3.5 flex items-start justify-between gap-3">
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
                      <p className="text-[10px] text-slate-400 font-mono">
                        By {n.created_by} • {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteNotifMutation.mutate(n.id)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
      )}

      {/* ── TAB CONTENT: SERVICES SWITCHBOARD ── */}
      {(activeTab === 'all' || activeTab === 'switchboard') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                Granular Service Switchboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Temporarily pause or resume individual services across PathMind AI on the fly with immediate effect.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-darkBg-cardSub px-3 py-1.5 rounded-xl border border-slate-200 dark:border-darkBg-border shadow-subtle">
                {Object.values(serviceFlags).filter(v => v !== false).length} / {SERVICE_DEFINITIONS.length} Services Active
              </span>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_DEFINITIONS.map((srv) => {
              const Icon = srv.icon
              const isEnabled = serviceFlags[srv.id] !== false

              return (
                <div
                  key={srv.id}
                  className={`p-5 rounded-3xl border transition-all duration-150 flex flex-col justify-between space-y-4 shadow-card ${
                    isEnabled
                      ? 'bg-white dark:bg-darkBg-card border-slate-200/80 dark:border-darkBg-border hover:border-brand-400 dark:hover:border-brand-600'
                      : 'bg-slate-50/80 dark:bg-darkBg-cardSub/60 border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-400/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-subtle ${
                        isEnabled
                          ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{srv.name}</h4>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{srv.tag}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg border ${
                      isEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                    }`}>
                      {isEnabled ? '● Active' : '⏸ Paused'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {srv.desc}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-darkBg-border flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {isEnabled ? 'Available to learners' : 'Paused for learners'}
                    </span>

                    {/* Toggle Button */}
                    <button
                      disabled={updateServiceFlagMutation.isPending}
                      onClick={() => {
                        updateServiceFlagMutation.mutate({
                          ...serviceFlags,
                          [srv.id]: !isEnabled,
                        })
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={isEnabled ? `Click to pause ${srv.name}` : `Click to enable ${srv.name}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: INSPECT LEARNER ROADMAP MODAL ── */}
      {inspectedUserId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Learner Roadmap Inspector
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {inspectedRoadmapData?.user?.name} ({inspectedRoadmapData?.user?.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedUserId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectedRoadmapLoading ? (
              <p className="text-xs text-slate-400 py-12 text-center font-medium">Loading learner curriculum graph…</p>
            ) : inspectedRoadmapData?.roadmap ? (
              <div className="space-y-6">
                
                {/* Path Overview Strip */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-cardSub/50 border border-slate-200/80 dark:border-darkBg-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-brand-600 dark:text-brand-400">Target Goal</span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                      {inspectedRoadmapData.profile?.goal_title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {inspectedRoadmapData.profile?.experience_level} • {inspectedRoadmapData.profile?.hours_per_week}h/week • {inspectedRoadmapData.profile?.learning_style} style
                    </p>
                  </div>
                  <div className="text-right font-mono self-start sm:self-auto">
                    <span className="text-xs text-slate-400">Overall Completion</span>
                    <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
                      {Math.round((inspectedRoadmapData.roadmap.overall_progress || 0) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Skills Assessed */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assessed Skills ({inspectedRoadmapData.skills?.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectedRoadmapData.skills?.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-darkBg-cardSub text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-darkBg-border text-xs font-mono">
                        {sk.skill_id}: <strong>{Math.round(sk.level * 100)}%</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weekly Curriculum Phases */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Curriculum Phases & Milestones</h4>
                  {inspectedRoadmapData.roadmap.phases?.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-white dark:bg-darkBg-cardSub/40 border border-slate-200/80 dark:border-darkBg-border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[10px] font-bold font-mono">
                            Phase #{p.phase_number} (Weeks {p.week_start}-{p.week_end})
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h5>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-darkBg-border text-slate-600 dark:text-slate-300">
                          {p.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-darkBg-border">
                        {p.items?.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${it.status === 'completed' ? 'bg-emerald-500' : it.status === 'in_progress' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{it.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({it.duration_hours}h)</span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              it.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-darkBg-cardSub dark:text-slate-400'
                            }`}>
                              {it.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Compass className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold">This learner has not generated an active learning path yet.</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-darkBg-border">
              <button
                onClick={() => setInspectedUserId(null)}
                className="btn-secondary text-xs px-5 py-2.5 rounded-2xl"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: ADD RESOURCE MODAL ── */}
      {addResourceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Curriculum Learning Unit</h3>
              </div>
              <button
                onClick={() => setAddResourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createResourceMutation.mutate({
                  ...newResourceForm,
                  duration_hours: Number(newResourceForm.duration_hours) || 8,
                  skills_taught: newResourceForm.skills_taught.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
                  tags: newResourceForm.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
                })
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Unit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Raft Consensus in Go"
                  value={newResourceForm.title}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Summary of concepts, architecture, and takeaways..."
                  value={newResourceForm.description}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Type</label>
                  <select
                    value={newResourceForm.type}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs"
                  >
                    <option value="course">Course</option>
                    <option value="project">Project</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={newResourceForm.difficulty}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={newResourceForm.duration_hours}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, duration_hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Provider / Platform</label>
                  <input
                    type="text"
                    value={newResourceForm.provider}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Resource URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newResourceForm.url}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Skills Taught (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. distributed-systems, golang, consensus"
                  value={newResourceForm.skills_taught}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, skills_taught: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setAddResourceModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2.5 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createResourceMutation.isPending}
                  className="btn-primary text-xs px-5 py-2.5 rounded-2xl shadow-card"
                >
                  Save & Publish to AI Engine
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL: DELETE USER CONFIRMATION MODAL ── */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-3">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/80 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Delete User Account</h3>
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-cardSub/60 border border-slate-200/80 dark:border-darkBg-border space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                  {userToDelete.name ? userToDelete.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{userToDelete.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-xs">{userToDelete.email}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-darkBg-border text-xs text-slate-600 dark:text-slate-300 flex justify-between font-mono">
                <span>Role: <strong className="capitalize">{userToDelete.role}</strong></span>
                <span>ID: #{userToDelete.id}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-200 space-y-1">
              <p className="font-bold">⚠️ Warning: Permanent Action</p>
              <p className="text-[11px] leading-relaxed">
                This will permanently remove the user, all active learning roadmaps, skills assessments, chat history, and support tickets from the database.
              </p>
            </div>

            {deleteError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="btn-secondary text-xs px-4 py-2.5 rounded-2xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
                disabled={deleteUserMutation.isPending}
                className="btn-primary text-xs px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 text-white font-semibold flex items-center gap-1.5 shadow-card"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleteUserMutation.isPending ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: SUPPORT TICKET REPLY MODAL ── */}
      {selectedTicketForAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    selectedTicketForAdmin.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {selectedTicketForAdmin.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Ticket #{selectedTicketForAdmin.id} • {selectedTicketForAdmin.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedTicketForAdmin.subject}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Learner: <strong className="text-slate-800 dark:text-slate-200">{selectedTicketForAdmin.user_name}</strong> ({selectedTicketForAdmin.user_email})
                </p>
              </div>

              <button
                onClick={() => setSelectedTicketForAdmin(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-72">
              {detailLoading ? (
                <p className="text-xs text-slate-400 text-center py-6 font-medium">Loading conversation…</p>
              ) : adminTicketDetail?.messages?.map((m) => {
                const isAdmin = m.sender_role === 'admin'

                return (
                  <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {m.sender_name} {isAdmin ? '(Superadmin Support)' : ''}
                      </span>
                      <span>•</span>
                      <span>{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>

                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      isAdmin
                        ? 'bg-brand-600 text-white rounded-tr-sm shadow-subtle'
                        : 'bg-slate-100 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-slate-100 rounded-tl-sm shadow-subtle'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {supportSuccessToast && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{supportSuccessToast}</p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!adminReplyInput.trim()) return
                adminReplyTicketMutation.mutate({
                  ticketId: selectedTicketForAdmin.id,
                  message: adminReplyInput.trim(),
                  status: adminReplyStatus,
                })
              }}
              className="space-y-3 pt-3 border-t border-slate-100 dark:border-darkBg-border"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Dispatch Reply to Learner
                </label>
                <textarea
                  rows="3"
                  placeholder="Type your response to the user..."
                  value={adminReplyInput}
                  onChange={(e) => setAdminReplyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">After replying set status:</span>
                  <select
                    value={adminReplyStatus}
                    onChange={(e) => setAdminReplyStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs font-semibold"
                  >
                    <option value="in_progress">In Progress (Open)</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForAdmin(null)}
                    className="btn-secondary text-xs px-4 py-2 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={adminReplyTicketMutation.isPending || !adminReplyInput.trim()}
                    className="btn-primary text-xs px-5 py-2 rounded-xl text-white font-semibold flex items-center gap-1.5 shadow-card"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Reply
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL: 6 SELECTABLE MAINTENANCE MODES ── */}
      {maintModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-4">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/80 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    Select Maintenance Mode Preset
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose one of 6 professional announcements for the platform
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
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40 shadow-subtle'
                        : 'bg-slate-50 dark:bg-darkBg-cardSub/60 border-slate-200 dark:border-darkBg-border hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
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

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-darkBg-border">
              <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Selected Message Preview (or Customize):
              </label>
              <textarea
                rows="2"
                value={customMaintText || (MAINTENANCE_MODES.find(m => m.id === selectedMaintMode)?.description || '')}
                onChange={(e) => setCustomMaintText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

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
                className="btn-primary text-xs px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 text-white font-semibold shadow-card"
              >
                {maintenanceMutation.isPending ? 'Activating…' : 'Activate Maintenance Mode'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: PASSWORD RESET MODAL ── */}
      {selectedUserForPwd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-darkBg-card border border-slate-200 dark:border-darkBg-border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBg-border pb-3">
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
              Setting a new raw password for <strong>{selectedUserForPwd.email}</strong>.
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200 dark:border-darkBg-border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  className="btn-primary text-xs px-5 py-2 rounded-xl shadow-card"
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
