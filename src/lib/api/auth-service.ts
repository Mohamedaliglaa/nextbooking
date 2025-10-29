// lib/api/auth-service.ts
import { apiClient } from './client';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User 
} from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data!;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data!;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/user');
    return response.data!;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data!;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', userData);
    return response.data!;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, email: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation: password,
    });
  },
};