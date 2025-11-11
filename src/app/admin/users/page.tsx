'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { adminService, type AdminUser } from '@/lib/api/admin-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminService.listUsers();
        if (!cancelled) setUsers(list);
      } catch (e: any) {
        if (!cancelled) toast.error(e?.message || 'Chargement impossible');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return users;
    return users.filter(u =>
      `${u.first_name} ${u.last_name} ${u.email} ${u.role}`.toLowerCase().includes(query)
    );
  }, [q, users]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Utilisateurs</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Rechercher (nom, email, rôle)…"
            className="max-w-xs"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button asChild>
            <Link href="/admin/users/new">Créer</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonRows />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun utilisateur.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((u) => (
                <li key={u.id} className="py-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <p className="text-sm font-medium">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-muted-foreground break-all">{u.email}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground">Rôle</p>
                    <div className="mt-0.5">
                      <Badge variant="secondary">{u.role}</Badge>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <p className="text-sm">{u.is_active ? 'Actif' : 'Inactif'}</p>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/users/${u.id}`}>Détails</Link>
                    </Button>
                    <ToggleStatusButton
                      id={u.id}
                      current={u.is_active}
                      onDone={(next) =>
                        setUsers(list => list.map(x => x.id === u.id ? { ...x, is_active: next } : x))
                      }
                    />
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

function ToggleStatusButton({ id, current, onDone }: { id: number; current: boolean; onDone: (v:boolean)=>void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant={current ? 'destructive' : 'default'}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await adminService.toggleUserStatus(id);
          onDone(res.is_active);
          toast.success(res.message || 'Statut mis à jour');
        } catch (e:any) {
          toast.error(e?.message || 'Action impossible');
        } finally {
          setBusy(false);
        }
      }}
    >
      {current ? 'Désactiver' : 'Activer'}
    </Button>
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
