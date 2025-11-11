'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminService, type AdminDriver } from '@/lib/api/admin-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/* ---------- API docs shape (may include nulls + *_url) ---------- */
type DriverDocsApi = {
  license_image?: string | null;
  id_card_image?: string | null;
  insurance_image?: string | null;
  license_url?: string | null;
  id_card_url?: string | null;
  insurance_url?: string | null;
};

/* ---------- UI state shape (strings only, no nulls) ---------- */
type DriverDocs = {
  license_image?: string;
  id_card_image?: string;
  insurance_image?: string;
};

/* ---------- Helpers ---------- */
function toPublicUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  // Base URL to your Laravel app files (adjust if needed)
  const base = process.env.NEXT_PUBLIC_API_FILES_BASE ?? 'http://localhost:8000';

  // Typical Laravel public path: "storage/..."
  if (path.startsWith('storage/')) return `${base}/${path}`;

  // Fallback: ensure /storage prefix
  return `${base}/storage/${path.replace(/^\/+/, '')}`;
}

function normalizeDocs(api: DriverDocsApi): DriverDocs {
  return {
    license_image: toPublicUrl(api.license_url ?? api.license_image),
    id_card_image: toPublicUrl(api.id_card_url ?? api.id_card_image),
    insurance_image: toPublicUrl(api.insurance_url ?? api.insurance_image),
  };
}

/* ---------- Page ---------- */
export default function AdminDriverDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [driver, setDriver] = useState<AdminDriver | null>(null);
  const [docs, setDocs] = useState<DriverDocs>({});
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, files] = await Promise.all([
          adminService.getDriver(id),
          adminService.getDriverDocuments(id),
        ]);
        if (!cancelled) {
          setDriver(d);
          setDocs(normalizeDocs(files)); // ✅ normalize before setState
        }
      } catch (e: any) {
        if (!cancelled) toast.error(e?.message || 'Chargement impossible');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const doVerify = async (ok: boolean) => {
    if (!driver) return;
    setVerifying(true);
    try {
      await adminService.verifyDriver(driver.id, ok);
      setDriver({ ...driver, verified: ok });
      toast.success(ok ? 'Chauffeur vérifié' : 'Vérification retirée');
    } catch (e: any) {
      toast.error(e?.message || 'Action impossible');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <Skeleton />;

  if (!driver) return <p className="text-sm text-muted-foreground">Introuvable.</p>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chauffeur #{driver.id}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Retour
          </Button>
          <Button onClick={() => doVerify(true)} disabled={verifying}>
            Valider
          </Button>
          <Button variant="destructive" onClick={() => doVerify(false)} disabled={verifying}>
            Refuser
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Info
            label="Nom"
            value={`${driver.user?.first_name ?? ''} ${driver.user?.last_name ?? ''}`}
          />
          <Info label="Email" value={driver.user?.email ?? ''} />
          <Info label="Numéro de permis" value={driver.license_number} />
          <Info label="Statut vérification" value={driver.verified ? 'Vérifié' : 'En attente'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Doc label="Permis" url={docs.license_image} />
          <Doc label="Pièce d’identité" url={docs.id_card_image} />
          <Doc label="Assurance" url={docs.insurance_image} />
        </CardContent>
      </Card>
    </section>
  );
}

/* ---------- Presentational ---------- */
function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  );
}

function Doc({ label, url }: { label: string; url?: string }) {
  return (
    <div className="border rounded-md p-3">
      <p className="text-sm font-medium mb-2">{label}</p>
      {url ? (
        <a className="text-primary underline break-all" href={url} target="_blank" rel="noreferrer">
          Voir le document
        </a>
      ) : (
        <p className="text-xs text-muted-foreground">Non fourni</p>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-10 rounded bg-accent/50 animate-pulse" />
      ))}
    </div>
  );
}
