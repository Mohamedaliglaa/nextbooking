// src/lib/api/driver-service.ts
import { apiClient } from './client';
import { Driver, User } from '@/types';

export const driverService = {
  async getProfile(): Promise<Driver> {
    const res = await apiClient.get<Driver>('/driver/profile');
    return (res as any)?.data ?? (res as any);
  },

  async setAvailability(status: 'available' | 'offline'): Promise<{ message: string }> {
    // Backend expects { status }
    const res = await apiClient.put<{ message: string }>('/driver/availability', { status });
    return res as any;
  },

  async getEarnings(period: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<{
    period: string;
    total_earnings: number;
    total_rides: number;
    rides: any[];
  }> {
    const res = await apiClient.get(`/driver/earnings`, { period });
    return (res as any)?.data ?? (res as any);
  },
};
