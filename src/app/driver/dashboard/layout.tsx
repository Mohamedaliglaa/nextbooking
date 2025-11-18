'use client';

import * as React from 'react';
import { DriverSidebar } from '@/components/driver/DriverSidebar';
import { DriverTopbar } from '@/components/driver/DriverTopbar';
import { RoleGuard } from '@/components/auth/RoleGuard';

/** Mise en page du tableau de bord chauffeur (FR) */
export default function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['driver']}>
      <div className="min-h-screen bg-gray-50">
      <DriverTopbar />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
            <div className="sticky top-[72px]">
              <DriverSidebar />
            </div>
          </aside>
          <main className="lg:col-span-9 xl:col-span-9">{children}</main>
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
