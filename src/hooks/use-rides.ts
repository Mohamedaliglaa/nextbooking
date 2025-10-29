import { useState, useCallback } from 'react';
import { useUIStore } from '@/lib/store/ui-store';
import { rideService } from '@/lib/api/ride-service';
import { Ride } from '@/types/booking';
import { PaginatedResponse } from '@/types';

export const useRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addToast } = useUIStore();

  const fetchRideHistory = useCallback(async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }) => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse<Ride> = await rideService.getRideHistory(params);
      setRides(response.data);
      setPagination({
        currentPage: response.current_page,
        totalPages: response.last_page,
        totalItems: response.total,
        perPage: response.per_page,
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de chargement',
        description: error.message || 'Impossible de charger l\'historique',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchDriverRides = useCallback(async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }) => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse<Ride> = await rideService.getDriverRides(params);
      setRides(response.data);
      setPagination({
        currentPage: response.current_page,
        totalPages: response.last_page,
        totalItems: response.total,
        perPage: response.per_page,
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de chargement',
        description: error.message || 'Impossible de charger les courses',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  return {
    rides,
    pagination,
    isLoading,
    fetchRideHistory,
    fetchDriverRides,
  };
};