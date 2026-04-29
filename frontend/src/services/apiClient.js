import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const apiClient = axios.create({ baseURL: BASE_URL })

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jwt')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  register: (data) => apiClient.post('/auth/register', data),
}

export const eventsApi = {
  list: (params) => apiClient.get('/api/events', { params }),
  get: (id) => apiClient.get(`/api/events/${id}`),
  create: (data) => apiClient.post('/api/events', data),
  update: (id, data) => apiClient.put(`/api/events/${id}`, data),
  delete: (id) => apiClient.delete(`/api/events/${id}`),
  stats: () => apiClient.get('/api/events/stats'),
  export: (params) => apiClient.get('/api/events/export', { params, responseType: 'blob' }),
}

export const aiApi = {
  describe: (data) => apiClient.post('/api/ai/describe', data),
  recommend: (data) => apiClient.post('/api/ai/recommend', data),
  generateReport: (data) => apiClient.post('/api/ai/generate-report', data),
}

export default apiClient
