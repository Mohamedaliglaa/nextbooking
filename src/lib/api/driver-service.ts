// src/lib/api/driver-service.ts
import { apiClient } from './client';
import type { Driver, Ride } from '@/types';

// ----- Types publics -----

export type Availability = 'available' | 'offline';
export type DriverEarningsPeriod = 'day' | 'week' | 'month' | 'all';

export type DriverEarningsResp = {
  period: DriverEarningsPeriod;
  total_earnings: number;
  total_rides: number;
  rides: Ride[];
};

// ✅ Alias pour rester compatible avec ton store existant
export type DriverProfile = Driver;
export type EarningsSummary = DriverEarningsResp;

// ----- Service -----

export const driverService = {
  /** Profil chauffeur (inclut user/vehicle selon ton contrôleur) */
  async getProfile(): Promise<DriverProfile> {
    // GET /driver/profile -> renvoie directement l'objet driver
    const res = await apiClient.get<DriverProfile>('/driver/profile');
    return (res as any)?.data ?? (res as any);
  },

  /** Disponibilité chauffeur */
  async setAvailability(status: Availability): Promise<{ message: string }> {
    // PUT /driver/availability { status: 'available' | 'offline' }
    const res = await apiClient.put<{ message: string }>('/driver/availability', { status });
    return (res as any);
  },

  /** Gains chauffeur sur une période */
  async getEarnings(period: DriverEarningsPeriod = 'all'): Promise<DriverEarningsResp> {
    // GET /driver/earnings?period=day|week|month|all
    const res = await apiClient.get<DriverEarningsResp>('/driver/earnings', { period });
    return (res as any)?.data ?? (res as any);
  },

  /** Inscription/création du profil chauffeur (upload de documents) */
  async registerDriver(formData: FormData): Promise<{ message: string; driver: DriverProfile }> {
    // POST /driver/register (multipart/form-data)
    const res = await apiClient.post<{ message: string; driver: DriverProfile }>(
      '/driver/register',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return (res as any);
  },

  /** Mise à jour de la position pendant une course active */
  async updateLocation(lat: number, lng: number): Promise<{ message: string }> {
    // On récupère la course active pour savoir quel ID utiliser
    const active = await apiClient.get<Ride>('/rides/active').catch(() => null);
    const ride = (active as any)?.data ?? (active as any);
    if (!ride?.id) throw new Error('Aucune course active');

    const res = await apiClient.post<{ message: string }>(
      `/rides/${ride.id}/update-location`,
      { current_lat: lat, current_lng: lng }
    );
    return (res as any);
  },
};

export default driverService;
