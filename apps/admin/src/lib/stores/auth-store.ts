import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types/settings';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AdminUser) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => {
        set({ token });
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin-token', token);
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-refresh-token');
        }
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
