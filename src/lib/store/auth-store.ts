// lib/store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types/auth';
import { authService } from '@/lib/api/auth-service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const authResponse: AuthResponse = await authService.login(credentials);
          set({
            user: authResponse.user,
            token: authResponse.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const authResponse: AuthResponse = await authService.register(userData);
          set({
            user: authResponse.user,
            token: authResponse.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      fetchUser: async () => {
        if (!get().token) return;
        
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateUser: async (userData) => {
        const user = await authService.updateProfile(userData);
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);