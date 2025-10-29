// lib/validations.ts
import { z } from 'zod';
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  phone_number: z.string().optional(),
  role: z.enum(['passenger', 'driver']).default('passenger'),
});

export const rideRequestSchema = z.object({
  pickup_location: z.string().min(1, 'L\'adresse de départ est requise'),
  dropoff_location: z.string().min(1, 'L\'adresse de destination est requise'),
  pickup_lat: z.number(),
  pickup_lng: z.number(),
  dropoff_lat: z.number(),
  dropoff_lng: z.number(),
  vehicle_type: z.enum(['berline', 'break', 'van']),
  passenger_count: z.number().min(1).max(8),
  is_scheduled: z.boolean().default(false),
  scheduled_at: z.string().optional(),
  stops: z.array(z.object({
    location: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    order: z.number(),
  })).default([]),
  estimated_distance: z.number().min(0),
  estimated_duration: z.number().min(0),
  estimated_fare: z.number().min(0),
  payment_method: z.enum(['cash', 'stripe']),
});

export const guestRideRequestSchema = rideRequestSchema.extend({
  guest_name: z.string().min(2, 'Le nom est requis'),
  guest_phone: z.string().min(1, 'Le téléphone est requis'),
  guest_email: z.string().email('Email invalide').optional(),
});

export const passengerInfoSchema = z.object({
  passenger_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  passenger_phone: z.string().min(1, 'Le téléphone est requis'),
  passenger_email: z.string().email('Email invalide').optional(),
});

export const promoCodeSchema = z.object({
  code: z.string().min(1, 'Le code promo est requis'),
});

export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RideRequestFormData = z.infer<typeof rideRequestSchema>;
export type GuestRideRequestFormData = z.infer<typeof guestRideRequestSchema>;
export type PassengerInfoFormData = z.infer<typeof passengerInfoSchema>;