import { create } from 'zustand';

import type { UserRead } from '../../api/generated';
import { getCurrentUser, logout } from './api';

interface AuthStore {
  user: UserRead | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<UserRead | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  logout: async () => {
    await logout();
    set({ user: null, isAuthenticated: false });
  },
}));
