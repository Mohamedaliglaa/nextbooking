'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { adminService, type AdminPromotion } from '@/lib/api/admin-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<AdminPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPromotion | null>(null);
  const [form, setForm] = useState<Partial<AdminPromotion>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    is_active: true,
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminService.listPromotions();
        if (!cancelled) setItems(list);
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
    if (!query) return items;
    return items.filter(p =>
      `${p.code} ${p.description ?? ''}`.toLowerCase().includes(query)
    );
  }, [q, items]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      is_active: true,
      valid_from: '',
      valid_until: '',
    });
    setOpen(true);
  };

  const openEdit = (p: AdminPromotion) => {
    setEditing(p);
    setForm(p);
    setOpen(true);
  };

  const onSave = async () => {
    try {
      if (editing) {
        const res = await adminService.updatePromotion(editing.id, form);
        setItems(list => list.map(x => x.id === editing.id ? res.promotion : x));
        toast.success(res.message || 'Promotion mise à jour');
      } else {
        const res = await adminService.createPromotion(form);
        setItems(list => [res.promotion, ...list]);
        toast.success(res.message || 'Promotion créée');
      }
      setOpen(false);
    } catch (e:any) {
      toast.error(e?.message || 'Action impossible');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Supprimer cette promotion ?')) return;
    try {
      await adminService.deletePromotion(id);
      setItems(list => list.filter(x => x.id !== id));
      toast.success('Promotion supprimée');
    } catch (e:any) {
      toast.error(e?.message || 'Suppression impossible');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Promotions</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Rechercher (code, description)…" className="max-w-xs" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button onClick={openCreate}>Créer</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Liste</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonRows />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune promotion.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((p) => (
                <li key={p.id} className="py-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground">Code</p>
                    <p className="text-sm font-medium">{p.code}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm">{p.discount_type} ({p.discount_value})</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-muted-foreground">Validité</p>
                    <p className="text-sm">{p.valid_from} → {p.valid_until}</p>
                  </div>
                  <div className="md:col-span-1">
                    <p className="text-xs text-muted-foreground">Actif</p>
                    <p className="text-sm">{p.is_active ? 'Oui' : 'Non'}</p>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={()=>openEdit(p)}>Modifier</Button>
                    <Button size="sm" variant="destructive" onClick={()=>onDelete(p.id)}>Supprimer</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la promotion' : 'Créer une promotion'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={form.code ?? ''} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))}/>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description ?? ''} onChange={(e)=>setForm(f=>({...f, description:e.target.value}))}/>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={String(form.discount_type ?? 'percentage')} onValueChange={(v)=>setForm(f=>({...f, discount_type: v as any}))}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed">Fixe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valeur</Label>
                <Input type="number" value={Number(form.discount_value ?? 0)} onChange={(e)=>setForm(f=>({...f, discount_value:Number(e.target.value)}))}/>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valide du</Label>
                <Input type="date" value={form.valid_from?.slice(0,10) ?? ''} onChange={(e)=>setForm(f=>({...f, valid_from:e.target.value}))}/>
              </div>
              <div className="space-y-2">
                <Label>Au</Label>
                <Input type="date" value={form.valid_until?.slice(0,10) ?? ''} onChange={(e)=>setForm(f=>({...f, valid_until:e.target.value}))}/>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Actif</Label>
              <Switch checked={!!form.is_active} onCheckedChange={(v)=>setForm(f=>({...f, is_active: v}))}/>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Annuler</Button>
            <Button onClick={onSave}>{editing ? 'Enregistrer' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SkeletonRows() {
  return <div className="space-y-3">{[...Array(8)].map((_,i)=><div key={i} className="h-12 rounded bg-accent/50 animate-pulse" />)}</div>;
}
