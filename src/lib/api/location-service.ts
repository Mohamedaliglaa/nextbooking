
import { apiClient } from './client';
import { AddressSuggestion, Coordinates } from '@/types/shared';

export const locationService = {
  async getAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 3) return [];
    
    const response = await apiClient.get<AddressSuggestion[]>('/locations/autocomplete', {
      query,
    });
    return response.data!;
  },

  async getCoordinates(address: string): Promise<Coordinates> {
    const response = await apiClient.get<Coordinates>('/locations/geocode', { address });
    return response.data!;
  },

  async getReverseGeocode(lat: number, lng: number): Promise<string> {
    const response = await apiClient.get<string>('/locations/reverse-geocode', { lat, lng });
    return response.data!;
  },

  async calculateRoute(origin: Coordinates, destination: Coordinates): Promise<{
    distance: number;
    duration: number;
    polyline: string;
  }> {
    const response = await apiClient.post<{
      distance: number;
      duration: number;
      polyline: string;
    }>('/locations/calculate-route', { origin, destination });
    return response.data!;
  },
};
