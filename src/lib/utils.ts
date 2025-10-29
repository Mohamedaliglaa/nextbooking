// lib/utils.ts
import { Coordinates } from '@/types/shared';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatCurrencyFromCents(amountCents: number, currency: string = 'EUR'): string {
  return formatCurrency(amountCents / 100, currency);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function calculateEstimatedFare(
  distance: number,
  duration: number,
  vehicleType: string,
  basePrices: { [key: string]: number }
): number {
  const basePrice = basePrices[vehicleType] || 15;
  const distanceRate = 1.5; // € per km
  const timeRate = 0.3; // € per minute
  
  const distanceCost = distance * distanceRate;
  const timeCost = duration * timeRate;
  
  return Math.max(basePrice, basePrice + distanceCost + timeCost);
}

export function calculateEstimatedFareCents(
  distance: number,
  duration: number,
  vehicleType: string,
  basePrices: { [key: string]: number }
): number {
  return Math.round(calculateEstimatedFare(distance, duration, vehicleType, basePrices) * 100);
}

export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('33')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+33${cleaned.slice(1)}`;
  }
  return `+${cleaned}`;
}

export function generateTransactionId(prefix: string = 'CASH'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9).toUpperCase()}_${Date.now()}`;
}