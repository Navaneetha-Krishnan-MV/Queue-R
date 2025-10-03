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

// Admin API
export const adminAPI = {
  setupVenues: () => api.post('/api/admin/venues/setup'),
  uploadQuestions: (questions) => api.post('/api/admin/questions', { questions }),
  assignQuestions: () => api.post('/api/admin/assign-questions-to-venues'),
  getQRCodes: (venueId) => api.get(`/api/admin/qr-codes/venue/${venueId}`),
  getAllQRCodes: () => api.get('/api/admin/qr-codes/all'),
  getStats: () => api.get('/api/admin/stats'),
  resetEvent: () => api.post('/api/admin/reset-event'),
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: () => api.get('/api/leaderboard'),
  getVenue: (venueId) => api.get(`/api/leaderboard/venue/${venueId}`),
  getTeam: (teamId) => api.get(`/api/leaderboard/team/${teamId}`),
  getStats: () => api.get('/api/leaderboard/stats/overview'),
};

export default api;