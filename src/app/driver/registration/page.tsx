// app/driver/registration/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/ui/FileInput';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { driverService } from '@/lib/api/driver-service';
import { useAuth } from '@/hooks/use-auth';
import { Shield, CheckCircle2, Star, Clock, X, Image as ImageIcon } from 'lucide-react';

type Preview = { url: string; name: string; size: number };

const MAX_MB = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function DriverRegistrationPage() {
  const router = useRouter();
  const { user, refreshUser, isAuthenticated, isLoading } = useAuth();

  const [licenseNumber, setLicenseNumber] = useState('');

  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<Preview | null>(null);

  const [idCardImage, setIdCardImage] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<Preview | null>(null);

  const [insuranceImage, setInsuranceImage] = useState<File | null>(null);
  const [insurancePreview, setInsurancePreview] = useState<Preview | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Guards & redirects
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user?.role !== 'driver') {
      router.replace('/');
      return;
    }

    if (user?.driver) {
      if (!user.driver.verified) router.replace('/driver/pending');
      else router.replace('/driver/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Validation helpers
  const validateImage = (file: File | null, label: string) => {
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
      toast.error(`${label}: le fichier doit être une image (JPG/PNG/WEBP).`);
      return false;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`${label}: taille maximale ${MAX_MB} Mo.`);
      return false;
    }
    return true;
  };

  const makePreview = (file: File): Preview => ({
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
  });

  // Pickers
  const onPickLicense = (file?: File | null) => {
    if (!file) return;
    if (!validateImage(file, 'Permis')) return;
    setLicenseImage(file);
    setLicensePreview(makePreview(file));
  };

  const onPickId = (file?: File | null) => {
    if (!file) return;
    if (!validateImage(file, "Pièce d'identité")) return;
    setIdCardImage(file);
    setIdCardPreview(makePreview(file));
  };

  const onPickInsurance = (file?: File | null) => {
    if (!file) return;
    if (!validateImage(file, "Attestation d’assurance")) return;
    setInsuranceImage(file);
    setInsurancePreview(makePreview(file));
  };

  const clearPreview = (which: 'license' | 'id' | 'insurance') => {
    if (which === 'license') {
      if (licensePreview?.url) URL.revokeObjectURL(licensePreview.url);
      setLicenseImage(null);
      setLicensePreview(null);
    } else if (which === 'id') {
      if (idCardPreview?.url) URL.revokeObjectURL(idCardPreview.url);
      setIdCardImage(null);
      setIdCardPreview(null);
    } else {
      if (insurancePreview?.url) URL.revokeObjectURL(insurancePreview.url);
      setInsuranceImage(null);
      setInsurancePreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (licensePreview?.url) URL.revokeObjectURL(licensePreview.url);
      if (idCardPreview?.url) URL.revokeObjectURL(idCardPreview.url);
      if (insurancePreview?.url) URL.revokeObjectURL(insurancePreview.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(
    () => !!licenseNumber && !!licenseImage && !!idCardImage && !!insuranceImage && !submitting,
    [licenseNumber, licenseImage, idCardImage, insuranceImage, submitting]
  );

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseNumber || !licenseImage || !idCardImage || !insuranceImage) {
      toast.error('Tous les champs sont obligatoires.');
      return;
    }

    const fd = new FormData();
    fd.append('license_number', licenseNumber);
    fd.append('license_image', licenseImage);
    fd.append('id_card_image', idCardImage);
    fd.append('insurance_image', insuranceImage);

    setSubmitting(true);
    try {
      await driverService.registerDriver(fd);
      toast.success('Profil chauffeur créé. Vérification en cours.');
      await refreshUser(); // user.driver now present (verified=false)
      router.replace('/driver/pending');
    } catch (err: any) {
      const msg =
        err?.errors
          ? Object.values(err.errors as Record<string, string[]>).flat().join(' ')
          : err?.message || 'Échec de l’envoi';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Avoid flashing while auth state resolves
  if (isLoading || (isAuthenticated && user?.role === 'driver' && !!user.driver)) {
    return null;
  }

  // UI
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-background via-blue-50/30 to-background px-4 sm:px-6 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-4 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-chart-3/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-chart-1/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left: Heading + Features */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent border border-border px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-4">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-chart-4" />
                Devenir chauffeur vérifié
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Complétez votre
                <span className="block text-transparent bg-gradient-to-r from-primary to-chart-3 bg-clip-text">
                  Profil Chauffeur
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Téléversez vos documents officiels pour activer votre compte chauffeur.
                Notre équipe vérifie rapidement vos informations.
              </p>
            </div>

            {/* Small features */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="p-1 sm:p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">Vérification sécurisée</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="p-1 sm:p-2 bg-chart-2/10 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">Traitement rapide</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="p-1 sm:p-2 bg-chart-1/10 rounded-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">Accès aux courses</span>
              </div>
            </div>
          </div>

          {/* Right: Form Card */}
          <div className="relative order-first lg:order-last">
            <div className="rounded-2xl shadow-xl border border-border/60 bg-white p-6 sm:p-8 max-w-lg mx-auto">
              <h2 className="text-xl font-semibold mb-1">Documents requis</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Formats acceptés: JPG, PNG, WEBP. Taille max: {MAX_MB} Mo par fichier.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* License number */}
                <div className="space-y-2">
                  <Label htmlFor="license_number">Numéro de permis</Label>
                  <Input
                    id="license_number"
                    placeholder="AA-123456"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                  />
                </div>

                {/* License image */}
                <div className="space-y-2">
                  <Label>Photo du permis</Label>
                  {!licensePreview ? (
                    <FileInput
                      label="Choisir un fichier"
                      accept="image/*"
                      onChange={(file) => onPickLicense(file as File)}
                    />
                  ) : (
                    <PreviewCard
                      preview={licensePreview}
                      onClear={() => clearPreview('license')}
                    />
                  )}
                </div>

                {/* ID card image */}
                <div className="space-y-2">
                  <Label>Pièce d’identité</Label>
                  {!idCardPreview ? (
                    <FileInput
                      label="Choisir un fichier"
                      accept="image/*"
                      onChange={(file) => onPickId(file as File)}
                    />
                  ) : (
                    <PreviewCard
                      preview={idCardPreview}
                      onClear={() => clearPreview('id')}
                    />
                  )}
                </div>

                {/* Insurance image */}
                <div className="space-y-2">
                  <Label>Attestation d’assurance</Label>
                  {!insurancePreview ? (
                    <FileInput
                      label="Choisir un fichier"
                      accept="image/*"
                      onChange={(file) => onPickInsurance(file as File)}
                    />
                  ) : (
                    <PreviewCard
                      preview={insurancePreview}
                      onClear={() => clearPreview('insurance')}
                    />
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={!canSubmit}>
                  {submitting ? 'Envoi…' : 'Envoyer pour vérification'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  En cliquant, vous confirmez l’authenticité de vos documents et acceptez nos conditions.
                </p>
              </form>
            </div>

            {/* Soft blobs */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 bg-chart-1/10 rounded-full blur-xl" />
            <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-20 h-20 sm:w-32 sm:h-32 bg-chart-4/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-8 sm:h-12 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
}

/** Small preview card with remove action */
function PreviewCard({
  preview,
  onClear,
}: {
  preview: { url: string; name: string; size: number };
  onClear: () => void;
}) {
  const kb = Math.round(preview.size / 1024);
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-accent/30">
      <div className="w-12 h-12 rounded-md overflow-hidden bg-accent flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{preview.name}</span>
        </div>
        <p className="text-xs text-muted-foreground">{kb} Ko</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs hover:bg-accent"
        aria-label="Supprimer le fichier"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
