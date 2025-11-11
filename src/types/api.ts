import { Driver, User } from "./auth";
import { Ride } from "./booking";

// types/api.ts
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  ride?: T;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Vehicle types
export interface Vehicle {
  id: number;
  driver_id: number;
  plate_number: string;
  brand: string;
  model: string;
  color: string;
  year: number;
  type: string;
  status: 'active' | 'inactive';
  vehicle_image?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  driver?: Driver;
}

// Location types
export interface Location {
  id: number;
  driver_id: number;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
  timestamp: string;
  
  // Relations
  driver?: Driver;
}

// Rating types
export interface Rating {
  id: number;
  ride_id: number;
  rater_id: number;
  rated_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  ride?: Ride;
  rater?: User;
  rated?: User;
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  data?: any;
  read: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
}

// Promotion types
export interface Promotion {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount?: number;
  min_ride_amount?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  code: string;
  isValid: boolean;
  discount: number;
  message: string;
}

// Emergency types
export interface EmergencyAlert {
  id: number;
  user_id: number;
  ride_id?: number;
  latitude: number;
  longitude: number;
  message?: string;
  status: 'active' | 'resolved';
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  ride?: Ride;
}

export type { User, Driver, Ride };
