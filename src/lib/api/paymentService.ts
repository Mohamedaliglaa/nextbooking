// lib/api/paymentService.ts
import { apiService } from './apiService';

export interface PaymentIntentResponse {
  clientSecret: string;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  amount: number;
  currency: string;
  status: string;
  reused?: boolean;
}

export interface ProcessPaymentRequest {
  method: 'cash' | 'wallet' | 'stripe' | 'credit_card';
  transaction_id?: string;
  guest_phone?: string;
  payment_intent_id?: string;
}

export interface ProcessPaymentResponse {
  payment: any;
  message: string;
}

export interface CheckoutSessionResponse {
  clientSecret: string;
  checkoutSessionId: string;
  amount: number;
  currency: string;
}

export interface CheckoutSessionStatus {
  status: string;
  payment_status: string;
  payment_intent_status: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  payment_id: number;
  ride_id: number;
}

class PaymentService {
  /**
   * Create Stripe Checkout Session (Recommended)
   */
  async createCheckoutSession(rideId: number, returnUrl?: string): Promise<CheckoutSessionResponse> {
    const response = await apiService.request<CheckoutSessionResponse>(
      `/payments/ride/${rideId}/checkout-session`,
      {
        method: 'POST',
        body: JSON.stringify({
          return_url: returnUrl,
        }),
      }
    );

    return response;
  }

  /**
   * Get Checkout Session status
   */
  async getCheckoutSessionStatus(sessionId: string): Promise<CheckoutSessionStatus> {
    const response = await apiService.request<CheckoutSessionStatus>(
      `/payments/checkout-session-status?session_id=${sessionId}`,
      {
        method: 'GET',
      }
    );

    return response;
  }

  /**
   * Create Payment Intent (Legacy - keep for compatibility)
   */
  async createPaymentIntent(rideId: number, receiptEmail?: string): Promise<PaymentIntentResponse> {
    const response = await apiService.request<PaymentIntentResponse>(
      `/payments/ride/${rideId}/intent`,
      {
        method: 'POST',
        body: JSON.stringify({
          receipt_email: receiptEmail,
        }),
      }
    );

    return response;
  }

  /**
   * Process payment (cash, wallet, etc.)
   */
  async processPayment(rideId: number, paymentData: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const response = await apiService.request<ProcessPaymentResponse>(
      `/payments/ride/${rideId}/process`,
      {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }
    );

    return response;
  }

  /**
   * Get payment history
   */
  async getPaymentHistory() {
    return apiService.request('/payments/history');
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: number) {
    return apiService.request(`/payments/${paymentId}`);
  }

  /**
   * Get guest payment history
   */
  async getGuestPaymentHistory(guestPhone: string, guestEmail: string) {
    return apiService.request('/guest/payment-history', {
      method: 'POST',
      body: JSON.stringify({
        guest_phone: guestPhone,
        guest_email: guestEmail,
      }),
    });
  }

  /**
   * Test Stripe connection
   */
  async testStripeConnection() {
    return apiService.request('/test-stripe');
  }
}

export const paymentService = new PaymentService();