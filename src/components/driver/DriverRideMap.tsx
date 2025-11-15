// components/driver/DriverRideMap.tsx
'use client';

import { useEffect, useRef } from 'react';
import type { Ride, RideStop } from '@/types/booking';
import { useLoadGoogleMaps } from '@/hooks/useLoadGoogleMaps';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export default function DriverRideMap({ ride }: { ride: Ride }) {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useLoadGoogleMaps(GOOGLE_API_KEY, ['marker']);

  useEffect(() => {
    if (!loaded || !ride || !ref.current) return;

    const g = (window as any).google as typeof google | undefined;
    if (!g) return;

    const pickup = { lat: Number(ride.pickup_lat), lng: Number(ride.pickup_lng) };
    const dropoff = { lat: Number(ride.dropoff_lat), lng: Number(ride.dropoff_lng) };
    const stops = (ride.stops ?? []) as RideStop[];

    const map = new g.maps.Map(ref.current, {
      center: pickup,
      zoom: 12,
    });

    const bounds = new g.maps.LatLngBounds();

    const addMarker = (pos: google.maps.LatLngLiteral, title: string) => {
      bounds.extend(pos);
      const Advanced = (g.maps.marker as any)?.AdvancedMarkerElement;
      if (Advanced) {
        new Advanced({ map, position: pos, title });
      } else {
        new g.maps.Marker({ map, position: pos, title });
      }
    };

    addMarker(pickup, 'Départ');
    stops.forEach((s, i) => {
      if (s?.lat && s?.lng) {
        addMarker({ lat: Number(s.lat), lng: Number(s.lng) }, `Étape ${i + 1}`);
      }
    });
    addMarker(dropoff, 'Arrivée');

    const path: google.maps.LatLngLiteral[] = [
      pickup,
      ...stops.filter(s => s?.lat && s?.lng).map(s => ({ lat: Number(s.lat!), lng: Number(s.lng!) })),
      dropoff,
    ];

    new g.maps.Polyline({
      map,
      path,
      strokeColor: '#2563eb',
      strokeOpacity: 0.9,
      strokeWeight: 4,
    });

    if (!bounds.isEmpty()) map.fitBounds(bounds);
  }, [loaded, ride]);

  return <div ref={ref} className="w-full h-64 rounded-lg border" />;
}

export function toGoogleMapsDirections(ride: Ride) {
  const enc = encodeURIComponent;
  const origin = enc(ride.pickup_location);
  const dest = enc(ride.dropoff_location);
  const waypoints = (ride.stops ?? [])
    .filter((s) => !!s?.location)
    .map((s) => enc(String(s.location)))
    .join('/');

  return `https://www.google.com/maps/dir/${origin}/${waypoints ? waypoints + '/' : ''}${dest}`;
}
