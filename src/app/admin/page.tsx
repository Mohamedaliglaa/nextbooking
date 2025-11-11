// app/admin/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { adminService, type AdminDriver, type AdminStats } from '@/lib/api/admin-service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CarFront, ShieldCheck, Banknote, TimerReset, Check, X } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, d] = await Promise.all([adminService.getStats(), adminService.listDrivers()]);
        setStats(s);
        setDrivers(d);
      } catch (e: any) {
        toast.error(e?.message || 'Impossible de charger le tableau de bord');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pending = useMemo(
    () => drivers.filter((d) => !d.verified).slice(0, 6),
    [drivers]
  );

  const handleVerify = async (id: number, ok: boolean) => {
    try {
      setVerifying(id);
      await adminService.verifyDriver(id, ok);
      setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, verified: ok } : d)));
      toast.success(ok ? 'Chauffeur vérifié' : 'Vérification retirée');
    } catch (e: any) {
      toast.error(e?.message || 'Action impossible');
    } finally {
      setVerifying(null);
    }
  };

  return (
    <section>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI icon={<Users className="h-5 w-5" />} label="Utilisateurs" value={loading ? '—' : (stats?.total_users ?? 0)} />
        <KPI icon={<CarFront className="h-5 w-5" />} label="Chauffeurs" value={loading ? '—' : (stats?.total_drivers ?? 0)} />
        <KPI icon={<ShieldCheck className="h-5 w-5" />} label="Vérifs en attente" value={loading ? '—' : (stats?.pending_verifications ?? 0)} />
        <KPI icon={<TimerReset className="h-5 w-5" />} label="Courses" value={loading ? '—' : (stats?.total_rides_today ?? 0)} />
        <KPI icon={<Banknote className="h-5 w-5" />} label="Revenus (€)" value={loading ? '—' : (stats?.total_revenue ?? 0).toLocaleString()} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Pending verifications */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vérifications en attente</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/drivers">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonRows />
            ) : pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune vérification en attente.</p>
            ) : (
              <ul className="divide-y">
                {pending.map((d) => (
                  <li key={d.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {d.user?.first_name} {d.user?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{d.user?.email}</p>
                      <p className="text-xs text-muted-foreground">Permis: {d.license_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/drivers/${d.id}`}>Voir</Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(d.id, true)}
                        disabled={verifying === d.id}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" /> Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerify(d.id, false)}
                        disabled={verifying === d.id}
                        className="gap-1"
                      >
                        <X className="h-4 w-4" /> Refuser
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickLink href="/admin/users" title="Gérer les utilisateurs" desc="Activer, rôles, création…" />
            <QuickLink href="/admin/drivers" title="Vérifier les chauffeurs" desc="Consulter documents, valider" />
            <QuickLink href="/admin/rides" title="Suivre les courses" desc="Historique et états" />
            <QuickLink href="/admin/promotions" title="Promotions" desc="Créer et gérer des codes" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">{icon}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
        <div className="mt-3 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <div className="rounded-lg border p-3 hover:bg-accent transition">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={href}>Ouvrir</Link>
        </Button>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 w-full rounded-md bg-accent/50 animate-pulse" />
      ))}
    </div>
  );
}
