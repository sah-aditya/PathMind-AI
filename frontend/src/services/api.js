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
  getGoals: () => api.get('/profile/goals'),
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (message, phase = 'assistant') =>
    api.post('/chat/message', { message, phase }),
  getHistory: (phase, limit = 50) =>
    api.get('/chat/history', { params: { phase, limit } }),
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

export default api
