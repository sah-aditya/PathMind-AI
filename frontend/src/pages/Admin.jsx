import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, certificateApi } from '../services/api'
import { cleanCourseTitle } from './Certificates'
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

// 6 Selectable Professional Maintenance Modes
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
  
  // Executive Organized Navigation Groups: 'learners' | 'curriculum' | 'support' | 'system'
  const [activeGroup, setActiveGroup] = useState('learners')
  const [subTab, setSubTab] = useState('directory')

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
  const [toastType, setToastType] = useState('success')

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

  // New Announcement form state
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMsg, setNotifMsg] = useState('')
  const [notifType, setNotifType] = useState('info')
  const [notifSuccessMsg, setNotifSuccessMsg] = useState('')

  // Certificates for Admin
  const [rejectModalCert, setRejectModalCert] = useState(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')
  const [certFilter, setCertFilter] = useState('ALL')

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

  // 13. Fetch Certificates
  const { data: adminCerts = [], isLoading: certsLoading } = useQuery({
    queryKey: ['adminCertificates'],
    queryFn: () => certificateApi.adminList('all').then(r => r.data),
    refetchInterval: 15000,
  })

  // Certificate Mutations
  const approveCertMutation = useMutation({
    mutationFn: (id) => certificateApi.adminApprove(id),
    onSuccess: (res) => {
      triggerToast(`Certificate approved! Unique Code: ${res.data?.certificate?.code || 'Assigned'}`)
      queryClient.invalidateQueries({ queryKey: ['adminCertificates'] })
    },
    onError: () => triggerToast('Failed to approve certificate.', 'error'),
  })

  const rejectCertMutation = useMutation({
    mutationFn: ({ id, reason }) => certificateApi.adminReject(id, reason),
    onSuccess: () => {
      triggerToast('Certificate request rejected.')
      setRejectModalCert(null)
      setRejectionReasonInput('')
      queryClient.invalidateQueries({ queryKey: ['adminCertificates'] })
    },
    onError: () => triggerToast('Failed to reject certificate.', 'error'),
  })

  // Mutations
  const updateServiceFlagMutation = useMutation({
    mutationFn: (updatedFlags) => adminApi.updateServiceFlags(updatedFlags),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminServiceFlags'] })
      triggerToast('Service Switchboard updated.')
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
      triggerToast(res.data?.message || 'Maintenance mode updated.')
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

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      queryClient.invalidateQueries({ queryKey: ['adminActivityStream'] })
      setUserToDelete(null)
      setDeleteError('')
      triggerToast(res.data?.message || 'User account deleted permanently.')
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || 'Failed to delete user.'
      setDeleteError(errorMsg)
      triggerToast(errorMsg, 'error')
    },
  })

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
    onError: () => triggerToast('Failed to remove notification.', 'error'),
  })

  const adminReplyMutation = useMutation({
    mutationFn: ({ ticketId, message, status }) => adminApi.replyToSupportTicket(ticketId, message, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] })
      queryClient.invalidateQueries({ queryKey: ['adminSupportTicketDetail'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setAdminReplyInput('')
      triggerToast('Reply dispatched to student desk.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to send reply.', 'error')
    }
  })

  const closeTicketMutation = useMutation({
    mutationFn: (ticketId) => adminApi.closeSupportTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] })
      queryClient.invalidateQueries({ queryKey: ['adminSupportTicketDetail'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      triggerToast('Support ticket marked as resolved.')
    },
    onError: (err) => {
      triggerToast(err.response?.data?.detail || 'Failed to resolve ticket.', 'error')
    }
  })

  // Helpers
  const togglePasswordVisibility = (userId) => {
    setRevealedPasswords(prev => ({ ...prev, [userId]: !prev[userId] }))
  }

  const copyToClipboard = (text, userId) => {
    navigator.clipboard.writeText(text)
    setCopiedUserId(userId)
    triggerToast('Password copied to clipboard.')
    setTimeout(() => setCopiedUserId(null), 2000)
  }

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

  const handleConfirmMaintenanceMode = () => {
    const chosenMode = MAINTENANCE_MODES.find(m => m.id === selectedMaintMode)
    const finalMessage = customMaintText.trim() || chosenMode?.description || MAINTENANCE_MODES[0].description
    
    maintenanceMutation.mutate({
      enabled: true,
      message: finalMessage,
    })
  }

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

  // Exports
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

  const handleExportJSON = () => {
    if (!users.length) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2))
    const link = document.createElement('a')
    link.setAttribute("href", dataStr)
    link.setAttribute("download", `pathmind_learners_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast("Learner records exported to JSON.")
  }

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.goal_title && u.goal_title.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const filteredCerts = adminCerts.filter(c => {
    if (certFilter === 'ALL') return true
    return c.status === certFilter
  })

  const activeLearnersCount = users.filter(u => u.is_active).length
  const pendingCertsCount = adminCerts.filter(c => c.status === 'pending').length
  const openTicketsCount = stats?.open_tickets ?? 0

  return (
    <div className="max-w-7xl mx-auto py-3 sm:py-6 space-y-6 animate-fade-in">

      {/* ── Global Toast Notification ── */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-card-lg border flex items-center gap-3 animate-slide-up text-xs font-semibold ${
          toastType === 'error'
            ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
        }`}>
          {toastType === 'error' ? <AlertCircle className="w-4 h-4 text-rose-500" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-indigo text-[10px] font-mono font-bold uppercase tracking-wider">
              Administration Console
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
              settings?.maintenance_mode 
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings?.maintenance_mode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              {settings?.maintenance_mode ? 'Maintenance Active' : 'System Operational'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Platform Operations & Governance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Supervise learners, manage curriculum catalog, resolve helpdesk tickets, and configure service flags.
          </p>
        </div>

        {/* Action Buttons: Export & Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
            title="Download CSV spreadsheet of registered learners"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
            title="Download full JSON dataset"
          >
            <FileJson className="w-3.5 h-3.5 text-sky-600" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => queryClient.invalidateQueries()}
            className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
            title="Refresh all metrics and data tables"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Executive KPI Summary Grid (Monochrome & Structured) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Learners */}
        <div
          onClick={() => { setActiveGroup('learners'); setSubTab('directory') }}
          className={`card cursor-pointer p-4 transition-all ${
            activeGroup === 'learners' && subTab === 'directory'
              ? 'ring-2 ring-indigo-500/40 border-indigo-500 dark:border-indigo-400'
              : 'hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Learners</span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="stat-value">{usersLoading ? '—' : users.length}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            <strong className="text-emerald-600 dark:text-emerald-400">{activeLearnersCount}</strong> active accounts
          </p>
        </div>

        {/* Metric 2: Active Roadmaps */}
        <div
          onClick={() => { setActiveGroup('curriculum'); setSubTab('resources') }}
          className={`card cursor-pointer p-4 transition-all ${
            activeGroup === 'curriculum'
              ? 'ring-2 ring-indigo-500/40 border-indigo-500 dark:border-indigo-400'
              : 'hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Curriculum Paths</span>
            <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="stat-value">{stats?.active_paths ?? '—'}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            {resourcesData?.total ?? 0} modular units in catalog
          </p>
        </div>

        {/* Metric 3: Support Queries */}
        <div
          onClick={() => { setActiveGroup('support'); setSubTab('helpdesk') }}
          className={`card cursor-pointer p-4 transition-all ${
            activeGroup === 'support'
              ? 'ring-2 ring-indigo-500/40 border-indigo-500 dark:border-indigo-400'
              : 'hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Helpdesk</span>
            <LifeBuoy className="w-4 h-4 text-rose-500" />
          </div>
          <div className="stat-value">{openTicketsCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            {supportTickets.length} total tickets ({analyticsData?.tickets_metrics?.resolution_rate_pct ?? 100}% resolved)
          </p>
        </div>

        {/* Metric 4: Pending Certificates */}
        <div
          onClick={() => { setActiveGroup('learners'); setSubTab('certificates') }}
          className={`card cursor-pointer p-4 transition-all ${
            activeGroup === 'learners' && subTab === 'certificates'
              ? 'ring-2 ring-indigo-500/40 border-indigo-500 dark:border-indigo-400'
              : 'hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Credentials</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="stat-value">{pendingCertsCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Pending administrative review
          </p>
        </div>

      </div>

      {/* ── Primary Executive Group Navigation Tabs ── */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-xs font-semibold">
          
          <button
            onClick={() => { setActiveGroup('learners'); setSubTab('directory') }}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeGroup === 'learners'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-subtle font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Learners & Credentials</span>
            {pendingCertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingCertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveGroup('curriculum'); setSubTab('resources') }}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeGroup === 'curriculum'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-subtle font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Curriculum & Knowledge</span>
          </button>

          <button
            onClick={() => { setActiveGroup('support'); setSubTab('helpdesk') }}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeGroup === 'support'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-subtle font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
            <span>Helpdesk & Broadcasts</span>
            {openTicketsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {openTicketsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveGroup('system'); setSubTab('switchboard') }}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeGroup === 'system'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-subtle font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>System & Infrastructure</span>
          </button>

        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODULE 1: LEARNERS & CREDENTIALS                       ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeGroup === 'learners' && (
        <div className="space-y-4">
          
          {/* Sub-navigation */}
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-white/[0.04]">
            <button
              onClick={() => setSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'directory'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Learner Directory ({users.length})
            </button>
            <button
              onClick={() => setSubTab('certificates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                subTab === 'certificates'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate Approvals</span>
              {pendingCertsCount > 0 && (
                <span className="badge-yellow text-[10px] py-0 px-1.5 font-mono font-bold">
                  {pendingCertsCount} pending
                </span>
              )}
            </button>
          </div>

          {/* Sub-view 1A: Learner Directory */}
          {subTab === 'directory' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or career goal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-9 text-xs py-2"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-xs font-semibold">
                  {['ALL', 'user', 'admin'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                        roleFilter === r
                          ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-subtle'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-zinc-400 font-mono font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Learner Profile</th>
                        <th className="px-4 py-3">Password Access</th>
                        <th className="px-4 py-3">Self-Edit Permissions</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Target Goal</th>
                        <th className="px-4 py-3">Curriculum Progress</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {usersLoading ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-slate-400">Loading learner directory…</td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-slate-400">
                            No learners matched "{searchTerm}".
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
                            <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                              
                              {/* Name & Avatar */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-indigo-200/50 dark:border-white/[0.08]">
                                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div>
                                    {isEditingName ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="text"
                                          value={editingNameInput}
                                          onChange={(e) => setEditingNameInput(e.target.value)}
                                          className="input py-0.5 px-2 text-xs w-36"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && editingNameInput.trim()) {
                                              updateNameMutation.mutate({ userId: u.id, name: editingNameInput.trim() })
                                            } else if (e.key === 'Escape') {
                                              setEditingNameUserId(null)
                                            }
                                          }}
                                        />
                                        <button
                                          onClick={() => editingNameInput.trim() && updateNameMutation.mutate({ userId: u.id, name: editingNameInput.trim() })}
                                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => setEditingNameUserId(null)}
                                          className="p-1 rounded bg-slate-200 dark:bg-zinc-700 text-slate-600"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 group">
                                        <span
                                          onClick={() => { setEditingNameUserId(u.id); setEditingNameInput(u.name) }}
                                          className="font-bold text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                                        >
                                          {u.name}
                                        </span>
                                        <button
                                          onClick={() => { setEditingNameUserId(u.id); setEditingNameInput(u.name) }}
                                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 transition-opacity"
                                        >
                                          <Pencil className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    )}
                                    <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Password */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/[0.08]">
                                    {isRevealed ? rawPwdValue : '••••••••'}
                                  </span>
                                  <button
                                    onClick={() => togglePasswordVisibility(u.id)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                                    title={isRevealed ? "Hide Password" : "Show Password"}
                                  >
                                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-indigo-600" />}
                                  </button>
                                  {isRevealed && rawPwdValue !== '—' && (
                                    <button
                                      onClick={() => copyToClipboard(rawPwdValue, u.id)}
                                      className="p-1 rounded text-slate-400 hover:text-indigo-600"
                                      title="Copy Password"
                                    >
                                      {copiedUserId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Permissions Switchboard */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    disabled={isSuperadmin}
                                    onClick={() => updateUserPermissionsMutation.mutate({
                                      userId: u.id,
                                      permissions: { can_change_name: u.can_change_name === false }
                                    })}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      u.can_change_name !== false
                                        ? 'badge-green'
                                        : 'badge-red'
                                    }`}
                                    title="Toggle name change permission"
                                  >
                                    Name: {u.can_change_name !== false ? 'Allowed' : 'Locked'}
                                  </button>
                                  <button
                                    disabled={isSuperadmin}
                                    onClick={() => updateUserPermissionsMutation.mutate({
                                      userId: u.id,
                                      permissions: { can_change_password: u.can_change_password === false }
                                    })}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      u.can_change_password !== false
                                        ? 'badge-green'
                                        : 'badge-red'
                                    }`}
                                    title="Toggle password change permission"
                                  >
                                    Pwd: {u.can_change_password !== false ? 'Allowed' : 'Locked'}
                                  </button>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="px-4 py-3">
                                <select
                                  value={u.role}
                                  disabled={isSuperadmin}
                                  onChange={(e) => updateRoleMutation.mutate({ userId: u.id, role: e.target.value })}
                                  className="input py-1 px-2 text-xs font-mono font-bold w-24"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3">
                                <button
                                  disabled={isSuperadmin}
                                  onClick={() => toggleStatusMutation.mutate(u.id)}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                    u.is_active ? 'badge-green' : 'badge-red'
                                  }`}
                                >
                                  {u.is_active ? 'Active' : 'Suspended'}
                                </button>
                              </td>

                              {/* Goal */}
                              <td className="px-4 py-3">
                                <p className="font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">{u.goal_title || 'No Goal'}</p>
                                <p className="text-[10px] text-slate-400 capitalize">{u.experience_level || 'beginner'}</p>
                              </td>

                              {/* Progress */}
                              <td className="px-4 py-3">
                                <div className="w-24 space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                    <span>{progressPct}%</span>
                                  </div>
                                  <div className="progress-bar h-1.5">
                                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                                  </div>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => setInspectedUserId(u.id)}
                                    className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-zinc-800"
                                    title="Inspect Student Roadmap"
                                  >
                                    <Compass className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedUserForPwd(u); setNewPasswordInput(''); setPwdSuccessMsg('') }}
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                    title="Set Password"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                  {!isSuperadmin && (
                                    <button
                                      onClick={() => { setUserToDelete(u); setDeleteError('') }}
                                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800"
                                      title="Delete Account"
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

          {/* Sub-view 1B: Certificate Approvals */}
          {subTab === 'certificates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Certificate Issuance Registry</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Review student path completion requests and assign unique verified credential IDs.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
                  {['ALL', 'pending', 'approved', 'rejected'].map(st => (
                    <button
                      key={st}
                      onClick={() => setCertFilter(st)}
                      className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                        certFilter === st
                          ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-subtle'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-0 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-zinc-400 font-mono font-bold uppercase">
                    <tr>
                      <th className="px-4 py-3">Learner</th>
                      <th className="px-4 py-3">Curriculum Goal</th>
                      <th className="px-4 py-3">Credential ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Requested Date</th>
                      <th className="px-4 py-3 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {certsLoading ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading certificate queue…</td></tr>
                    ) : filteredCerts.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-400">No certificate requests found in this queue.</td></tr>
                    ) : (
                      filteredCerts.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900 dark:text-zinc-100">{c.recipient_name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{c.user_email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-zinc-200">{cleanCourseTitle(c.path_title)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-zinc-800 text-indigo-900 dark:text-indigo-300 border border-indigo-200/60 dark:border-white/[0.08]">
                              {c.code || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge uppercase text-[10px] font-bold ${
                              c.status === 'approved' ? 'badge-green' : c.status === 'pending' ? 'badge-yellow' : 'badge-red'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {c.status === 'pending' && (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => approveCertMutation.mutate(c.id)}
                                  disabled={approveCertMutation.isPending}
                                  className="btn-primary text-xs py-1 px-3 rounded-lg"
                                >
                                  Approve & Stamp
                                </button>
                                <button
                                  onClick={() => setRejectModalCert(c)}
                                  className="btn-danger text-xs py-1 px-3 rounded-lg"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {c.status === 'approved' && (
                              <a
                                href={`/verify/${c.code}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                              >
                                <span>Verify Seal</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODULE 2: CURRICULUM & KNOWLEDGE                       ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeGroup === 'curriculum' && (
        <div className="space-y-4">
          
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-white/[0.04]">
            <button
              onClick={() => setSubTab('resources')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'resources'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Curriculum Catalog ({resourcesData?.total ?? 0})
            </button>
            <button
              onClick={() => setSubTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'analytics'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Skill Graph & Analytics
            </button>
          </div>

          {/* Sub-view 2A: Catalog Resources */}
          {subTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tutorials, skills, tags..."
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      className="input pl-9 text-xs py-2"
                    />
                  </div>

                  <select
                    value={resourceDiffFilter}
                    onChange={(e) => setResourceDiffFilter(e.target.value)}
                    className="input text-xs py-2 w-36 font-semibold"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>

                  <select
                    value={resourceTypeFilter}
                    onChange={(e) => setResourceTypeFilter(e.target.value)}
                    className="input text-xs py-2 w-36 font-semibold"
                  >
                    <option value="ALL">All Types</option>
                    <option value="course">Course</option>
                    <option value="project">Project</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>

                <button
                  onClick={() => setAddResourceModalOpen(true)}
                  className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Learning Unit</span>
                </button>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-zinc-400 font-mono font-bold uppercase">
                      <tr>
                        <th className="px-4 py-3">Resource ID & Title</th>
                        <th className="px-4 py-3">Format</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Skills Taught</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {resourcesLoading ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading catalog…</td></tr>
                      ) : resourcesData?.resources?.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-400">No resources found.</td></tr>
                      ) : (
                        resourcesData?.resources?.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="px-4 py-3 max-w-sm">
                              <span className="font-mono text-[10px] text-slate-400">{r.id} • {r.provider}</span>
                              <p className="font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">{r.title}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="badge-indigo uppercase text-[10px] mr-1">{r.type}</span>
                              <span className="text-[11px] text-slate-500 capitalize">{r.difficulty}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600 dark:text-zinc-300">
                              {r.duration_hours}h
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {r.skills_taught?.slice(0, 3).map((sk, idx) => (
                                  <span key={idx} className="badge-neutral font-mono text-[10px]">{sk}</span>
                                ))}
                                {r.skills_taught?.length > 3 && (
                                  <span className="text-[10px] text-slate-400 font-mono">+{r.skills_taught.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {r.url && (
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 text-slate-400 hover:text-indigo-600"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  onClick={() => confirm(`Delete "${r.title}"?`) && deleteResourceMutation.mutate(r.id)}
                                  className="p-1 text-rose-500 hover:text-rose-700"
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

          {/* Sub-view 2B: Analytics */}
          {subTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="card p-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">Career Track Popularity</h4>
                <div className="space-y-2.5">
                  {analyticsData?.goals_distribution?.map((g, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 line-clamp-1">{g.goal}</span>
                        <span className="font-mono text-slate-500">{g.count}</span>
                      </div>
                      <div className="progress-bar h-1.5">
                        <div className="progress-fill" style={{ width: `${Math.min(100, (g.count / (users.length || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">Experience Tiers</h4>
                <div className="grid grid-cols-3 gap-2">
                  {analyticsData?.experience_distribution?.map((e, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 text-center border border-slate-200/80 dark:border-white/[0.04]">
                      <p className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100">{e.count}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{e.level}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">Top Tracked Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analyticsData?.top_skills?.map((sk, i) => (
                    <span key={i} className="badge-neutral font-mono text-xs">
                      {sk.skill} ({sk.count})
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODULE 3: HELPDESK & BROADCASTS                        ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeGroup === 'support' && (
        <div className="space-y-4">
          
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-white/[0.04]">
            <button
              onClick={() => setSubTab('helpdesk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'helpdesk'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Support Tickets Queue ({supportTickets.length})
            </button>
            <button
              onClick={() => setSubTab('broadcasts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'broadcasts'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Global Announcements ({notifications.length})
            </button>
          </div>

          {/* Sub-view 3A: Helpdesk */}
          {subTab === 'helpdesk' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Student Support Helpdesk</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Reply directly to learner query threads.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
                  {['ALL', 'open', 'in_progress', 'resolved'].map(st => (
                    <button
                      key={st}
                      onClick={() => setTicketStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                        ticketStatusFilter === st
                          ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-subtle'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-0 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-zinc-400 font-mono font-bold uppercase">
                    <tr>
                      <th className="px-4 py-3">Learner</th>
                      <th className="px-4 py-3">Subject & Latest Message</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {ticketsLoading ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading tickets…</td></tr>
                    ) : supportTickets.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-400">No support tickets found.</td></tr>
                    ) : (
                      supportTickets.map(t => {
                        const isResolved = t.status === 'resolved' || t.status === 'closed'
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 dark:text-zinc-100">{t.user_name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{t.user_email}</p>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <p className="font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">{t.subject}</p>
                              <p className="text-slate-500 dark:text-zinc-400 text-[11px] line-clamp-1">{t.latest_message}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="badge-neutral text-[10px] capitalize">{t.category.replace('_', ' ')}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge uppercase text-[10px] ${
                                isResolved ? 'badge-green' : t.status === 'in_progress' ? 'badge-yellow' : 'badge-red'
                              }`}>
                                {t.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                              {t.updated_at ? new Date(t.updated_at).toLocaleDateString() : ''}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => setSelectedTicketForAdmin(t)}
                                className="btn-secondary text-xs py-1 px-3 rounded-lg"
                              >
                                Open Thread
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-view 3B: Broadcasts */}
          {subTab === 'broadcasts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="card p-5 space-y-4 lg:col-span-1">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Send Announcement</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Broadcasts instant banner to all student bells.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (notifTitle.trim() && notifMsg.trim()) {
                      createNotifMutation.mutate({ title: notifTitle, message: notifMsg, type: notifType })
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="input-label">Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Generative AI Agent Track Released"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="input-label">Message</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Broadcast details..."
                      value={notifMsg}
                      onChange={(e) => setNotifMsg(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="input-label">Type</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value)}
                      className="input text-xs font-semibold"
                    >
                      <option value="info">Information (Blue)</option>
                      <option value="success">Milestone (Green)</option>
                      <option value="warning">System Alert (Amber)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={createNotifMutation.isPending}
                    className="btn-primary text-xs w-full py-2.5 rounded-xl shadow-subtle flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Broadcast</span>
                  </button>
                </form>
              </div>

              <div className="card p-5 space-y-4 lg:col-span-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Active Broadcast History</h3>
                <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No broadcast announcements active.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="py-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="badge-indigo text-[10px] uppercase font-mono">{n.type}</span>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">{n.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{n.message}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteNotifMutation.mutate(n.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800"
                          title="Delete announcement"
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

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODULE 4: SYSTEM & INFRASTRUCTURE                      ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeGroup === 'system' && (
        <div className="space-y-4">
          
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-white/[0.04]">
            <button
              onClick={() => setSubTab('switchboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'switchboard'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Services Switchboard (9)
            </button>
            <button
              onClick={() => setSubTab('maintenance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'maintenance'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Maintenance Mode
            </button>
            <button
              onClick={() => setSubTab('ai_telemetry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'ai_telemetry'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              AI Telemetry & Health
            </button>
            <button
              onClick={() => setSubTab('audit_logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                subTab === 'audit_logs'
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/[0.08]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Audit Activity Stream
            </button>
          </div>

          {/* Sub-view 4A: Switchboard */}
          {subTab === 'switchboard' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Granular Feature Switchboard</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Toggle individual platform services on or off in real time.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SERVICE_DEFINITIONS.map(def => {
                  const IconComp = def.icon
                  const isEnabled = serviceFlags[def.id] !== false

                  return (
                    <div key={def.id} className="card p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="badge-neutral font-mono text-[10px]">{def.tag}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">{def.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{def.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase font-mono ${
                          isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}>
                          {isEnabled ? 'Operational' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => updateServiceFlagMutation.mutate({ [def.id]: !isEnabled })}
                          disabled={updateServiceFlagMutation.isPending}
                          className={`p-1 rounded-lg transition-colors ${
                            isEnabled ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {isEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sub-view 4B: Maintenance */}
          {subTab === 'maintenance' && (
            <div className="card p-6 max-w-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">Global Maintenance Lockdown</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Restricts non-admin users to a branded maintenance landing page.</p>
                </div>
                <button
                  onClick={handleMaintenanceToggle}
                  disabled={maintenanceMutation.isPending}
                  className={`btn-${settings?.maintenance_mode ? 'danger' : 'primary'} text-xs py-2 px-4 rounded-xl`}
                >
                  {settings?.maintenance_mode ? 'Deactivate Maintenance' : 'Activate Lockdown'}
                </button>
              </div>

              {settings?.maintenance_mode && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold">Active Broadcast Notice:</p>
                  <p className="font-mono">{settings?.maintenance_message || 'Under scheduled maintenance'}</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-view 4C: AI Telemetry */}
          {subTab === 'ai_telemetry' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="card p-5 space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Primary Gemini Model</span>
                <p className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {aiTelemetry?.primary_model || 'gemini-2.5-flash'}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] text-xs text-slate-500 space-y-1 font-mono">
                  <p>Key: {aiTelemetry?.masked_key}</p>
                  <p className="text-emerald-600 font-bold">Status: {aiTelemetry?.system_status || 'Operational'}</p>
                </div>
              </div>

              <div className="card p-5 space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Fallback Models</span>
                <div className="space-y-1.5">
                  {aiTelemetry?.fallback_models?.map((m, i) => (
                    <div key={i} className="flex justify-between text-xs font-mono p-1.5 rounded bg-slate-50 dark:bg-zinc-800">
                      <span>{m}</span>
                      <span className="text-emerald-600 font-bold">Ready</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Engine Diagnostic Ping</span>
                <button
                  onClick={handleTestAiPing}
                  disabled={pingLoading}
                  className="btn-primary text-xs w-full py-2 rounded-xl flex items-center justify-center gap-2"
                >
                  <Radio className={`w-3.5 h-3.5 ${pingLoading ? 'animate-spin' : ''}`} />
                  <span>{pingLoading ? 'Testing latency…' : 'Ping Gemini'}</span>
                </button>
                {pingResult && (
                  <div className="text-xs font-mono p-2 rounded bg-slate-50 dark:bg-zinc-800 space-y-1">
                    <p className="font-bold text-emerald-600">{pingResult.latency_ms} ms Latency</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">"{pingResult.response || pingResult.error_detail}"</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Sub-view 4D: Audit Logs */}
          {subTab === 'audit_logs' && (
            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100">Live Platform Event Stream</h3>
                <span className="badge-green text-[10px] font-mono">Live Polling</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04] max-h-96 overflow-y-auto">
                {activityLoading ? (
                  <p className="p-6 text-center text-slate-400 text-xs">Loading activity stream…</p>
                ) : activityStream.length === 0 ? (
                  <p className="p-6 text-center text-slate-400 text-xs">No activity recorded.</p>
                ) : (
                  activityStream.map(evt => (
                    <div key={evt.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between">
                          <strong className="text-slate-900 dark:text-zinc-100">{evt.title}</strong>
                          <span className="font-mono text-[10px] text-slate-400">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-400 mt-0.5">{evt.description}</p>
                        <span className="text-[10px] text-slate-400 font-mono block">Actor: {evt.actor}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODALS (CLEAN & INTEGRATED)                            ── */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* Password Reset Modal */}
      {selectedUserForPwd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Update Password for {selectedUserForPwd.name}</h3>
              <button onClick={() => setSelectedUserForPwd(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); newPasswordInput.trim() && updatePasswordMutation.mutate({ userId: selectedUserForPwd.id, newPassword: newPasswordInput.trim() }) }} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Enter new strong password"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="input text-xs"
              />
              {pwdSuccessMsg && <p className="text-xs text-emerald-600 font-semibold">{pwdSuccessMsg}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedUserForPwd(null)} className="btn-secondary text-xs py-2 px-3 rounded-xl">Cancel</button>
                <button type="submit" disabled={updatePasswordMutation.isPending} className="btn-primary text-xs py-2 px-4 rounded-xl">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-rose-600">Delete Account</h3>
              <button onClick={() => setUserToDelete(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Permanently delete user <strong>{userToDelete.name}</strong> ({userToDelete.email}) and all active curriculums?
            </p>
            {deleteError && <p className="text-xs text-rose-600 font-semibold">{deleteError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setUserToDelete(null)} className="btn-secondary text-xs py-2 px-3 rounded-xl">Cancel</button>
              <button
                type="button"
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
                disabled={deleteUserMutation.isPending}
                className="btn-danger text-xs py-2 px-4 rounded-xl"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Learning Unit Modal */}
      {addResourceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Add Learning Unit to Catalog</h3>
              <button onClick={() => setAddResourceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
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
              className="space-y-3"
            >
              <div>
                <label className="input-label">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 15 Full-Stack Mastery"
                  value={newResourceForm.title}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, title: e.target.value })}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Summary of skills and practical takeaways..."
                  value={newResourceForm.description}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, description: e.target.value })}
                  className="input text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Type</label>
                  <select
                    value={newResourceForm.type}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, type: e.target.value })}
                    className="input text-xs font-semibold"
                  >
                    <option value="course">Course</option>
                    <option value="project">Project</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    value={newResourceForm.difficulty}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, difficulty: e.target.value })}
                    className="input text-xs font-semibold"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={newResourceForm.duration_hours}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, duration_hours: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="input-label">Provider</label>
                  <input
                    type="text"
                    value={newResourceForm.provider}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, provider: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">URL</label>
                <input
                  type="url"
                  required
                  value={newResourceForm.url}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, url: e.target.value })}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="input-label">Skills Taught (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. nextjs, typescript, tailwind"
                  value={newResourceForm.skills_taught}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, skills_taught: e.target.value })}
                  className="input text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddResourceModalOpen(false)} className="btn-secondary text-xs py-2 px-3 rounded-xl">Cancel</button>
                <button type="submit" disabled={createResourceMutation.isPending} className="btn-primary text-xs py-2 px-4 rounded-xl">Save & Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Certificate Modal */}
      {rejectModalCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Reject Certificate Request</h3>
              <button onClick={() => setRejectModalCert(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Provide feedback for <strong>{rejectModalCert.recipient_name}</strong> on why this credential request requires further milestone completion.
            </p>
            <textarea
              rows="3"
              required
              placeholder="e.g. Please complete the Capstone project milestone in Phase 4 before re-applying."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="input text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRejectModalCert(null)} className="btn-secondary text-xs py-2 px-3 rounded-xl">Cancel</button>
              <button
                type="button"
                onClick={() => rejectCertMutation.mutate({ id: rejectModalCert.id, reason: rejectionReasonInput.trim() })}
                disabled={rejectCertMutation.isPending || !rejectionReasonInput.trim()}
                className="btn-danger text-xs py-2 px-4 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Detail Modal */}
      {selectedTicketForAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl p-6 space-y-4 animate-scale-in max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">{selectedTicketForAdmin.subject}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedTicketForAdmin.user_name} ({selectedTicketForAdmin.user_email})</p>
              </div>
              <button onClick={() => setSelectedTicketForAdmin(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl max-h-72">
              {detailLoading ? (
                <p className="text-xs text-slate-400 text-center py-4">Loading messages…</p>
              ) : adminTicketDetail?.messages?.map(m => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl text-xs max-w-[85%] ${
                    m.sender_role === 'admin'
                      ? 'ml-auto bg-indigo-600 text-white'
                      : 'mr-auto bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-white/[0.08]'
                  }`}
                >
                  <p className="font-bold text-[10px] opacity-80 mb-1">{m.sender_name} ({m.sender_role})</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (adminReplyInput.trim()) {
                  adminReplyMutation.mutate({
                    ticketId: selectedTicketForAdmin.id,
                    message: adminReplyInput.trim(),
                    status: adminReplyStatus,
                  })
                }
              }}
              className="space-y-3 pt-2"
            >
              <textarea
                rows="2"
                required
                placeholder="Type resolution reply to student..."
                value={adminReplyInput}
                onChange={(e) => setAdminReplyInput(e.target.value)}
                className="input text-xs"
              />
              <div className="flex items-center justify-between">
                <select
                  value={adminReplyStatus}
                  onChange={(e) => setAdminReplyStatus(e.target.value)}
                  className="input text-xs w-36 font-semibold"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved / Closed</option>
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => closeTicketMutation.mutate(selectedTicketForAdmin.id)}
                    className="btn-secondary text-xs py-2 px-3 rounded-xl"
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="submit"
                    disabled={adminReplyMutation.isPending || !adminReplyInput.trim()}
                    className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect User Roadmap Modal */}
      {inspectedUserId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl p-6 space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Learner Roadmap Inspection</h3>
              <button onClick={() => setInspectedUserId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            {inspectedRoadmapLoading ? (
              <p className="text-xs text-slate-400 text-center py-6">Loading curriculum details…</p>
            ) : inspectedRoadmapData ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-white/[0.08]">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">{inspectedRoadmapData.goal_title}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Target: {inspectedRoadmapData.target_weeks} weeks • {inspectedRoadmapData.hours_per_week}h/week
                  </p>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {inspectedRoadmapData.phases?.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-xs">
                      <p className="font-bold text-slate-900 dark:text-zinc-100 mb-1">{p.phase_name}</p>
                      <div className="space-y-1">
                        {p.resources?.map((r, rIdx) => (
                          <div key={rIdx} className="flex justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                            <span>• {r.title}</span>
                            <span className="font-mono text-[10px]">{r.duration_hours}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No active roadmap generated for this learner yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Maintenance Mode Configuration Modal */}
      {maintModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Activate System Maintenance Lockdown</h3>
              <button onClick={() => setMaintModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              <label className="input-label">Select Standard Reason</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {MAINTENANCE_MODES.map(m => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMaintMode(m.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedMaintMode === m.id
                        ? 'bg-indigo-50 dark:bg-zinc-800 border-indigo-500 dark:border-indigo-400'
                        : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100">{m.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="input-label">Or Custom Message (Optional)</label>
              <input
                type="text"
                placeholder="Custom broadcast message for learners..."
                value={customMaintText}
                onChange={(e) => setCustomMaintText(e.target.value)}
                className="input text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMaintModalOpen(false)} className="btn-secondary text-xs py-2 px-3 rounded-xl">Cancel</button>
              <button
                type="button"
                onClick={handleConfirmMaintenanceMode}
                disabled={maintenanceMutation.isPending}
                className="btn-danger text-xs py-2 px-4 rounded-xl"
              >
                Confirm Lockdown
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
