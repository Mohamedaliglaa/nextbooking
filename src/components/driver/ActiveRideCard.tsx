// src/components/driver/ActiveRideCard.tsx
'use client';

import { Ride } from '@/types';
import { driverRideService } from '@/lib/api/driver-ride-service';
import { useState } from 'react';
import { Loader2, Navigation, FlagTriangleRight, CheckCircle2, XCircle } from 'lucide-react';

export function ActiveRideCard({ ride: initial }: { ride: Ride }) {
  const [ride, setRide] = useState<Ride>(initial);
  const [loading, setLoading] = useState<string | null>(null);

  const doAction = async (type: 'start' | 'complete' | 'cancel') => {
    setLoading(type);
    try {
      let updated: Ride;
      if (type === 'start') updated = await driverRideService.start(ride.id);
      else if (type === 'complete') updated = await driverRideService.complete(ride.id);
      else updated = await driverRideService.cancel(ride.id, 'Cancelled by driver');
      setRide(updated);
    } finally {
      setLoading(null);
    }
  };

  const dirUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}&travelmode=driving`;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Active Ride #{ride.id}</h3>
        <span className="text-xs rounded-full px-2 py-0.5 border">
          {ride.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-3 grid gap-3 text-sm">
        <div>
          <p className="text-gray-500">Pickup</p>
          <a
            href={dirUrl(Number(ride.pickup_lat), Number(ride.pickup_lng))}
            target="_blank"
            className="text-blue-600 hover:underline break-words"
          >
            {ride.pickup_location}
          </a>
        </div>
        <div>
          <p className="text-gray-500">Dropoff</p>
          <a
            href={dirUrl(Number(ride.dropoff_lat), Number(ride.dropoff_lng))}
            target="_blank"
            className="text-blue-600 hover:underline break-words"
          >
            {ride.dropoff_location}
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div>Fare: <b>{Number(ride.fare).toFixed(2)} €</b></div>
          <div>Distance: <b>{Number(ride.distance).toFixed(2)} km</b></div>
          <div>Duration: <b>{ride.duration} min</b></div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ride.status === 'accepted' && (
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => doAction('start')}
            disabled={loading !== null}
          >
            {loading === 'start' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlagTriangleRight className="h-4 w-4" />}
            Start Ride
          </button>
        )}
        {ride.status === 'in_progress' && (
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            onClick={() => doAction('complete')}
            disabled={loading !== null}
          >
            {loading === 'complete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Complete
          </button>
        )}
        {['accepted', 'in_progress', 'requested'].includes(ride.status) && (
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border"
            onClick={() => doAction('cancel')}
            disabled={loading !== null}
          >
            {loading === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Cancel
          </button>
        )}
        <a
          href={dirUrl(Number(ride.pickup_lat), Number(ride.pickup_lng))}
          target="_blank"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
        >
          <Navigation className="h-4 w-4" />
          Open Maps
        </a>
      </div>
    </div>
  );
}
