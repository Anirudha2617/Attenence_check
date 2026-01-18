import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
});

// Interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const login = (username, password) => api.post('token/', { username, password });
export const register = (data) => api.post('register/', data);
export const getCurrentUser = () => api.get('me/');

// Dashboard Services
export const getDashboardStats = () => api.get('dashboard-stats/');

// Subject Services
export const getSubjects = () => api.get('subjects/');
export const createSubject = (data) => api.post('subjects/', data);
export const getSubject = (id) => api.get(`subjects/${id}/`);

// Timetable Services
export const getTimetables = () => api.get('timetables/');
export const createTimetableEntry = (data) => api.post('timetables/', data);
export const deleteTimetableEntry = (id) => api.delete(`timetables/${id}/`);
export const generateSessions = () => api.post('generate/');

// Session/Attendance Services
export const getSessions = (params) => api.get('sessions/', { params });
export const updateSessionStatus = (id, status) => api.patch(`sessions/${id}/`, { status });

export default api;
