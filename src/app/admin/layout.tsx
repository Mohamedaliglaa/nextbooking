// app/admin/layout.tsx
'use client';

import React from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['admin']}>
      <div className="min-h-screen from-background via-blue-50/30 to-background">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="border-r bg-white lg:sticky lg:top-0 lg:h-screen">
            <AdminSidebar />
          </aside>

          {/* Main area */}
          <div className="flex min-h-screen flex-col">
            {/* Topbar */}
            <AdminTopbar />

            {/* Content */}
            <main className={cn('px-4 sm:px-6 py-6')}>
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
