// lib/api/driver-service.ts
import { Driver } from '@/types';
import { apiClient } from './client';
import { Vehicle, Location } from '@/types/api';

export const driverService = {
  async registerDriver(driverData: {
    license_number: string;
    license_image?: string;
    id_card_image?: string;
    insurance_image?: string;
    vehicle_data: {
      plate_number: string;
      brand: string;
      model: string;
      color: string;
      year: number;
      type: string;
      vehicle_image?: string;
    };
  }): Promise<Driver> {
    const response = await apiClient.post<Driver>('/driver/register', driverData);
    return response.data!;
  },

  async getDriverProfile(): Promise<Driver> {
    const response = await apiClient.get<Driver>('/driver/profile');
    return response.data!;
  },

  async updateDriverProfile(driverData: Partial<Driver>): Promise<Driver> {
    const response = await apiClient.put<Driver>('/driver/profile', driverData);
    return response.data!;
  },

  async updateAvailability(status: 'available' | 'busy' | 'offline'): Promise<Driver> {
    const response = await apiClient.patch<Driver>('/driver/availability', { status });
    return response.data!;
  },

  async updateLocation(location: { lat: number; lng: number }): Promise<Location> {
    const response = await apiClient.post<Location>('/driver/location', location);
    return response.data!;
  },

  async getVehicle(): Promise<Vehicle> {
    const response = await apiClient.get<Vehicle>('/driver/vehicle');
    return response.data!;
  },

  async updateVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.put<Vehicle>('/driver/vehicle', vehicleData);
    return response.data!;
  },

  async getEarnings(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    const response = await apiClient.get<any>('/driver/earnings', params);
    return response.data!;
  },

  async getStatistics(): Promise<any> {
    const response = await apiClient.get<any>('/driver/statistics');
    return response.data!;
  },
};