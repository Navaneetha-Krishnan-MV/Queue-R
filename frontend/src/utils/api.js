import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const teamAPI = {
  register: (teamData) => api.post('/teams/register', teamData),
  getTeam: (teamId) => api.get(`/teams/${teamId}`),
};

export const questionAPI = {
  getQuestion: (questionId, token) => 
    api.get(`/questions/${questionId}?token=${token}`),
  submitAnswer: (questionId, answerData) => 
    api.post(`/questions/${questionId}/answer`, answerData),
};

export const adminAPI = {
  uploadQuestions: (questionsData) => api.post('/admin/questions', questionsData),
  generateQRCodes: () => api.post('/admin/generate-qr-codes'),
  getQuestions: () => api.get('/admin/questions'),
};

export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
};

export default api;