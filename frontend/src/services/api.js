import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  getNonce: (address) => api.get(`/auth/nonce/${address}`),
  login: (address, signature, message) =>
    api.post('/auth/login', { address, signature, message }),
  logout: (address) => api.post('/auth/logout', { address }),
};

// Messages
export const messageApi = {
  sendMessage: (recipient, content) =>
    api.post('/messages/send', { recipient, content }),
  getConversations: () => api.get('/messages/list'),
  getConversation: (otherAddress) =>
    api.get(`/messages/conversation/${otherAddress}`),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

// Users
export const userApi = {
  getUser: (address) => api.get(`/users/${address}`),
  getCurrentUser: () => api.get('/users'),
  // Matches backend route: router.put('/profile', ...)
  updateProfile: (username, avatar, bio) =>
    api.put('/users/profile', { username, avatar, bio }),
  searchUsers: (query, limit = 10) =>
    api.get(`/users/search/${query}?limit=${limit}`),
  sendFirstMessage: (recipient, content) =>
    api.post('/users/send-message', { recipient, content }),
};

export default api;