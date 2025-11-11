'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminService, type AdminUser } from '@/lib/api/admin-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<AdminUser>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await adminService.getUser(id);
        if (!cancelled) {
          setUser(u);
          setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, role: u.role });
        }
      } catch (e:any) {
        if (!cancelled) toast.error(e?.message || 'Chargement impossible');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const onSave = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const res = await adminService.updateUser(user.id, {
        first_name: form.first_name ?? user.first_name,
        last_name: form.last_name ?? user.last_name,
        email: form.email ?? user.email,
        role: (form.role as any) ?? user.role,
      });
      setUser(res.user);
      toast.success(res.message || 'Mise à jour réussie');
    } catch (e:any) {
      toast.error(e?.message || 'Mise à jour impossible');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!user) return;
    if (!confirm('Supprimer cet utilisateur ?')) return;
    setBusy(true);
    try {
      await adminService.deleteUser(user.id);
      toast.success('Utilisateur supprimé');
      router.replace('/admin/users');
    } catch (e:any) {
      toast.error(e?.message || 'Suppression impossible');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton />;

  if (!user) return <p className="text-sm text-muted-foreground">Introuvable.</p>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Utilisateur #{user.id}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>Retour</Button>
          <Button variant="destructive" onClick={onDelete} disabled={busy}>Supprimer</Button>
          <Button onClick={onSave} disabled={busy}>Enregistrer</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input value={form.first_name ?? ''} onChange={(e)=>setForm(f=>({...f, first_name:e.target.value}))}/>
          </div>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={form.last_name ?? ''} onChange={(e)=>setForm(f=>({...f, last_name:e.target.value}))}/>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Email</Label>
            <Input type="email" value={form.email ?? ''} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))}/>
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label>Rôle</Label>
            <Select value={String(form.role ?? user.role)} onValueChange={(v: any)=>setForm(f=>({...f, role:v as any}))}>
              <SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="passenger">Passenger</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label>Statut</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.is_active ? 'Actif' : 'Inactif'}</span>
              <Button
                size="sm"
                variant={user.is_active ? 'destructive' : 'default'}
                onClick={async ()=>{
                  try {
                    const res = await adminService.toggleUserStatus(user.id);
                    setUser(u=>u ? { ...u, is_active: res.is_active } : u);
                    toast.success(res.message || 'Statut mis à jour');
                  } catch (e:any) {
                    toast.error(e?.message || 'Action impossible');
                  }
                }}
              >
                {user.is_active ? 'Désactiver' : 'Activer'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Skeleton() {
  return <div className="space-y-3">{[...Array(6)].map((_,i)=><div key={i} className="h-10 rounded bg-accent/50 animate-pulse" />)}</div>;
}
