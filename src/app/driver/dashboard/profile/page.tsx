// src/app/driver/dashboard/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { driverService } from '@/lib/api/driver-service';
import { driverRideService } from '@/lib/api/driver-ride-service';
import { Driver } from '@/types';
import Image from 'next/image';
import { toast } from 'sonner';

export default function DriverProfilePage() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rideId, setRideId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await driverService.getProfile();
        setDriver(d);
      } catch (e: any) {
        // ignore
      }
    })();
  }, []);

  const acceptById = async () => {
    if (!rideId) return;
    setLoading(true);
    try {
      await driverRideService.accept(Number(rideId));
      toast.success(`Ride #${rideId} accepted`);
      setRideId('');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to accept ride');
    } finally {
      setLoading(false);
    }
  };

  const mediaUrl = (p?: string | null) => (p ? (p.startsWith('http') ? p : `${process.env.NEXT_PUBLIC_API_URL}/storage/${p}`) : null);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver card */}
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">Driver</h3>
          <div className="mt-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden">
                {/* optional user profile image */}
              </div>
              <div>
                <p className="font-medium">{driver?.user?.first_name} {driver?.user?.last_name}</p>
                <p className="text-gray-600">{driver?.user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">Status: {driver?.availability_status}</p>
                <p className="text-xs text-gray-500">Verified: {driver?.verified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">Vehicle</h3>
          {driver?.vehicle ? (
            <div className="mt-3 text-sm">
              <p className="font-medium">{driver.vehicle.brand} {driver.vehicle.model} ({driver.vehicle.year})</p>
              <p className="text-gray-600">Plate: {driver.vehicle.plate_number}</p>
              <p className="text-gray-600 capitalize">Type: {driver.vehicle.type}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">No vehicle attached.</p>
          )}
        </div>

        {/* Quick accept */}
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">Quick Accept</h3>
          <p className="text-xs text-gray-600 mt-1">If dispatch gives you a ride ID, you can accept it here.</p>
          <div className="mt-3 flex gap-2">
            <input
              value={rideId}
              onChange={(e) => setRideId(e.target.value)}
              placeholder="Enter ride ID"
              className="flex-1 px-3 py-2 rounded-lg border"
            />
            <button
              onClick={acceptById}
              disabled={!rideId || loading}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Accepting...' : 'Accept'}
            </button>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Documents</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['license_image','id_card_image','insurance_image'] as const).map((k) => {
            const url = mediaUrl((driver as any)?.[k]);
            return (
              <div key={k} className="rounded-lg border p-3">
                <p className="text-xs text-gray-600 mb-2">{k.replace('_', ' ')}</p>
                {url ? (
                  <div className="relative w-full aspect-video bg-gray-50 overflow-hidden rounded-md">
                    <Image src={url} alt={k} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-gray-50 rounded-md grid place-items-center text-xs text-gray-500">
                    Not uploaded
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
