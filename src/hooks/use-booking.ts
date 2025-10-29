// hooks/use-booking.ts
import { useState, useCallback } from 'react';
import { useBookingStore } from '@/lib/store/booking-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { rideService } from '@/lib/api/ride-service';
import { promotionService } from '@/lib/api/promotion-service';
import { 
  RideEstimation, 
  RideRequest, 
  GuestRideRequest,
  Ride,
  PassengerInfo 
} from '@/types/booking';
import { PromoCode } from '@/types/api';

export const useBooking = () => {
  const [isEstimating, setIsEstimating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const { 
    rideDetails, 
    passengerInfo, 
    paymentMethod, 
    currentRide, 
    promoCode,
    setRideDetails, 
    setPassengerInfo, 
    setPaymentMethod, 
    setCurrentRide, 
    setPromoCode,
    clearBooking 
  } = useBookingStore();
  
  const { isAuthenticated, user } = useAuthStore();
  const { setLoading, addToast } = useUIStore();

  const estimateRide = useCallback(async (estimationData: Partial<RideEstimation>) => {
    setIsEstimating(true);
    try {
      const estimation = await rideService.estimateRide(estimationData);
      setRideDetails(estimation);
      return estimation;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur d\'estimation',
        description: error.message || 'Impossible de calculer le trajet',
      });
      throw error;
    } finally {
      setIsEstimating(false);
    }
  }, [setRideDetails, addToast]);

  const requestRide = useCallback(async (rideRequest: RideRequest | GuestRideRequest): Promise<Ride> => {
    setIsRequesting(true);
    setLoading('ride', true);
    
    try {
      const ride = await rideService.requestRide(rideRequest);
      setCurrentRide(ride);
      
      addToast({
        type: 'success',
        title: 'Course demandée',
        description: 'Recherche d\'un chauffeur en cours...',
      });
      
      return ride;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de réservation',
        description: error.message || 'Impossible de créer la course',
      });
      throw error;
    } finally {
      setIsRequesting(false);
      setLoading('ride', false);
    }
  }, [setCurrentRide, setLoading, addToast]);

  const cancelRide = useCallback(async (rideId: number, reason?: string) => {
    setLoading('ride', true);
    try {
      const ride = await rideService.cancelRide(rideId, reason);
      setCurrentRide(ride);
      
      addToast({
        type: 'success',
        title: 'Course annulée',
        description: 'Votre course a été annulée avec succès',
      });
      
      return ride;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur d\'annulation',
        description: error.message || 'Impossible d\'annuler la course',
      });
      throw error;
    } finally {
      setLoading('ride', false);
    }
  }, [setCurrentRide, setLoading, addToast]);

  const validatePromoCode = useCallback(async (code: string, rideAmount?: number) => {
    try {
      const promo = await promotionService.validatePromoCode(code, rideAmount);
      setPromoCode(promo);
      
      if (promo.isValid) {
        addToast({
          type: 'success',
          title: 'Code promo appliqué',
          description: promo.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Code promo invalide',
          description: promo.message,
        });
      }
      
      return promo;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de validation',
        description: error.message || 'Impossible de valider le code promo',
      });
      throw error;
    }
  }, [setPromoCode, addToast]);

  const clearPromoCode = useCallback(() => {
    setPromoCode(null);
  }, [setPromoCode]);

  const refreshCurrentRide = useCallback(async () => {
    if (!currentRide) return;
    
    try {
      const ride = await rideService.getRide(currentRide.id);
      setCurrentRide(ride);
      return ride;
    } catch (error) {
      console.error('Failed to refresh ride:', error);
    }
  }, [currentRide, setCurrentRide]);

  return {
    // State
    rideDetails,
    passengerInfo,
    paymentMethod,
    currentRide,
    promoCode,
    isEstimating,
    isRequesting,
    isAuthenticated,
    user,
    
    // Actions
    estimateRide,
    requestRide,
    cancelRide,
    setRideDetails,
    setPassengerInfo,
    setPaymentMethod,
    setCurrentRide,
    validatePromoCode,
    clearPromoCode,
    refreshCurrentRide,
    clearBooking,
  };
};