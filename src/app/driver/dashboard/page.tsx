// src/app/driver/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/driver/StatCard';
import { EarningsChart } from '@/components/driver/EarningsChart';
import { driverService } from '@/lib/api/driver-service';
import { driverRideService } from '@/lib/api/driver-ride-service';
import { ActiveRideCard } from '@/components/driver/ActiveRideCard';
import { CheckCircle2, Clock, Route as RouteIcon, Wallet } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

export default function DriverDashboardPage() {
  const { user } = useAuthStore();
  const [earnings, setEarnings] = useState<{ total_earnings: number; total_rides: number }>({ total_earnings: 0, total_rides: 0 });
  const [activeRide, setActiveRide] = useState<any>(null);
  const [chart, setChart] = useState<Array<{ label: string; value: number }>>([]);

  useEffect(() => {
    // earnings snapshot (month by default)
    (async () => {
      const e = await driverService.getEarnings('month');
      setEarnings({ total_earnings: Number(e.total_earnings || 0), total_rides: Number(e.total_rides || 0) });
      // simple fake “last 7 rides” chart from returned rides if any
      const items = (e.rides || []).slice(-7).map((r: any, idx: number) => ({
        label: `#${(r?.id ?? idx)}`,
        value: Number(r?.fare ?? 0),
      }));
      setChart(items.length ? items : [
        { label: 'Mon', value: 0 },
        { label: 'Tue', value: 0 },
        { label: 'Wed', value: 0 },
        { label: 'Thu', value: 0 },
        { label: 'Fri', value: 0 },
        { label: 'Sat', value: 0 },
        { label: 'Sun', value: 0 },
      ]);
    })();

    // active ride
    (async () => {
      const r = await driverRideService.getActiveRide();
      setActiveRide(r);
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Welcome, {user?.first_name ?? 'Driver'} 👋</h1>
        <p className="text-sm text-gray-600">Manage your trips, earnings and profile in one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="This Month" value={`${earnings.total_earnings.toFixed(2)} €`} hint="Total earnings" icon={<Wallet className="h-4 w-4 text-blue-600" />} />
        <StatCard title="Completed" value={earnings.total_rides} hint="Rides completed" icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} tone="success" />
        <StatCard title="Online Status" value={user?.driver?.availability_status ?? 'offline'} hint="Tap toggle in topbar" icon={<Clock className="h-4 w-4 text-yellow-600" />} tone="warning" />
        <StatCard title="Vehicle" value={user?.driver?.vehicle?.model ? `${user.driver.vehicle.brand} ${user.driver.vehicle.model}` : '—'} hint={user?.driver?.vehicle?.plate_number ?? ''} icon={<RouteIcon className="h-4 w-4 text-gray-600" />} />
      </div>

      {/* Chart + Active Ride */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Earnings</h3>
          </div>
          <div className="mt-3">
            <EarningsChart data={chart} />
          </div>
        </div>

        <div className="lg:col-span-1">
          {activeRide ? (
            <ActiveRideCard ride={activeRide} />
          ) : (
            <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-600">
              No active ride. When you accept a ride, it will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
