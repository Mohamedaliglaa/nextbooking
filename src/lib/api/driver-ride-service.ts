// lib/api/driver-ride-service.ts
import { apiClient } from './client';
import type { PaginatedResponse, Ride } from '@/types';

export const driverRideService = {
  async listAvailable(params?: {
    page?: number;
    per_page?: number;
    vehicle_type?: string;
  }): Promise<PaginatedResponse<Ride>> {
    // On laisse ApiClient gérer la requête, comme pour adminService
    const res = await apiClient.get<PaginatedResponse<Ride>>(
      '/rides/available',
      params
    );

    // Comme ton ApiClient est "axios-like", la vraie payload est dans res.data
    const payload = (res as any).data ?? res;

    console.log('[driverRideService.listAvailable] payload =', payload);

    // Ici on sait (grâce à ton JSON) que payload a bien la forme du paginator Laravel :
    // { current_page, data: [...], last_page, per_page, total, ... }
    return payload as PaginatedResponse<Ride>;
  },

  async getActiveRide(): Promise<Ride | null> {
    try {
      const res = await apiClient.get<Ride>('/rides/active');
      const payload = (res as any).data ?? res;
      // suivant ton backend, ça peut être { ride: {...} } ou juste le ride
      return (payload as any)?.ride ?? payload ?? null;
    } catch {
      return null;
    }
  },

  async accept(rideId: number): Promise<Ride> {
    const res = await apiClient.post<{ message: string; ride: Ride }>(
      `/rides/${rideId}/accept`,
      {}
    );
    const payload = (res as any).data ?? res;
    return (payload as any).ride ?? payload;
  },

  async start(rideId: number): Promise<Ride> {
    const res = await apiClient.post<{ message: string; ride: Ride }>(
      `/rides/${rideId}/start`,
      {}
    );
    const payload = (res as any).data ?? res;
    return (payload as any).ride ?? payload;
  },

  async complete(rideId: number): Promise<Ride> {
    const res = await apiClient.post<{ message: string; ride: Ride }>(
      `/rides/${rideId}/complete`,
      {}
    );
    const payload = (res as any).data ?? res;
    return (payload as any).ride ?? payload;
  },

  async cancel(rideId: number, reason: string): Promise<Ride> {
    const res = await apiClient.post<{ message: string; ride: Ride }>(
      `/rides/${rideId}/cancel`,
      { cancellation_reason: reason }
    );
    const payload = (res as any).data ?? res;
    return (payload as any).ride ?? payload;
  },
};
