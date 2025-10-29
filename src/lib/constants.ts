import { VehicleOption } from "@/types/booking";
import { PaymentOption, TimeOption } from "@/types/shared";

// lib/constants.ts
export const VEHICLES: VehicleOption[] = [
  { 
    id: 'berline', 
    name: 'Berline', 
    icon: "/vehicles/berline.png", 
    capacity: 4, 
    basePrice: 15,
    type: 'berline'
  },
  { 
    id: 'break', 
    name: 'Break', 
    icon: "/vehicles/break.png", 
    capacity: 4, 
    basePrice: 20,
    type: 'break'
  },
  { 
    id: 'van', 
    name: 'Van', 
    icon: "/vehicles/van.png", 
    capacity: 7, 
    basePrice: 25,
    type: 'van'
  },
];

export const TIME_OPTIONS: TimeOption[] = [
  { value: 'now', label: 'Maintenant', icon: 'clock' },
  { value: 'scheduled', label: 'Planifier', icon: 'calendar' },
];

export const PAYMENT_METHODS: PaymentOption[] = [
  { 
    value: 'cash', 
    label: 'Paiement en espèces', 
    description: 'Payez à la fin du trajet',
    icon: 'wallet'
  },
  { 
    value: 'credit_card', 
    label: 'Carte bancaire', 
    description: 'Paiement sécurisé Stripe',
    icon: 'credit-card'
  },
];

export const RIDE_STATUSES = {
  pending: { label: 'En attente', color: 'yellow' },
  accepted: { label: 'Acceptée', color: 'blue' },
  in_progress: { label: 'En cours', color: 'green' },
  completed: { label: 'Terminée', color: 'gray' },
  cancelled: { label: 'Annulée', color: 'red' },
} as const;

export const PAYMENT_STATUSES = {
  pending: { label: 'En attente', color: 'yellow' },
  paid: { label: 'Payée', color: 'green' },
  failed: { label: 'Échouée', color: 'red' },
  refunded: { label: 'Remboursée', color: 'blue' },
} as const;

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  retries: 3,
} as const;

export const MAP_CONFIG = {
  defaultZoom: 13,
  defaultCenter: { lat: 48.8566, lng: 2.3522 }, // Paris
  boundsPadding: 0.02,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  BOOKING_STATE: 'booking-storage',
  USER_PREFERENCES: 'user-preferences',
} as const;