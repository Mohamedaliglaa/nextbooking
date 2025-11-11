// app/admin/drivers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { adminService, type AdminDriver } from '@/lib/api/admin-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [filtered, setFiltered] = useState<AdminDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminService.listDrivers();
        if (!cancelled) {
          setDrivers(list);
          setFiltered(list);
        }
      } catch (e: any) {
        if (!cancelled) toast.error(e?.message || 'Chargement impossible');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const query = q.trim().toLowerCase();
    if (!query) return setFiltered(drivers);
    setFiltered(
      drivers.filter(d =>
        `${d.user?.first_name ?? ''} ${d.user?.last_name ?? ''} ${d.user?.email ?? ''} ${d.license_number ?? ''}`
          .toLowerCase()
          .includes(query)
      )
    );
  }, [q, drivers]);

  const handleVerify = async (id: number, ok: boolean) => {
    setVerifyingId(id);
    const prev = drivers;
    setDrivers(d => d.map(x => x.id === id ? ({ ...x, verified: ok }) : x));
    setFiltered(f => f.map(x => x.id === id ? ({ ...x, verified: ok }) : x));
    try {
      await adminService.verifyDriver(id, ok);
      toast.success(ok ? 'Chauffeur vérifié' : 'Vérification retirée');
    } catch (e: any) {
      setDrivers(prev);
      setFiltered(prev);
      toast.error(e?.message || 'Action impossible');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chauffeurs</h1>
        <Input
          placeholder="Rechercher (nom, email, permis)…"
          className="max-w-xs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonRows />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun chauffeur.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((d) => (
                <li key={d.id} className="py-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <p className="text-sm font-medium">{d.user?.first_name} {d.user?.last_name}</p>
                    <p className="text-xs text-muted-foreground break-all">{d.user?.email}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground">Permis</p>
                    <p className="text-sm">{d.license_number}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <p className="text-sm">{d.verified ? 'Vérifié' : 'En attente'}</p>
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/drivers/${d.id}`}>Détails</Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleVerify(d.id, true)}
                      disabled={verifyingId === d.id}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" /> Valider
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleVerify(d.id, false)}
                      disabled={verifyingId === d.id}
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
    </section>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-12 w-full rounded-md bg-accent/50 animate-pulse" />
      ))}
    </div>
  );
}
