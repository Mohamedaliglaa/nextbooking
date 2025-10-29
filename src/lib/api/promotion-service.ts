import { apiClient } from './client';
import { Promotion, PromoCode, PaginatedResponse } from '@/types/api';

export const promotionService = {
  async validatePromoCode(code: string, rideAmount?: number): Promise<PromoCode> {
    const response = await apiClient.post<PromoCode>('/promotions/validate', {
      code,
      ride_amount: rideAmount,
    });
    return response.data!;
  },

  async getPromotions(params?: {
    page?: number;
    per_page?: number;
    active_only?: boolean;
  }): Promise<PaginatedResponse<Promotion>> {
    const response = await apiClient.get<PaginatedResponse<Promotion>>('/promotions', params);
    return response.data!;
  },
};