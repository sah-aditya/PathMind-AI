import axios from 'axios'
import useAuthStore from '../store/authStore'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api'

const api = axios.create({
  baseURL,
  timeout: 30000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get('/profile/'),
  update: (data) => api.put('/profile/', data),
  updateName: (name) => api.put('/profile/name', { name }),
  updatePassword: (current_password, new_password) =>
    api.put('/profile/password', { current_password, new_password }),
  getGoals: () => api.get('/profile/goals'),
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (message, phase = 'assistant', history = null) =>
    api.post('/chat/message', { message, phase, history }),
  getHistory: (phase, limit = 50) =>
    api.get('/chat/history', { params: { phase, limit } }),
  reset: () =>
    api.post('/chat/reset'),
}

// ── Learning Path ─────────────────────────────────────────────────────────────
export const pathApi = {
  generate: () => api.post('/learning-path/generate'),
  getActive: () => api.get('/learning-path/active'),
  getById: (id) => api.get(`/learning-path/${id}`),
  updateItemStatus: (itemId, status) =>
    api.put(`/learning-path/items/${itemId}/status`, { status }),
  getSkillGap: () => api.get('/learning-path/skill-gap/report'),
}

// ── Assessments ───────────────────────────────────────────────────────────────
export const assessmentApi = {
  get: (id) => api.get(`/assessments/${id}`),
  submit: (data) => api.post('/assessments/submit', data),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard/'),
}

// ── Resources ─────────────────────────────────────────────────────────────────
export const resourcesApi = {
  list: (params) => api.get('/resources/', { params }),
  get: (id) => api.get(`/resources/${id}`),
  explain: (id) => api.get(`/resources/${id}/explain`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateName: (userId, name) =>
    api.put(`/admin/users/${userId}/name`, { name }),
  updatePassword: (userId, newPassword) =>
    api.put(`/admin/users/${userId}/password`, { new_password: newPassword }),
  updateRole: (userId, role) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  toggleStatus: (userId) =>
    api.put(`/admin/users/${userId}/status`),
  deleteUser: (userId) =>
    api.delete(`/admin/users/${userId}`),
  getSettings: () => api.get('/admin/system/settings'),
  toggleMaintenance: (enabled, message) =>
    api.put('/admin/system/maintenance', { enabled, message }),
  getNotifications: () => api.get('/admin/notifications'),
  createNotification: (data) => api.post('/admin/notifications', data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),
  getSupportTickets: (status, category) =>
    api.get('/admin/support/tickets', { params: { status_filter: status, category_filter: category } }),
  getSupportTicketDetail: (id) =>
    api.get(`/admin/support/tickets/${id}`),
  replySupportTicket: (id, message, status) =>
    api.post(`/admin/support/tickets/${id}/reply`, { message, status }),
  updateSupportTicketStatus: (id, status) =>
    api.put(`/admin/support/tickets/${id}/status`, { status }),
  deleteSupportTicket: (id) =>
    api.delete(`/admin/support/tickets/${id}`),
  getUserRoadmap: (userId) =>
    api.get(`/admin/users/${userId}/roadmap`),
  createUser: (data) =>
    api.post('/admin/users/create', data),
  bulkUserAction: (data) =>
    api.post('/admin/users/bulk-action', data),
  getAiTelemetry: () =>
    api.get('/admin/ai/telemetry'),
  pingAi: () =>
    api.post('/admin/ai/ping'),
  getResources: (params) =>
    api.get('/admin/resources', { params }),
  createResource: (data) =>
    api.post('/admin/resources', data),
  updateResource: (id, data) =>
    api.put(`/admin/resources/${id}`, data),
  deleteResource: (id) =>
    api.delete(`/admin/resources/${id}`),
  updateUserPermissions: (userId, permissions) =>
    api.put(`/admin/users/${userId}/permissions`, permissions),
  getServiceFlags: () =>
    api.get('/admin/system/service-flags'),
  updateServiceFlags: (flags) =>
    api.put('/admin/system/service-flags', flags),
  getAnalytics: () =>
    api.get('/admin/analytics'),
  getActivityStream: () =>
    api.get('/admin/activity-stream'),
  getDiagnostics: () =>
    api.get('/admin/system/diagnostics'),
}

// ── Support Tickets (Learner) ──────────────────────────────────────────────────
export const supportApi = {
  createTicket: (data) => api.post('/support/tickets', data),
  getTickets: () => api.get('/support/tickets'),
  getTicketDetail: (id) => api.get(`/support/tickets/${id}`),
  replyTicket: (id, message) => api.post(`/support/tickets/${id}/reply`, { message }),
  resolveTicket: (id) => api.put(`/support/tickets/${id}/resolve`),
}

// ── Certificates ─────────────────────────────────────────────────────────────
export const certificateApi = {
  request: (pathId = null) => api.post('/certificates/request', { path_id: pathId }),
  getMyCertificates: () => api.get('/certificates/my'),
  verifyCode: (code) => api.get(`/certificates/verify/${encodeURIComponent(code)}`),
  adminList: (statusFilter = 'all') => api.get('/admin/certificates', { params: { status_filter: statusFilter } }),
  adminApprove: (id) => api.post(`/admin/certificates/${id}/approve`),
  adminReject: (id, reason) => api.post(`/admin/certificates/${id}/reject`, { reason }),
}

// ── Notifications & System Status ─────────────────────────────────────────────
export const notificationApi = {
  getSystemStatus: () => api.get('/system/status'),
  list: () => api.get('/notifications'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
}

// ── System Public API ─────────────────────────────────────────────────────────
export const systemApi = {
  getServiceFlags: () => api.get('/system/service-flags'),
}

export default api

