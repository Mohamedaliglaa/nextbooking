// lib/api/admin-service.ts
import { apiClient } from './client';

/* ---------- Backend-shaped types ---------- */
// These mirror what your Laravel controllers actually return.

export type AdminStats = {
  total_users: number;
  total_drivers: number;
  active_rides: number;
  total_revenue: number;
  pending_verifications: number;
  active_emergencies: number;
  total_rides_today: number;
  revenue_today: number;
};

export type AdminUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'driver' | 'passenger' | string;
  is_active: boolean;
  created_at: string;
};

export type AdminDriver = {
  id: number;
  user_id: number;
  license_number: string;
  verified: boolean;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  // raw paths (relative) or full URLs depending on your controller
  license_image?: string | null;
  id_card_image?: string | null;
  insurance_image?: string | null;

  // if you added URL accessors on the model:
  license_url?: string | null;
  id_card_url?: string | null;
  insurance_url?: string | null;
};

export type AdminRide = {
  id: number;
  passenger_id: number;
  driver_id: number | null;
  status: string;
  // can arrive as string from DB → allow both to avoid runtime crashes with toFixed
  fare: number | string;
  created_at: string;
};

export type AdminPromotion = {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount?: number | null;
  min_ride_amount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
};

/* ---------- Service ---------- */

export const adminService = {
  // dashboard
  async getStats(): Promise<AdminStats> {
    // ApiClient.get<T> returns { message, data?: T }
    // Your controller returns { success, data, message }, so 'data' is where the stats live.
    const res = await apiClient.get<AdminStats>('/admin/dashboard');
    // Prefer the typed 'data' field; fall back to whole object if controller bypasses wrapper elsewhere.
    return (res.data as AdminStats) ?? (res as unknown as AdminStats);
  },

  // drivers
  async listDrivers(): Promise<AdminDriver[]> {
    const res = await apiClient.get<AdminDriver[]>('/admin/drivers');
    return (res.data as AdminDriver[]) ?? [];
  },

  async getDriver(id: number): Promise<AdminDriver> {
    const res = await apiClient.get<AdminDriver>(`/admin/drivers/${id}`);
    return (res.data as AdminDriver) ?? (res as unknown as AdminDriver);
  },

  async getDriverDocuments(
    id: number
  ): Promise<Pick<AdminDriver, 'license_image' | 'id_card_image' | 'insurance_image' | 'license_url' | 'id_card_url' | 'insurance_url'>> {
    const res = await apiClient.get<
      Pick<AdminDriver, 'license_image' | 'id_card_image' | 'insurance_image' | 'license_url' | 'id_card_url' | 'insurance_url'>
    >(`/admin/drivers/${id}/documents`);
    return (res.data as any) ?? (res as any);
  },

  async verifyDriver(id: number, verified: boolean): Promise<{ message: string }> {
    const res = await apiClient.put<{ message: string }>(`/admin/drivers/${id}/verify`, { verified });
    // your ApiClient returns { message, data? }, so just return the whole result cast
    return res as any;
  },

  // users
  async listUsers(): Promise<AdminUser[]> {
    const res = await apiClient.get<AdminUser[]>('/admin/users');
    return (res.data as AdminUser[]) ?? [];
  },

  async getUser(id: number): Promise<AdminUser> {
    const res = await apiClient.get<AdminUser>(`/admin/users/${id}`);
    return (res.data as AdminUser) ?? (res as unknown as AdminUser);
  },

  async createUser(
    payload: Partial<AdminUser> & { password?: string }
  ): Promise<{ message: string; user: AdminUser }> {
    const res = await apiClient.post<{ message: string; user: AdminUser }>(`/admin/users`, payload);
    return res as any;
  },

  async updateUser(
    id: number,
    payload: Partial<AdminUser>
  ): Promise<{ message: string; user: AdminUser }> {
    const res = await apiClient.put<{ message: string; user: AdminUser }>(`/admin/users/${id}`, payload);
    return res as any;
  },

  async deleteUser(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/users/${id}`);
    return res as any;
  },

  async toggleUserStatus(id: number): Promise<{ message: string; is_active: boolean }> {
    const res = await apiClient.put<{ message: string; is_active: boolean }>(`/admin/users/${id}/toggle-status`, {});
    return res as any;
  },

  // rides
  async listRides(): Promise<AdminRide[]> {
    const res = await apiClient.get<AdminRide[]>('/admin/rides');
    return (res.data as AdminRide[]) ?? [];
  },

  async getRide(id: number): Promise<AdminRide> {
    const res = await apiClient.get<AdminRide>(`/admin/rides/${id}`);
    return (res.data as AdminRide) ?? (res as unknown as AdminRide);
  },

  async getRideStatistics(): Promise<any> {
    const res = await apiClient.get<any>(`/admin/rides/statistics`);
    return (res.data as any) ?? (res as any);
  },

  // promotions
  async listPromotions(): Promise<AdminPromotion[]> {
    const res = await apiClient.get<AdminPromotion[]>('/admin/promotions');
    return (res.data as AdminPromotion[]) ?? [];
  },

  async createPromotion(
    payload: Partial<AdminPromotion>
  ): Promise<{ message: string; promotion: AdminPromotion }> {
    const res = await apiClient.post<{ message: string; promotion: AdminPromotion }>(
      '/admin/promotions',
      payload
    );
    return res as any;
  },

  async updatePromotion(
    id: number,
    payload: Partial<AdminPromotion>
  ): Promise<{ message: string; promotion: AdminPromotion }> {
    const res = await apiClient.put<{ message: string; promotion: AdminPromotion }>(
      `/admin/promotions/${id}`,
      payload
    );
    return res as any;
  },

  async deletePromotion(id: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/promotions/${id}`);
    return res as any;
  },
};
