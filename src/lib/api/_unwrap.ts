// lib/api/_unwrap.ts
import type { ApiResponse } from '@/types/api';

/**
 * Accepts either:
 *  - plain payload (e.g. { user, token })
 *  - envelope payload (e.g. { data: { user, token }, message })
 * Returns the inner T consistently.
 */
export function unwrap<T>(raw: T | ApiResponse<T>): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as any)) {
    return (raw as ApiResponse<T>).data as T;
  }
  return raw as T;
}
