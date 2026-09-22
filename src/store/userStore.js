import { create } from 'zustand';

export const useUserStore = create((set) => ({
  userData: null,
  loading: false,
  error: null,
  setUserData: (userData) => set({ userData, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearUserData: () => set({ userData: null, error: null }),
}));
