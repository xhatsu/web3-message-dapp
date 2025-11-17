import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isConnected: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: (user, token) => {
    set({ user, token, isConnected: true });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, token: null, isConnected: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  hydrate: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({ token, user: JSON.parse(user), isConnected: true });
    }
  },
}));
