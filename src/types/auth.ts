import { Vehicle } from ".";

// types/auth.ts
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_image?: string;
  role: 'passenger' | 'driver' | 'admin';
  rating?: number;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  driver?: Driver;
}

export interface Driver {
  id: number;
  user_id: number;
  license_number: string;
  license_image?: string;
  id_card_image?: string;
  insurance_image?: string;
  availability_status: 'available' | 'busy' | 'offline';
  verified: boolean;
  total_rides: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  vehicle?: Vehicle;
  current_location?: Location;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  role?: 'passenger' | 'driver';
}

export interface GuestUser {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
}