// lib/api/stripe-service.ts
import { CheckoutSessionResponse, CheckoutSessionStatus } from '@/types';
import { apiClient } from './client';

// Works whether apiClient returns {data: ...} or already the payload
function pick<T = any>(resp: any): T {
  return (resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp) as T;
}

export const stripeService = {
  async createCheckoutSession(rideId: number): Promise<CheckoutSessionResponse> {
    const resp = await apiClient.post<CheckoutSessionResponse>(`/payments/ride/${rideId}/checkout-session`);
    const data = pick<CheckoutSessionResponse>(resp);
    // optional: sanity log
    console.log('checkout payload', data);
    return data;
  },

  async createPaymentIntent(rideId: number): Promise<CheckoutSessionResponse> {
    const resp = await apiClient.post<CheckoutSessionResponse>(`/payments/ride/${rideId}/intent`);
    return pick<CheckoutSessionResponse>(resp);
  },

  async processPayment(
    rideId: number,
    paymentData: {
      method: 'cash' | 'stripe' | 'wallet' | 'credit_card';
      transaction_id?: string;
      guest_phone?: string;
      payment_intent_id?: string;
    }
  ): Promise<any> {
    const resp = await apiClient.post(`/payments/ride/${rideId}/process`, paymentData);
    return pick(resp);
  },

// stripe-service.ts
 async verifyPaymentStatus(sessionId: string): Promise<CheckoutSessionStatus> {
    try {
      const resp = await apiClient.get<CheckoutSessionStatus>(
        `/payments/session/${encodeURIComponent(sessionId)}/status`
      );
      const data = pick<CheckoutSessionStatus>(resp);
      // sanity log
      console.log('verifyPaymentStatus payload:', data);
      return data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'An error occurred';
      throw new Error(msg);
    }
  },

};
