// lib/store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types/auth';
import { authService } from '@/lib/api/auth-service';
import { apiClient } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<User> & { profile_image?: File | null }) => Promise<void>;
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
          // apiClient returns ApiResponse<AuthResponse>, so pick .data
          const res = await authService.login(credentials);
          // service already set axios token, but keep Zustand in sync:
          set({
            user: (res as AuthResponse).user,
            token: (res as AuthResponse).token,
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
          const res = await authService.register(userData);
          set({
            user: (res as AuthResponse).user,
            token: (res as AuthResponse).token,
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
        const token = get().token;
        if (!token) return;

        // ensure axios has token after refresh
        apiClient.setToken(token);

        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isLoading: false, isAuthenticated: true });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateUser: async (userData) => {
        const res = await authService.updateProfile(userData);
        // Laravel returns { user, message } for updateProfile
        const updated = (res as any)?.user ? (res as any).user : (res as any);
        set({ user: updated });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // After rehydrate, wire token back to axios (and optionally set isAuthenticated)
      onRehydrateStorage: () => (state) => {
        try {
          const token = state?.token;
          if (token) {
            apiClient.setToken(token);
            // keep store consistent (useful if you ever change partialize fields)
            useAuthStore.setState({ isAuthenticated: true });
          }
        } catch {}
      },
    }
  )
);

// —— Keep Zustand in sync with axios on 401 Unauthorized ——
apiClient.onUnauthorized(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
});
