import { User } from ".";
import { Ride } from "./booking";

// types/payment.ts
export interface Payment {
  id: number;
  ride_id: number;
  passenger_id?: number;
  amount: number;
  currency: string;
  method: 'cash' | 'stripe' | 'credit_card' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  stripe_charge_id?: string;
  payment_metadata?: any;
  gateway_payload?: any;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  ride?: Ride;
  passenger?: User;
}
export interface CheckoutSessionResponse {
  clientSecret: string;
  checkoutSessionId: string;
  amount: number;   // cents
  currency: string; // e.g., "eur"
  successUrl?: string; // may be included by backend
  cancelUrl?: string;  // may be included by backend
}
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  reused?: boolean;
}

// In your types.ts file
export interface CheckoutSessionStatus {
  status: string;
  payment_status: string;
  payment_intent_status?: string;
  customer_name?: string;
  customer_email?: string;
  amount_total: number;
  currency: string;
  payment_id?: number;
  ride_id?: number;
  payment_updated?: boolean;
  email_sent?: boolean;      
}

export interface ProcessPaymentRequest {
  method: 'cash' | 'wallet' | 'stripe' | 'credit_card';
  transaction_id?: string;
  guest_phone?: string;
  payment_intent_id?: string;
}