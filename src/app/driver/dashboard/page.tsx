'use client';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function DriverDashboardPage() {
  return (
    <RoleGuard allow={['driver']}>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Tableau de bord chauffeur</h1>
        <p className="text-muted-foreground mt-2">Bienvenue !</p>
      </div>
    </RoleGuard>
  );
}
