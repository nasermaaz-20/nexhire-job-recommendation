import { create } from 'zustand';
import { login as loginAPI, registerUser, registerCompany, getMe } from '../api/authApi';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password, type = 'user') => {
    try {
      const data = await loginAPI(email, password, type);
      const { access_token, user, company } = data.data;
      
      let userData;
      if (user) {
        userData = user.role === 'admin' ? { ...user, role: 'admin' } : { ...user, role: 'job_seeker' };
      } else {
        userData = { ...company, role: 'company' };
      }
      
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      set({
        user: userData,
        token: access_token,
        isAuthenticated: true,
      });
      
      return userData;
    } catch (error) {
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      let data;
      const { accountType, ...payload } = userData;
      if (accountType === 'jobseeker') {
        data = await registerUser(payload);
        const { access_token, user, company } = data.data;
        const userDataWithRole = user ? { ...user, role: 'job_seeker' } : { ...company, role: 'company' };
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(userDataWithRole));
        set({ user: userDataWithRole, token: access_token, isAuthenticated: true });
        return userDataWithRole;
      } else {
        // Company registration — backend returns data: null (pending verification)
        data = await registerCompany(payload);
        return null;
      }
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    // Clear both storages
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    window.location.href = '/login';
  },

  checkAuth: async () => {
    try {
      // Check both localStorage and sessionStorage
      let token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      let userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      
      if (!token || !userStr) {
        set({ isLoading: false });
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // Just validate token exists and set user from storage
      // The token will be validated on first API call
      set({
        user: user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Clear both storages on error
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (userData) => {
    const updatedUser = { ...useAuthStore.getState().user, ...userData };
    // Update in both storages (whichever is being used)
    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
