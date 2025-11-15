// types/booking.ts
import { Vehicle, PromoCode } from "./api";
import { User } from "./auth";
import { Payment } from "./payment";

/** allow strings or structured stops in estimation */
export type StopInput = string | { location?: string; address?: string; lat?: number | null; lng?: number | null; latitude?: number | null; longitude?: number | null };

export interface VehicleOption {
  id: string;
  name: string;
  icon: string;
  capacity: number;
  basePrice: number;
  type: 'berline' | 'break' | 'van';
}

export interface RideStop {
  location: string;
  lat?: number | null;
  lng?: number | null;
  order: number;
}

export interface Ride {
  id: number;
  passenger_id?: number | null;
  driver_id?: number | null;
  vehicle_id?: number | null;
  pickup_location: string;
  dropoff_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  stops?: RideStop[] | null;
  fare: number;
  distance: number;
  duration: number;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'cash' | 'stripe';
  cancellation_reason?: string | null;
  cancellation_fee?: number | null;
  is_scheduled: boolean;
  scheduled_at?: string | null;
  requested_at?: string | null;
  accepted_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  created_at: string;
  updated_at: string;

  passenger?: User | null;
  driver?: User | null;
  vehicle?: Vehicle | null;
  payments?: Payment[] | null;
}

export interface RideRequest {
  pickup_location: string;
  dropoff_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_type: 'standard' | 'premium' | 'van' | 'berline' | 'break';
  passenger_count: number;
  is_scheduled: boolean;
  scheduled_at?: string;
  stops: Array<{ location: string; lat?: number | null; lng?: number | null }>;
  estimated_distance: number;
  estimated_duration: number;
  estimated_fare: number;
  payment_method: 'cash' | 'stripe';
}

export interface GuestRideRequest extends RideRequest {
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
}

export interface RideEstimation {
  pickup_location: string;
  dropoff_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_type: string;
  vehicle?: VehicleOption;
  passenger_count: number;
  is_scheduled: boolean;
  scheduled_at?: string;
  stops: StopInput[]; // <—
  estimated_distance: number;
  estimated_duration: number;
  estimated_fare: number;
}

export interface PassengerInfo {
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
}

export interface BookingState {
  rideDetails: RideEstimation | null;
  passengerInfo: PassengerInfo | null;
  paymentMethod: 'cash' | 'credit_card' | null;
  currentRide: Ride | null;
  promoCode: PromoCode | null;
}
