// lib/store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types/auth';
import { authService } from '@/lib/api/auth-service';
import { apiClient } from '@/lib/api/client';

type Credentials = { email: string; password: string };

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // small helpers (useful for profile edits, admin impersonation, etc.)
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;

  login: (credentials: Credentials) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<User> & { profile_image?: File | null }) => Promise<void>;
}

function unwrapAuth(res: any): AuthResponse {
  // accept either { message, data: { user, token } } or { user, token }
  return (res?.data ?? res) as AuthResponse;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (u) => set({ user: u, isAuthenticated: !!u }),
      setToken: (t) => {
        apiClient.setToken(t || String(undefined));
        set({ token: t, isAuthenticated: !!t });
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const raw = await authService.login(credentials);
          const { user, token } = unwrapAuth(raw);
          apiClient.setToken(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const raw = await authService.register(userData);
          const { user, token } = unwrapAuth(raw);
          apiClient.setToken(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // ignore network failures here
        } finally {
          apiClient.setToken(String(undefined));
          set({ user: null, token: null, isAuthenticated: false });
          // optional: hard redirect so all client state resets
          // window.location.href = '/login';
        }
      },

      fetchUser: async () => {
        const token = get().token;
        if (!token) return;
        apiClient.setToken(token);
        set({ isLoading: true });
        try {
          const u = await authService.getCurrentUser();
          set({ user: u, isAuthenticated: true, isLoading: false });
        } catch (error) {
          // token stale → clear state
          apiClient.setToken(String(undefined));
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      updateUser: async (userData) => {
        const res = await authService.updateProfile(userData);
        const updated = (res as any)?.user ?? (res as any);
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
      onRehydrateStorage: () => (state) => {
        try {
          const token = state?.token;
          if (token) {
            apiClient.setToken(token);
            // keep flags consistent without extra network calls
            useAuthStore.setState({ isAuthenticated: true });
            // If you prefer, you can also eagerly refetch:
            // useAuthStore.getState().fetchUser().catch(() => {});
          }
        } catch {}
      },
    }
  )
);

// —— Global 401 handler → nuke auth and let route guards redirect ——
apiClient.onUnauthorized(() => {
  apiClient.setToken(String(undefined));
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
});
