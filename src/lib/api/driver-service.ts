// lib/api/driver-service.ts
import { apiClient } from './client';
import type { Driver, Vehicle, Location } from '@/types';

export const driverService = {
  // Create driver profile (multipart)
  async registerDriver(driverData: FormData): Promise<Driver> {
    const res = await apiClient.post<Driver>('/driver/register', driverData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data!;
  },

  // Read driver profile (includes relations: user, vehicle)
  async getDriverProfile(): Promise<Driver> {
    const res = await apiClient.get<Driver>('/driver/profile');
    return res.data!;
  },

  /**
   * IMPORTANT:
   * Your Laravel routes do NOT expose PUT /driver/profile.
   * To update user details (name/phone/image) use /user/profile (auth-service).
   * If you need to update driver-specific fields later, add a backend route and wire it here.
   */
  // async updateDriverProfile(driverData: Partial<Driver>): Promise<Driver> { ... }

  // Availability (PUT /driver/availability) — allowed: available | offline
  async updateAvailability(status: 'available' | 'offline'): Promise<Driver> {
    const res = await apiClient.put<Driver>('/driver/availability', { status });
    return res.data!;
  },

  // Location (POST /locations/update) — payload keys must be latitude/longitude
  async updateLocation(location: { lat: number; lng: number }): Promise<Location> {
    const res = await apiClient.post<Location>('/locations/update', {
      latitude: location.lat,
      longitude: location.lng,
    });
    return res.data!;
  },

  // Get current driver's vehicle via /driver/profile
  async getVehicle(): Promise<Vehicle | undefined> {
    const profile = await this.getDriverProfile();
    return (profile as any)?.vehicle;
  },

  // Update a vehicle (PUT /vehicles/:id)
  async updateVehicle(vehicleId: number, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const res = await apiClient.put<Vehicle>(`/vehicles/${vehicleId}`, vehicleData);
    return res.data!;
  },
};
