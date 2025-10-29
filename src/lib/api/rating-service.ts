import { apiClient } from './client';
import { PaginatedResponse, Rating } from '@/types/api';

export const ratingService = {
  async submitRating(rideId: number, rating: number, comment?: string): Promise<Rating> {
    const response = await apiClient.post<Rating>(`/ratings/ride/${rideId}`, {
      rating,
      comment,
    });
    return response.data!;
  },

  async getRatings(params?: {
    page?: number;
    per_page?: number;
    type?: 'given' | 'received';
  }): Promise<PaginatedResponse<Rating>> {
    const response = await apiClient.get<PaginatedResponse<Rating>>('/ratings', params);
    return response.data!;
  },

  async getDriverRatings(driverId: number, params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Rating>> {
    const response = await apiClient.get<PaginatedResponse<Rating>>(
      `/ratings/driver/${driverId}`,
      params
    );
    return response.data!;
  },
};
