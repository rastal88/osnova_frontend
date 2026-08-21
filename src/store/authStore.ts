import { create } from 'zustand';
import { getCurrentUser, logout } from '../api/auth';

type Role = 'USER' | 'ROOT' | 'MODERATOR';

interface User {
  id: string;
  email: string;
  role: Role;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<User | null>;
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
      set({ user: null, isAuthenticated: false });
      return null;
    }
  },

  logout: async () => {
    await logout();
    set({ user: null, isAuthenticated: false });
  },
}));