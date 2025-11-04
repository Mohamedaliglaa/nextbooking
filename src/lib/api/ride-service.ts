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
    return response.ride!;
  },

  async requestRide(rideRequest: RideRequest | GuestRideRequest): Promise<Ride> {
    const response = await apiClient.post<Ride>('/rides/request', rideRequest);
    return response.ride!;

  },

  async getRide(rideId: number): Promise<Ride> {
    const response = await apiClient.get<Ride>(`/rides/${rideId}`);
    return response.ride!;
  },

  async getCurrentRide(): Promise<Ride | null> {
    try {
      const response = await apiClient.get<Ride>('/rides/current');
      return response.ride || null;
    } catch (error) {
      return null;
    }
  },

  async cancelRide(rideId: number, reason?: string): Promise<Ride> {
    const response = await apiClient.post<Ride>(`/rides/${rideId}/cancel`, { 
      cancellation_reason: reason 
    });
    return response.ride!;
  },

  async getRideHistory(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ride>> {
    const response = await apiClient.get<PaginatedResponse<Ride>>('/rides/history', params);
    return response.ride!;
  },

  async getDriverRides(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ride>> {
    const response = await apiClient.get<PaginatedResponse<Ride>>('/driver/rides', params);
    return response.ride!;
  },

  async acceptRide(rideId: number): Promise<Ride> {
    const response = await apiClient.post<Ride>(`/driver/rides/${rideId}/accept`);
    return response.ride!;
  },

  async startRide(rideId: number): Promise<Ride> {
    const response = await apiClient.post<Ride>(`/driver/rides/${rideId}/start`);
    return response.ride!;
  },

  async completeRide(rideId: number): Promise<Ride> {
    const response = await apiClient.post<Ride>(`/driver/rides/${rideId}/complete`);
    return response.ride!;
  },

  async updateRideLocation(rideId: number, lat: number, lng: number): Promise<void> {
    await apiClient.post(`/rides/${rideId}/location`, { lat, lng });
  },

  async getActiveDrivers(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/rides/active-drivers');
    return response.ride!;
  },
};