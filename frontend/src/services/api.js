import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const eventService = {
  getAll: (page = 0, size = 10, sortBy = 'occurredAt', direction = 'desc') => 
    api.get(`/events?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),
  
  search: (query, page = 0, size = 10) => 
    api.get(`/events/search?q=${query}&page=${page}&size=${size}`),
  
  getById: (id) => api.get(`/events/${id}`),
  
  create: (data) => api.post('/events', data),
  
  update: (id, data) => api.put(`/events/${id}`, data),
  
  delete: (id) => api.delete(`/events/${id}`),
  
  getStats: () => api.get('/stats'),
  
  exportCsv: () => api.get('/files/export', { responseType: 'blob' }),
  
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const aiService = {
  analyze: (title, description, category) => 
    aiApi.post('/analyze', { title, description, category })
};

export default api;
