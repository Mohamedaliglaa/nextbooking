import { Vehicle, PromoCode } from "./api";
import { User } from "./auth";
import { Payment } from "./payment";

// types/booking.ts
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
  lat?: number;
  lng?: number;
  order: number;
}

export interface Ride {
  id: number;
  passenger_id?: number;
  driver_id?: number;
  vehicle_id?: number;
  pickup_location: string;
  dropoff_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  stops?: RideStop[];
  fare: number;
  distance: number;
  duration: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'cash' | 'card' | 'stripe';
  cancellation_reason?: string;
  cancellation_fee?: number;
  is_scheduled: boolean;
  scheduled_at?: string;
  requested_at?: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  passenger?: User;
  driver?: User;
  vehicle?: Vehicle;
  payments?: Payment[];
}

export interface RideRequest {
  pickup_location: string;
  dropoff_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_type: string;
  passenger_count: number;
  is_scheduled: boolean;
  scheduled_at?: string;
  stops: RideStop[];
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
  stops: string[];
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