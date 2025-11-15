// src/components/driver/AvailabilityToggle.tsx
'use client';

import * as React from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { driverService } from '@/lib/api/driver-service';
import { Loader2 } from 'lucide-react';

type Status = 'available' | 'offline';

export function AvailabilityToggle() {
  const { user, fetchUser } = useAuthStore();
  const [status, setStatus] = React.useState<Status>('offline');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const s = (user?.driver?.availability_status as Status) || 'offline';
    setStatus(s);
  }, [user?.driver?.availability_status]);

  const update = async (next: Status) => {
    setLoading(true);
    try {
      await driverService.setAvailability(next); // sends { status: 'available'|'offline' }
      setStatus(next);
      await fetchUser();
    } finally {
      setLoading(false);
    }
  };

  const isOnline = status === 'available';

  return (
    <button
      onClick={() => update(isOnline ? 'offline' : 'available')}
      disabled={loading}
      className={[
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 border',
        isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700',
      ].join(' ')}
      title="Toggle availability"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <span className={['h-2.5 w-2.5 rounded-full', isOnline ? 'bg-green-500' : 'bg-gray-400'].join(' ')} />
      )}
      <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
    </button>
  );
}
