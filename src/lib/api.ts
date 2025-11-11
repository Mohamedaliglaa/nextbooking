// lib/api.ts
import { 
  User, 
  Driver, 
  Vehicle, 
  Ride, 
  
  Location,
  Notification,
  Rating,
  EmergencyAlert,
  ApiResponse,
  ApiError,
  PaginatedResponse
} from '@/types/api';
import {
  RideRequest, 
  RideEstimation,
}from '@/types/booking';

import {
  Payment, 
  
}from '@/types/payment';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Une erreur est survenue',
          errors: data.errors,
          status: response.status
        } as ApiError;
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw {
          message: 'Erreur de connexion. Vérifiez votre connexion internet.',
          status: 0
        } as ApiError;
      }
      throw error;
    }
  }

  // 🔐 Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone_number?: string;
    role?: 'passenger' | 'driver';
  }): Promise<{ user: User; token: string }> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async googleAuthMobile(token: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/google/mobile', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async logout(): Promise<void> {
    return this.request('/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/user');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAccount(): Promise<void> {
    return this.request('/user/account', {
      method: 'DELETE',
    });
  }

  // 🚖 Rides
  async estimateRide(rideData: Partial<RideRequest>): Promise<RideEstimation> {
    // Note: Vous devrez créer cet endpoint dans votre API Laravel
    return this.request('/rides/estimate', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  }

async requestRide(rideData: RideRequest): Promise<{ ride: Ride; message: string }> {
  const response = await this.request<{ ride: Ride; message: string }>('/rides/request', {
    method: 'POST',
    body: JSON.stringify(rideData),
  });
  return response;
}

  async getActiveRide(): Promise<Ride | null> {
    return this.request('/rides/active');
  }

  async getRideHistory(): Promise<PaginatedResponse<Ride>> {
    return this.request('/rides/history');
  }

  async acceptRide(rideId: string): Promise<Ride> {
    return this.request(`/rides/${rideId}/accept`, {
      method: 'POST',
    });
  }

  async startRide(rideId: string): Promise<Ride> {
    return this.request(`/rides/${rideId}/start`, {
      method: 'POST',
    });
  }

  async completeRide(rideId: string): Promise<Ride> {
    return this.request(`/rides/${rideId}/complete`, {
      method: 'POST',
    });
  }

  async cancelRide(rideId: string, reason?: string): Promise<Ride> {
    return this.request(`/rides/${rideId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancellation_reason: reason }),
    });
  }

  // 💳 Payments
  

  async getPaymentHistory(): Promise<PaginatedResponse<Payment>> {
    return this.request('/payments/history');
  }

  async getPaymentDetails(paymentId: string): Promise<Payment> {
    return this.request(`/payments/${paymentId}`);
  }



  // 🗺️ Locations
  async updateLocation(locationData: {
    latitude: number;
    longitude: number;
    status?: string;
  }): Promise<Location> {
    return this.request('/locations/update', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async getNearbyDrivers(latitude: number, longitude: number, radius: number = 5): Promise<{
    drivers: Array<{
      id: string;
      user: User;
      vehicle: Vehicle;
      current_location: Location;
      distance: number;
    }>;
  }> {
    return this.request(`/locations/nearby-drivers?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  }

  async getDriverLocation(driverId: string): Promise<Location> {
    return this.request(`/locations/driver/${driverId}`);
  }

  // ⭐ Ratings
  async rateRide(rideId: string, ratingData: {
    rating: number;
    comment?: string;
  }): Promise<Rating> {
    return this.request(`/ratings/ride/${rideId}`, {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  async getUserRatings(userId: string): Promise<PaginatedResponse<Rating>> {
    return this.request(`/ratings/user/${userId}`);
  }

  // 🔔 Notifications
  async getNotifications(): Promise<PaginatedResponse<Notification>> {
    return this.request('/notifications');
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return this.request('/notifications/unread');
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // 🚨 Emergency
  async sendEmergencyAlert(alertData: {
    ride_id?: string;
    latitude: number;
    longitude: number;
    message?: string;
  }): Promise<EmergencyAlert> {
    return this.request('/emergency/alert', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  // 🚗 Driver-specific endpoints
  async registerDriver(driverData: {
    license_number: string;
    license_image: string;
    id_card_image: string;
    insurance_image: string;
    vehicle: {
      plate_number: string;
      brand: string;
      model: string;
      color: string;
      year: number;
      type: string;
      vehicle_image?: string;
    };
  }): Promise<Driver> {
    return this.request('/driver/register', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async updateDriverAvailability(status: 'available' | 'unavailable' | 'busy'): Promise<Driver> {
    return this.request('/driver/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability_status: status }),
    });
  }

  async getDriverEarnings(): Promise<{
    total_earnings: number;
    today_earnings: number;
    weekly_earnings: number;
    monthly_earnings: number;
    completed_rides: number;
  }> {
    return this.request('/driver/earnings');
  }

  async getDriverProfile(): Promise<Driver & { user: User; vehicle: Vehicle }> {
    return this.request('/driver/profile');
  }

  // Vehicle management
  async registerVehicle(vehicleData: Omit<Vehicle, 'id' | 'driver_id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    return this.request(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async getVehicle(vehicleId: string): Promise<Vehicle> {
    return this.request(`/vehicles/${vehicleId}`);
  }
}

export const apiService = new ApiService();