import { Vehicle } from '@/types/api';
import { apiClient } from './client';

export const vehicleService = {
  async getVehicleTypes(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/vehicles/types');
    return response.data!;
  },

  async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.post<Vehicle>('/vehicles', vehicleData);
    return response.data!;
  },

  async updateVehicle(vehicleId: number, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.put<Vehicle>(`/vehicles/${vehicleId}`, vehicleData);
    return response.data!;
  },

  async deleteVehicle(vehicleId: number): Promise<void> {
    await apiClient.delete(`/vehicles/${vehicleId}`);
  },
};
