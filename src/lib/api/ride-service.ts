// lib/api/ride-service.ts
import { PaginatedResponse } from '@/types';
import { apiClient } from './client';
import { 
  Ride, 
  RideRequest, 
  GuestRideRequest,
  RideEstimation,
} from '@/types/booking';

export const rideService = {
  async estimateRide(estimationData: Partial<RideEstimation>): Promise<RideEstimation> {
    const response = await apiClient.post<RideEstimation>('/rides/estimate', estimationData);
    return response.data!;
  },

  async requestRide(rideRequest: RideRequest | GuestRideRequest): Promise<Ride> {
    const response = await apiClient.post<Ride>('/rides/request', rideRequest);
    return response.data!;
  },

  async getRide(rideId: number): Promise<Ride> {
    const response = await apiClient.get<Ride>(`/rides/${rideId}`);
    return response.data!;
  },

  async getCurrentRide(): Promise<Ride | null> {
    try {
      const response = await apiClient.get<Ride>('/rides/current');
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  async cancelRide(rideId: number, reason?: string): Promise<Ride> {
    const response = await apiClient.post<Ride>(`/rides/${rideId}/cancel`, { 
      cancellation_reason: reason 
    });
    return response.data!;
  },

  async getRideHistory(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ride>> {
    const response = await apiClient.get<PaginatedResponse<Ride>>('/rides/history', params);
    return response.data!;
  },

  async getDriverRides(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ride>> {
    const response = await apiClient.get<PaginatedResponse<Ride>>('/driver/rides', params);
    return response.data!;
  },

  async acceptRide(rideId: number): Promise<Ride> {
    const response = await apiClient.post<Ride>(`/driver/rides/${rideId}/accept`);
    return response.data!;
  },

  async startRide(rideId: number): Promise<Ride> {
    const response = await apiClient.post<Ride>(`/driver/rides/${rideId}/start`);
    return response.data!;
  },

  async completeRide(rideId: number): Promise<Ride> {
    const response = await apiClient.post<Ride>(`/driver/rides/${rideId}/complete`);
    return response.data!;
  },

  async updateRideLocation(rideId: number, lat: number, lng: number): Promise<void> {
    await apiClient.post(`/rides/${rideId}/location`, { lat, lng });
  },

  async getActiveDrivers(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/rides/active-drivers');
    return response.data!;
  },
};