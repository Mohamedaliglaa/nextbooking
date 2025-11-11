// lib/api/auth-service.ts
import { apiClient } from './client';
import { unwrap } from './_unwrap';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const raw = await apiClient.post<AuthResponse>('/login', credentials);
    const res = unwrap<AuthResponse>(raw);
    if (res?.token) apiClient.setToken(res.token);
    return res;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const payload = {
      first_name: userData.first_name?.trim(),
      last_name: userData.last_name?.trim(),
      email: userData.email?.trim().toLowerCase(),
      phone_number: userData.phone_number?.trim(),                 // required by backend
      password: userData.password,
      password_confirmation: userData.password_confirmation ?? userData.password,
      role: userData.role ?? 'passenger',
    };
    const raw = await apiClient.post<AuthResponse>('/register', payload);
    const res = unwrap<AuthResponse>(raw);
    if (res?.token) apiClient.setToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try { await apiClient.post('/logout'); }
    finally { apiClient.clearToken(); }
  },

  async getCurrentUser(): Promise<User> {
    const raw = await apiClient.get<User>('/user');
    return unwrap<User>(raw);
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const raw = await apiClient.put<{ user: User; message?: string }>('/user/profile', userData);
    const res = unwrap<{ user: User; message?: string }>(raw);
    return res.user;
  },
};
