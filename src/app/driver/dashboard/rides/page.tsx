'use client';

import { useCallback, useEffect, useState } from 'react';
import { driverRideService } from '@/lib/api/driver-ride-service';
import type { PaginatedResponse, Ride } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Loader2,
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  Info,
  Phone,
  Mail,
  CreditCard,
} from 'lucide-react';

type PaginatorOrList = PaginatedResponse<Ride> | Ride[];

// Petit helper pour Google Maps
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

export default function DriverAvailableRidesPage() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dataSource, setDataSource] = useState<PaginatorOrList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null); // pour les détails

  const fetchPage = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await driverRideService.listAvailable({
          page: p,
          per_page: 10,
        });

        console.log('[DriverAvailableRidesPage] raw result:', res);

        setDataSource(res);

        if (!Array.isArray(res) && typeof res.current_page === 'number') {
          setPage(res.current_page);
        } else {
          setPage(1);
        }
      } catch (e: any) {
        console.error('[DriverAvailableRidesPage] error fetching:', e);
        const status = e?.response?.status;
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          'Impossible de charger les courses disponibles';

        if (status === 401 || status === 403) {
          setError(
            'Vous devez être connecté en tant que chauffeur pour voir les courses.'
          );
        } else {
          setError(msg);
        }

        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const items: Ride[] = Array.isArray(dataSource)
    ? dataSource
    : dataSource?.data ?? [];

  const paginator: PaginatedResponse<Ride> | null = !Array.isArray(dataSource)
    ? (dataSource as PaginatedResponse<Ride> | null)
    : null;

  const onAccept = async (rideId: number) => {
    try {
      await driverRideService.accept(rideId);
      toast.success('Course acceptée');
      setExpandedId(null);
      fetchPage(page);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Échec de l'acceptation de la course";
      toast.error(msg);
    }
  };

  const openMaps = (
    address: string | null | undefined,
    lat?: number | null,
    lng?: number | null
  ) => {
    const url = buildMapsUrl(address, lat ?? undefined, lng ?? undefined);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Courses disponibles</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Voir et accepter les demandes de trajets en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
            {items.length} course(s)
          </span>
          <Button variant="outline" size="sm" onClick={() => fetchPage(page)}>
            Rafraîchir
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            Liste des courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-10 justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : error ? (
            <p className="py-6 text-sm text-red-600 text-center">{error}</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground text-center">
              Aucune course pour le moment.
            </p>
          ) : (
            <ul className="grid gap-3">
              {items.map((ride) => {
                const isExpanded = expandedId === ride.id;
                return (
                  <li
                    key={ride.id}
                    className="rounded-xl border bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.08)] hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        {/* Pickup */}
                        <button
                          type="button"
                          onClick={() =>
                            openMaps(
                              ride.pickup_location,
                              (ride as any).pickup_lat,
                              (ride as any).pickup_lng
                            )
                          }
                          className="flex items-center gap-2 text-left group"
                        >
                          <MapPin className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium group-hover:underline">
                            {ride.pickup_location}
                          </span>
                        </button>

                        {/* Dropoff */}
                        <button
                          type="button"
                          onClick={() =>
                            openMaps(
                              ride.dropoff_location,
                              (ride as any).dropoff_lat,
                              (ride as any).dropoff_lng
                            )
                          }
                          className="flex items-center gap-2 text-left group"
                        >
                          <Navigation className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm group-hover:underline">
                            {ride.dropoff_location}
                          </span>
                        </button>

                        {/* Infos principales */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round(Number(ride.duration ?? 0))} min
                          </span>
                          <span>{Number(ride.distance ?? 0).toFixed(2)} km</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                            <CreditCard className="h-3 w-3" />
                            {Number(ride.fare ?? 0).toFixed(2)} €
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-100">
                            ID #{ride.id}
                          </span>
                          {ride.payment_method && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-100 capitalize">
                              {ride.payment_method}
                              {ride.payment_status &&
                                ` • ${ride.payment_status}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-2 flex items-center gap-2 md:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : ride.id)
                          }
                        >
                          {isExpanded ? 'Masquer détails' : 'Détails'}
                        </Button>
                        <Button
                          className="inline-flex items-center gap-2"
                          size="sm"
                          onClick={() => onAccept(ride.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accepter
                        </Button>
                      </div>
                    </div>

                    {/* Détails étendus */}
                    {isExpanded && (
                      <div className="mt-3 rounded-lg bg-slate-50/80 p-3 border border-slate-100 space-y-2">
                        {/* Guest / passager */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                          {ride.guest_name && (
                            <span className="inline-flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              {ride.guest_name}
                            </span>
                          )}
                          {ride.guest_phone && (
                            <a
                              href={`tel:${ride.guest_phone}`}
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {ride.guest_phone}
                            </a>
                          )}
                          {ride.guest_email && (
                            <a
                              href={`mailto:${ride.guest_email}`}
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              {ride.guest_email}
                            </a>
                          )}
                        </div>

                        {/* Stops éventuels */}
                        {Array.isArray(ride.stops) && ride.stops.length > 0 && (
                          <div className="mt-1 rounded-md bg-white p-2 border border-slate-100">
                            <p className="mb-1 text-xs font-semibold text-gray-700">
                              Stops :
                            </p>
                            <ol className="space-y-1">
                              {ride.stops.map((s: any, idx: number) => (
                                <li
                                  key={idx}
                                  className="text-xs text-gray-700 flex items-center gap-1"
                                >
                                  <span className="text-[10px] font-semibold text-slate-500">
                                    #{idx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openMaps(
                                        s.location,
                                        s.lat,
                                        s.lng
                                      )
                                    }
                                    className="hover:underline text-left"
                                  >
                                    {s.location}
                                  </button>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Meta temps */}
                        <div className="pt-1 grid gap-1 text-[11px] text-slate-500 md:grid-cols-2">
                          {ride.requested_at && (
                            <p>
                              Demandée le :{' '}
                              <span className="font-medium text-slate-700">
                                {new Date(
                                  ride.requested_at as any
                                ).toLocaleString()}
                              </span>
                            </p>
                          )}
                          {ride.scheduled_at && (
                            <p>
                              Course programmée :{' '}
                              <span className="font-medium text-slate-700">
                                {new Date(
                                  ride.scheduled_at as any
                                ).toLocaleString()}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Pagination si paginator */}
          {paginator && !error && paginator.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchPage(page - 1)}
              >
                Précédent
              </Button>
              <p className="text-xs text-muted-foreground">
                Page {paginator.current_page} / {paginator.last_page}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= paginator.last_page}
                onClick={() => fetchPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
