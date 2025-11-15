// src/app/driver/dashboard/earnings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { driverService } from '@/lib/api/driver-service';
import { EarningsChart } from '@/components/driver/EarningsChart';

export default function DriverEarningsPage() {
  const [period, setPeriod] = useState<'day'|'week'|'month'|'all'>('month');
  const [data, setData] = useState<any>({ total_earnings: 0, total_rides: 0, rides: [] as any[] });

  useEffect(() => {
    (async () => {
      const res = await driverService.getEarnings(period);
      setData(res);
    })();
  }, [period]);

  const chart = (data.rides || []).slice(-10).map((r: any) => ({
    label: `#${r.id}`,
    value: Number(r.fare || 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-xl font-semibold">Earnings</h1>
        <div className="inline-flex rounded-lg border overflow-hidden">
          {(['day','week','month','all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'px-3 py-1.5 text-sm capitalize',
                p === period ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500">Total Earnings</p>
          <p className="mt-2 text-2xl font-bold">{Number(data.total_earnings).toFixed(2)} €</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500">Total Rides</p>
          <p className="mt-2 text-2xl font-bold">{data.total_rides ?? 0}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Earnings by Ride</h3>
        <div className="mt-3">
          <EarningsChart data={chart} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="font-semibold mb-3">Recent Rides</h3>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">From</th>
                <th className="text-left px-4 py-2">To</th>
                <th className="text-right px-4 py-2">Fare</th>
              </tr>
            </thead>
            <tbody>
              {(data.rides || []).slice(-20).reverse().map((r: any) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">#{r.id}</td>
                  <td className="px-4 py-2">{r.pickup_location}</td>
                  <td className="px-4 py-2">{r.dropoff_location}</td>
                  <td className="px-4 py-2 text-right">{Number(r.fare || 0).toFixed(2)} €</td>
                </tr>
              ))}
              {(!data.rides || !data.rides.length) && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
