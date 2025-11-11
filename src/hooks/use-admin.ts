// hooks/use-admin.ts
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminService, type AdminStats, type AdminDriver } from '@/lib/api/admin-service';

// tiny helper to avoid setState after unmount
function useMountedRef() {
  const ref = useRef(true);
  useEffect(() => () => { ref.current = false; }, []);
  return ref;
}

/** Stats */
export function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<unknown>(null);
  const mounted = useMountedRef();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await adminService.getStats();
      if (mounted.current) setData(s);
    } catch (e) {
      if (mounted.current) setError(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [mounted]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}

/** Drivers list + optimistic verify */
export function useAdminDrivers() {
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<unknown>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const mounted = useMountedRef();

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminService.listDrivers();
      if (mounted.current) setDrivers(list);
    } catch (e) {
      if (mounted.current) setError(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [mounted]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const verifyDriver = useCallback(async (id: number, verified: boolean) => {
    setVerifyingId(id);
    // optimistic update
    const prev = drivers;
    setDrivers((d) => d.map(x => x.id === id ? { ...x, verified } : x));
    try {
      await adminService.verifyDriver(id, verified);
    } catch (e) {
      // rollback on error
      setDrivers(prev);
      throw e;
    } finally {
      if (mounted.current) setVerifyingId(null);
    }
  }, [drivers, mounted]);

  const pending = useMemo(
    () => drivers.filter(d => !d.verified),
    [drivers]
  );

  return { drivers, pending, loading, error, refetch: fetchDrivers, verifyDriver, verifyingId };
}
