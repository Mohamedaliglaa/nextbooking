// lib/api/stripe-service.ts
import { apiClient } from '@/lib/api/client';
import { CheckoutSessionResponse, PaymentIntentResponse, ProcessPaymentRequest } from '@/types/payment';

export const stripeService = {
  async createCheckoutSession(rideId: number): Promise<CheckoutSessionResponse> {
    const response = await apiClient.post<CheckoutSessionResponse>(
      `/payments/ride/${rideId}/checkout-session`
    );
    return response.data!;
  },

  async createPaymentIntent(rideId: number): Promise<PaymentIntentResponse> {
    const response = await apiClient.post<PaymentIntentResponse>(
      `/payments/ride/${rideId}/payment-intent`
    );
    return response.data!;
  },

  async processPayment(rideId: number, paymentData: ProcessPaymentRequest) {
    const response = await apiClient.post(`/payments/ride/${rideId}/process`, paymentData);
    return response.data!;
  },

  async verifyPaymentStatus(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/payments/session/${sessionId}/status`);
    return response.data!;
  },
};