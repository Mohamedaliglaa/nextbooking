import { apiClient } from './client';
import { PaginatedResponse, Ride } from '@/types';

export const driverRideService = {
  async listAvailable(params?: { page?: number; per_page?: number; vehicle_type?: string }): Promise<PaginatedResponse<Ride>> {
    const res = await apiClient.get<PaginatedResponse<Ride>>('/rides/available', params);
    return (res as any)?.data && Array.isArray((res as any).data.data)
      ? (res as any).data
      : (res as any);
  },

  async getActiveRide(): Promise<Ride | null> {
    try {
      const res = await apiClient.get<Ride>('/rides/active');
      return (res as any)?.data ?? (res as any)?.ride ?? (res as any);
    } catch {
      return null;
    }
  },

  async accept(rideId: number): Promise<Ride> {
    const res = await apiClient.post<{ message: string; ride: Ride }>(`/rides/${rideId}/accept`, {});
    return (res as any)?.ride ?? (res as any)?.data ?? (res as any);
  },

  async start(rideId: number): Promise<Ride> {
    const res = await apiClient.post<{ message: string; ride: Ride }>(`/rides/${rideId}/start`, {});
    return (res as any)?.ride ?? (res as any)?.data ?? (res as any);
  },

  async complete(rideId: number): Promise<Ride> {
    const res = await apiClient.post<{ message: string; ride: Ride }>(`/rides/${rideId}/complete`, {});
    return (res as any)?.ride ?? (res as any)?.data ?? (res as any);
  },

  async cancel(rideId: number, reason: string): Promise<Ride> {
    const res = await apiClient.post<{ message: string; ride: Ride }>(`/rides/${rideId}/cancel`, { cancellation_reason: reason });
    return (res as any)?.ride ?? (res as any)?.data ?? (res as any);
  },
};
