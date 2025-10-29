// lib/api/payment-service.ts
import { PaginatedResponse } from '@/types';
import { apiClient } from './client';
import { 
  Payment, 
  CheckoutSessionResponse, 
  CheckoutSessionStatus,
  PaymentIntentResponse,
  ProcessPaymentRequest
} from '@/types/payment';

export const paymentService = {
  async createCheckoutSession(rideId: number): Promise<CheckoutSessionResponse> {
    const response = await apiClient.post<CheckoutSessionResponse>(
      `/payments/ride/${rideId}/checkout-session`
    );
    return response.data!;
  },

  async getCheckoutSessionStatus(sessionId: string): Promise<CheckoutSessionStatus> {
    const response = await apiClient.get<CheckoutSessionStatus>(
      `/payments/session/${sessionId}/status`
    );
    return response.data!;
  },

  async createPaymentIntent(rideId: number): Promise<PaymentIntentResponse> {
    const response = await apiClient.post<PaymentIntentResponse>(
      `/payments/ride/${rideId}/payment-intent`
    );
    return response.data!;
  },

  async processPayment(rideId: number, paymentData: ProcessPaymentRequest): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `/payments/ride/${rideId}/process`,
      paymentData
    );
    return response.data!;
  },

  async getPayment(paymentId: number): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/${paymentId}`);
    return response.data!;
  },

  async getRidePayment(rideId: number): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/ride/${rideId}`);
    return response.data!;
  },

  async getPaymentHistory(params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/payments/history', params);
    return response.data!;
  },

  async requestRefund(paymentId: number, reason: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(`/payments/${paymentId}/refund`, { reason });
    return response.data!;
  },
};