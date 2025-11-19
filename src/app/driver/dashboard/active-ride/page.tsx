// app/driver/active-ride/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { driverRideService } from '@/lib/api/driver-ride-service';
import { driverService } from '@/lib/api/driver-service';
import type { Ride } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Mail,
  Clock,
  Car,
  User,
  Route,
  Flag,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

type StatusView = 'idle' | 'loading' | 'loaded' | 'empty' | 'error';

// Helper Google Maps
function buildMapsUrl(
  address: string | null | undefined,
  lat?: number | null,
  lng?: number | null
) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  const query = encodeURIComponent(address ?? '');
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function DriverActiveRidePage() {
  const [ride, setRide] = useState<Ride | null>(null);
  const [statusView, setStatusView] = useState<StatusView>('loading');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔁 Récupération de la course active en utilisant driverRideService
  const fetchActiveRide = useCallback(async () => {
    setStatusView('loading');
    setError(null);
    try {
      const current = await driverRideService.getActiveRide();
      if (!current) {
        setRide(null);
        setStatusView('empty');
        return;
      }
      setRide(current);
      setStatusView('loaded');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Impossible de récupérer la course active.';
      setError(msg);
      setStatusView('error');
      toast.error(msg);
    }
  }, []);

  useEffect(() => {
    fetchActiveRide();
  }, [fetchActiveRide]);

  const openMaps = (
    address: string | null | undefined,
    lat?: number | null,
    lng?: number | null
  ) => {
    const url = buildMapsUrl(address, lat, lng);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleStart = async () => {
    if (!ride) return;
    setActionLoading(true);
    try {
      const updated = await driverRideService.start(ride.id);
      setRide(updated);
      toast.success('Course démarrée');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Impossible de démarrer la course.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!ride) return;
    setActionLoading(true);
    try {
      const updated = await driverRideService.complete(ride.id);
      setRide(updated);
      toast.success('Course terminée');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Impossible de terminer la course.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!ride) return;
    const reason =
      window.prompt('Motif de l’annulation (obligatoire) :')?.trim() ?? '';
    if (!reason) return;

    setActionLoading(true);
    try {
      const updated = await driverRideService.cancel(ride.id, reason);
      setRide(updated);
      toast.success('Course annulée');
      setTimeout(() => {
        fetchActiveRide();
      }, 500);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Impossible d'annuler la course.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!ride) return;
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }

    setActionLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // 🔁 On utilise driverService.updateLocation qui appelle /rides/active/update-location
          await driverService.updateLocation(
            pos.coords.latitude,
            pos.coords.longitude
          );
          toast.success('Position envoyée au passager.');
        } catch (e: any) {
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            "Impossible d'envoyer la position.";
          toast.error(msg);
        } finally {
          setActionLoading(false);
        }
      },
      (err) => {
        console.error(err);
        toast.error("Impossible de récupérer la position GPS.");
        setActionLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const statusLabel = (s?: string | null) => {
    switch (s) {
      case 'requested':
        return 'Demandée';
      case 'accepted':
        return 'Acceptée';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return s ?? 'Inconnue';
    }
  };

  const canStart = ride && ride.status === 'accepted';
  const canComplete = ride && ride.status === 'in_progress';
  const canCancel =
    ride && ['requested', 'accepted', 'in_progress'].includes(ride.status ?? '');

  // UI selon l’état global
  if (statusView === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Chargement de votre course active...
      </div>
    );
  }

  if (statusView === 'empty') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Aucune course en cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Vous n’avez actuellement aucune course active.{' '}
              <br />
              Rendez-vous dans la liste des{' '}
              <strong>courses disponibles</strong> pour en accepter une.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusView === 'error') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center border-red-200 bg-red-50/40">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchActiveRide}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ride) return null; // sécurité

  const passengerName =
    (ride as any)?.passenger?.full_name ||
    (ride as any)?.passenger?.name ||
    ride.guest_name ||
    'Passager';

  const passengerPhone =
    (ride as any)?.passenger?.phone || ride.guest_phone || null;
  const passengerEmail =
    (ride as any)?.passenger?.email || ride.guest_email || null;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <header className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-xl font-semibold">Course active</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Suivez et gérez toutes les étapes de la course.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">
          <Car className="h-3 w-3" />
          Course #{ride.id} • {statusLabel(ride.status)}
        </span>
      </header>

      {/* Timeline simple des statuts */}
      <div className="flex items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 shadow-sm text-xs">
        {[
          { key: 'accepted', label: 'Acceptée' },
          { key: 'in_progress', label: 'En cours' },
          { key: 'completed', label: 'Terminée' },
        ].map((step, idx, arr) => {
          const isDone =
            ride.status === 'completed' ||
            (step.key === 'accepted' &&
              ['accepted', 'in_progress', 'completed'].includes(
                ride.status ?? ''
              )) ||
            (step.key === 'in_progress' &&
              ['in_progress', 'completed'].includes(ride.status ?? ''));
          const isCurrent =
            !isDone &&
            ((step.key === 'accepted' && ride.status === 'accepted') ||
              (step.key === 'in_progress' && ride.status === 'in_progress') ||
              (step.key === 'completed' && ride.status === 'completed'));
          return (
            <div key={step.key} className="flex-1 flex items-center gap-2">
              <div
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-full border text-[11px]',
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-400',
                ].join(' ')}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span
                className={[
                  'text-[11px] font-medium',
                  isDone || isCurrent
                    ? 'text-slate-900'
                    : 'text-slate-400',
                ].join(' ')}
              >
                {step.label}
              </span>
              {idx < arr.length - 1 && (
                <div className="flex-1 h-px bg-slate-200 mx-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Détails passager */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Détails du passager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{passengerName}</p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            {passengerPhone && (
              <a
                href={`tel:${passengerPhone}`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Phone className="h-3 w-3" />
                {passengerPhone}
              </a>
            )}
            {passengerEmail && (
              <a
                href={`mailto:${passengerEmail}`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Mail className="h-3 w-3" />
                {passengerEmail}
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trajet */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Route className="h-4 w-4 text-emerald-600" />
            Trajet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Pickup */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Point de départ
            </p>
            <button
              type="button"
              onClick={() =>
                openMaps(
                  ride.pickup_location,
                  (ride as any).pickup_lat,
                  (ride as any).pickup_lng
                )
              }
              className="flex items-start gap-2 text-left group"
            >
              <MapPin className="mt-0.5 h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="group-hover:underline">
                {ride.pickup_location}
              </span>
            </button>
          </div>

          {/* Dropoff */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Destination
            </p>
            <button
              type="button"
              onClick={() =>
                openMaps(
                  ride.dropoff_location,
                  (ride as any).dropoff_lat,
                  (ride as any).dropoff_lng
                )
              }
              className="flex items-start gap-2 text-left group"
            >
              <Navigation className="mt-0.5 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="group-hover:underline">
                {ride.dropoff_location}
              </span>
            </button>
          </div>

          {/* Stops */}
          {Array.isArray(ride.stops) && ride.stops.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Stops intermédiaires
              </p>
              <ol className="space-y-1 rounded-lg bg-slate-50 p-2 border border-slate-100">
                {ride.stops.map((s: any, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-700"
                  >
                    <span className="text-[10px] font-semibold text-slate-500">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => openMaps(s.location, s.lat, s.lng)}
                      className="hover:underline text-left"
                    >
                      {s.location}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Infos course */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Durée estimée
              </p>
              <p className="inline-flex items-center gap-1 font-medium">
                <Clock className="h-3 w-3" />
                {Math.round(Number(ride.duration ?? 0))} min
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Distance
              </p>
              <p className="font-medium">
                {Number(ride.distance ?? 0).toFixed(2)} km
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Tarif
              </p>
              <p className="font-semibold">
                {Number(ride.fare ?? 0).toFixed(2)} €
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Paiement
              </p>
              <p className="font-medium capitalize">
                {ride.payment_method || 'N/A'}
                {ride.payment_status && ` • ${ride.payment_status}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="shadow-sm border-t-4 border-t-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flag className="h-4 w-4 text-slate-800" />
            Actions chauffeur
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={!canStart || actionLoading}
              onClick={handleStart}
              className="inline-flex items-center gap-2"
            >
              {actionLoading && canStart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Route className="h-4 w-4" />
              )}
              Démarrer la course
            </Button>

            <Button
              size="sm"
              disabled={!canComplete || actionLoading}
              onClick={handleComplete}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {actionLoading && canComplete ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Terminer la course
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading}
              onClick={handleUpdateLocation}
              className="inline-flex items-center gap-2"
            >
              {actionLoading && !canStart && !canComplete ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              Envoyer ma position
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={!canCancel || actionLoading}
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4" />
            Annuler la course
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
