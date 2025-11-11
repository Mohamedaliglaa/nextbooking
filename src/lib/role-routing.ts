// lib/role-routing.ts
import type { User } from '@/types/auth';

export type AppRole = 'driver' | 'passenger' | 'admin' | string | undefined | null;

/** Fallback when you only know the role (no full user object). */
export function routeForRole(role: AppRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'driver':
      // Without user details, send to driver dashboard; guards/pages will reroute if needed.
      return '/driver/dashboard';
    case 'passenger':
    default:
      return '/';
  }
}

/** Prefer this when you have the full user payload (with the driver relation). */
export function routeForUser(user: User | null | undefined): string {
  if (!user) return '/auth/login';

  if (user.role === 'admin') return '/admin';

  if (user.role === 'driver') {
    // No driver profile yet -> force to registration
    if (!user.driver) return '/driver/registration';
    // Has driver but not verified -> pending screen
    if (!user.driver.verified) return '/driver/pending';
    // Verified driver -> dashboard
    return '/driver/dashboard';
  }

  // passenger / default
  return '/';
}
