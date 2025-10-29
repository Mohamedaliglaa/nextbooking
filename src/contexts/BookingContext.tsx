// contexts/BookingContext.tsx
'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { VehicleOption, Ride, BookingPassengerInfo, BookingPaymentInfo, BookingPromoCode } from '@/types/api';

// Interface locale pour les détails de course dans le contexte
interface BookingRideDetails {
  pickup_location: string;
  dropoff_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_type: string;
  vehicle?: VehicleOption;
  passenger_count: number;
  is_scheduled?: boolean;
  scheduled_at?: string;
  stops: string[]; // Maintenant requis
  estimated_distance: number;
  estimated_duration: number;
  estimated_fare: number;
}

interface BookingState {
  step: 'estimation' | 'confirmation' | 'payment' | 'completed';
  rideDetails: BookingRideDetails | null;
  passengerInfo: BookingPassengerInfo | null;
  paymentInfo: BookingPaymentInfo | null;
  promoCode: BookingPromoCode | null;
  currentRide: Ride | null;
}

type BookingAction =
  | { type: 'SET_ESTIMATION'; payload: BookingRideDetails }
  | { type: 'SET_PASSENGER_INFO'; payload: BookingPassengerInfo }
  | { type: 'SET_PAYMENT_METHOD'; payload: BookingPaymentInfo }
  | { type: 'SET_PROMO_CODE'; payload: BookingPromoCode }
  | { type: 'SET_CURRENT_RIDE'; payload: Ride }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'RESET_BOOKING' };

const initialState: BookingState = {
  step: 'estimation',
  rideDetails: null,
  passengerInfo: null,
  paymentInfo: null,
  promoCode: null,
  currentRide: null,
};

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case 'SET_ESTIMATION':
      return {
        ...state,
        rideDetails: action.payload,
        step: 'confirmation',
      };
    case 'SET_PASSENGER_INFO':
      return {
        ...state,
        passengerInfo: action.payload,
        step: 'payment',
      };
    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentInfo: action.payload,
      };
    case 'SET_PROMO_CODE':
      return {
        ...state,
        promoCode: action.payload,
      };
    case 'SET_CURRENT_RIDE':
      return {
        ...state,
        currentRide: action.payload,
        step: 'completed',
      };
    case 'NEXT_STEP':
      const steps: BookingState['step'][] = ['estimation', 'confirmation', 'payment', 'completed'];
      const currentIndex = steps.indexOf(state.step);
      return {
        ...state,
        step: steps[Math.min(currentIndex + 1, steps.length - 1)],
      };
    case 'PREVIOUS_STEP':
      const stepsPrev: BookingState['step'][] = ['estimation', 'confirmation', 'payment', 'completed'];
      const currentIndexPrev = stepsPrev.indexOf(state.step);
      return {
        ...state,
        step: stepsPrev[Math.max(currentIndexPrev - 1, 0)],
      };
    case 'RESET_BOOKING':
      return initialState;
    default:
      return state;
  }
};

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
} | null>(null);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};