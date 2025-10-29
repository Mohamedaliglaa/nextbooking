// lib/store/booking-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  RideEstimation, 
  PassengerInfo, 
  Ride,
  BookingState 
} from '@/types/booking';
import { PromoCode } from '@/types/api';

interface BookingStore extends BookingState {
  // Actions
  setRideDetails: (details: RideEstimation) => void;
  setPassengerInfo: (info: PassengerInfo) => void;
  setPaymentMethod: (method: 'cash' | 'credit_card') => void;
  setCurrentRide: (ride: Ride | null) => void;
  setPromoCode: (promo: PromoCode | null) => void;
  clearBooking: () => void;
  reset: () => void;
}

const initialState: BookingState = {
  rideDetails: null,
  passengerInfo: null,
  paymentMethod: null,
  currentRide: null,
  promoCode: null,
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRideDetails: (details) => set({ rideDetails: details }),
      
      setPassengerInfo: (info) => set({ passengerInfo: info }),
      
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      
      setCurrentRide: (ride) => set({ currentRide: ride }),
      
      setPromoCode: (promo) => set({ promoCode: promo }),
      
      clearBooking: () => set({
        rideDetails: null,
        passengerInfo: null,
        paymentMethod: null,
        promoCode: null,
      }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'booking-storage',
      partialize: (state) => ({
        rideDetails: state.rideDetails,
        passengerInfo: state.passengerInfo,
        paymentMethod: state.paymentMethod,
        promoCode: state.promoCode,
      }),
    }
  )
);