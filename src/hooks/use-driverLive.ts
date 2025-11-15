// hooks/useDriverLive.ts
import { useEffect, useRef } from 'react';
import { driverService } from '@/lib/api/driver-service';
import { useDriverStore } from '@/lib/store/driver-store';

export function useDriverLive() {
  const { online, activeRide } = useDriverStore();
  const watchIdRef = useRef<number | null>(null);
  const lastTick = useRef<number>(0);

  useEffect(() => {
    // Only stream location if online OR actively on a ride
    const shouldWatch = online || !!activeRide;
    if (!shouldWatch) {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      return;
    }

    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - lastTick.current < 7000) return;
        lastTick.current = now;

        const { latitude, longitude } = pos.coords;
        try {
          await driverService.updateLocation(latitude, longitude);
        } catch {
          // ignore network errors; next tick will try again
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [online, activeRide]);
}
