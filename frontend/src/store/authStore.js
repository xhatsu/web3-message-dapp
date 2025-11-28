import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  walletType: null, // Store wallet type for reconnection
  isConnected: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setWalletType: (walletType) => set({ walletType }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: (user, token, walletType = 'metamask') => {
    set({ user, token, walletType, isConnected: true });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('walletType', walletType);
  },

  logout: () => {
    set({ user: null, token: null, walletType: null, isConnected: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('walletType');
  },

  hydrate: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const walletType = localStorage.getItem('walletType');
    if (token && user) {
      set({ token, user: JSON.parse(user), walletType: walletType || 'metamask', isConnected: true });
    }
  },
}));
