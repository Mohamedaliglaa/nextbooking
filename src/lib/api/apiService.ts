// lib/api/apiService.ts

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
  payment_method: 'cash' | 'credit_card' | 'wallet';
  passenger_name: string;
  passenger_phone: string;
  passenger_email?: string;
}

export interface RideStop {
  location: string;
  lat: number;
  lng: number;
  order: number;
}

export interface RideResponse {
  ride: {
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
    fare: number;
    status: string;
    payment_status: string;
    estimated_distance: number;
    estimated_duration: number;
    vehicle_type: string;
    passenger_count: number;
    scheduled_at?: string;
    created_at: string;
    updated_at: string;
    stops?: RideStop[];
  };
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          message: 'Network error occurred'
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Ride management
  async requestRide(rideData: RideRequest): Promise<RideResponse> {
    return this.request<RideResponse>('/rides/request', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  }

  async getRide(rideId: number) {
    return this.request(`/rides/${rideId}`);
  }

  async getActiveRide() {
    return this.request('/rides/active');
  }

  async getRideHistory() {
    return this.request('/rides/history');
  }

  async cancelRide(rideId: number) {
    return this.request(`/rides/${rideId}/cancel`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();