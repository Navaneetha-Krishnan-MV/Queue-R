import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Venues API
export const venueAPI = {
  getAll: () => api.get('/api/venues'),
  getById: (venueId) => api.get(`/api/venues/${venueId}`),
};

// Teams API
export const teamAPI = {
  login: (credentials) => api.post('/api/teams/login', credentials),
  register: (teamData) => api.post('/api/teams/register', teamData),
  getTeam: (teamId) => api.get(`/api/teams/${teamId}`),
};

// Questions API
export const questionAPI = {
  getQuestion: (venueId, questionId, token, teamId) => 
    api.get(`/api/questions/venue/${venueId}/question/${questionId}?token=${token}&teamId=${teamId}`),
  
  submitAnswer: (venueId, questionId, answerData) => 
    api.post(`/api/questions/venue/${venueId}/question/${questionId}/answer`, answerData),
  
  getAvailable: (venueId, teamId) =>
    api.get(`/api/questions/venue/${venueId}/available?teamId=${teamId}`),
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin API
export const adminAPI = {
  // Auth
  login: (credentials) => api.post('/api/admin/auth/login', credentials),
  verifyToken: (token) => api.get('/api/admin/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  
  // Admin operations
  setupVenues: () => api.post('/api/admin/venues/setup'),
  uploadQuestions: (questions) => api.post('/api/admin/questions', { questions }),
  assignQuestions: () => api.post('/api/admin/assign-questions-to-venues'),
  getQRCodes: (venueId) => api.get(`/api/admin/qr-codes/venue/${venueId}`),
  getAllQRCodes: () => api.get('/api/admin/qr-codes/all'),
  // Registration Codes
  generateRegistrationCodes: (data) => api.post('/api/admin/registration-codes/generate', data),
  getRegistrationCodes: () => api.get('/api/admin/registration-codes'),
  deleteRegistrationCode: (codeId) => api.delete(`/api/admin/registration-codes/${codeId}`),
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: () => api.get('/api/leaderboard'),
  getVenue: (venueId) => api.get(`/api/leaderboard/venue/${venueId}`),
  getTeam: (teamId) => api.get(`/api/leaderboard/team/${teamId}`),
  getStats: () => api.get('/api/leaderboard/stats/overview'),
};

export default api;