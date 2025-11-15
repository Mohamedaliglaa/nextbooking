// hooks/use-booking.ts
import { useState, useCallback } from 'react';
import { useBookingStore } from '@/lib/store/booking-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { rideService } from '@/lib/api/ride-service';
import { useStripePayment } from './use-stripe-payment';
import { RideEstimation, RideRequest, GuestRideRequest, Ride } from '@/types/booking';

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
    clearBooking,
  } = useBookingStore();

  const { isAuthenticated, user } = useAuthStore();
  const { setLoading, addToast } = useUIStore();
  const { processCheckoutSession, processCashPayment, isProcessing } = useStripePayment();

  const requestRideWithPayment = useCallback(async (
    rideRequest: RideRequest | GuestRideRequest,
    paymentMethod: 'cash' | 'stripe'
  ): Promise<Ride> => {
    setIsRequesting(true);
    setLoading('ride', true);

    try {
      const ride = await rideService.requestRide({
        ...rideRequest,
        payment_method: paymentMethod,
      });

      setCurrentRide(ride);

      if (paymentMethod === 'stripe') {
        const sessionId = await processCheckoutSession(ride.id);
        if (sessionId) {
          localStorage.setItem(`stripe_session_${ride.id}`, sessionId);
        }
        return ride;
      } else {
        const guestPhone = !isAuthenticated && 'guest_phone' in rideRequest ? rideRequest.guest_phone : undefined;
        await processCashPayment(ride.id, guestPhone);

        addToast({
          type: 'success',
          title: 'Réservation confirmée',
          description: 'Votre course a été réservée. Paiement en espèces à la fin du trajet.',
        });

        return ride;
      }
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
  }, [setCurrentRide, setLoading, addToast, processCheckoutSession, processCashPayment, isAuthenticated]);

  const estimateRide = useCallback(async (estimationData: Partial<RideEstimation>) => {
    setIsEstimating(true);
    try {
      const estimation = await rideService.estimateRide(estimationData);
      setRideDetails(estimation);
      return estimation;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: "Erreur d'estimation",
        description: error.message || 'Impossible de calculer le trajet',
      });
      throw error;
    } finally {
      setIsEstimating(false);
    }
  }, [setRideDetails, addToast]);

  return {
    rideDetails,
    passengerInfo,
    paymentMethod,
    currentRide,
    promoCode,
    isEstimating,
    isRequesting,
    isProcessing,
    isAuthenticated,
    user,

    estimateRide,
    requestRideWithPayment,
    setRideDetails,
    setPassengerInfo,
    setPaymentMethod,
    setCurrentRide,
    setPromoCode,
    clearBooking,
  };
};
