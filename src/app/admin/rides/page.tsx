'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { adminService, type AdminRide } from '@/lib/api/admin-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const STATUS = ['requested','accepted','started','completed','canceled'];

export default function AdminRidesPage() {
  const [rides, setRides] = useState<AdminRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminService.listRides();
        if (!cancelled) setRides(list);
      } catch (e:any) {
        if (!cancelled) toast.error(e?.message || 'Chargement impossible');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rides.filter(r => {
      const okStatus = status === 'all' ? true : r.status === status;
      const okQ = !query || String(r.id).includes(query) || String(r.fare).includes(query);
      return okStatus && okQ;
    });
  }, [q, status, rides]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Courses</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Rechercher (id, tarif)…" className="max-w-xs" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Liste</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonRows />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune course.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((r) => (
                <li key={r.id} className="py-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Course</p>
                    <p className="text-sm font-medium">#{r.id}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground">Passager</p>
                    <p className="text-sm">{r.passenger_id}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Chauffeur</p>
                    <p className="text-sm">{r.driver_id ?? '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <p className="text-sm">{r.status}</p>
                  </div>
                  <div className="md:col-span-1">
                    <p className="text-xs text-muted-foreground">Tarif</p>
                    <p className="text-sm">
                    {Number(r.fare ?? 0).toFixed(2)} €
                    </p>                  
                </div>
                  <div className="md:col-span-2 flex items-center">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/rides/${r.id}`}>Détails</Link>
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
  return <div className="space-y-3">{[...Array(10)].map((_,i)=><div key={i} className="h-12 rounded bg-accent/50 animate-pulse" />)}</div>;
}
