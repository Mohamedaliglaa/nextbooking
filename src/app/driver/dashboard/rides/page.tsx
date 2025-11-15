'use client';

import { useCallback, useEffect, useState } from 'react';
import { driverRideService } from '@/lib/api/driver-ride-service';
import { Ride } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, MapPin, Navigation, Clock, CheckCircle2 } from 'lucide-react';

type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export default function DriverAvailableRidesPage() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginator, setPaginator] = useState<Paginator<Ride> | null>(null);

  const fetchPage = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await driverRideService.listAvailable({ page: p, per_page: 10 });
      setPaginator(res as any);
      setPage(res.current_page);
    } catch (e: any) {
      toast.error(e?.message || 'Impossible de charger les courses disponibles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  const items = paginator?.data ?? [];

  const onAccept = async (rideId: number) => {
    try {
      await driverRideService.accept(rideId);
      toast.success('Course acceptée');
      fetchPage(page); // recharger la page
    } catch (e: any) {
      toast.error(e?.message || "Échec de l'acceptation");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Courses disponibles</h1>
        <Button variant="outline" onClick={() => fetchPage(page)}>Rafraîchir</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : items.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Aucune course pour le moment.</p>
          ) : (
            <ul className="grid gap-3">
              {items.map((ride) => (
                <li key={ride.id} className="rounded-lg border p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{ride.pickup_location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{ride.dropoff_location}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(ride.duration)} min
                        </span>
                        <span>{(ride.distance ?? 0).toFixed(2)} km</span>
                        <span className="font-semibold text-gray-900">{(ride.fare ?? 0).toFixed(2)} €</span>
                        {ride.vehicle_type && <span>Type: {ride.vehicle_type}</span>}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2 md:mt-0">
                      <Button className="inline-flex items-center gap-2" onClick={() => onAccept(ride.id)}>
                        <CheckCircle2 className="h-4 w-4" />
                        Accepter
                      </Button>
                    </div>
                  </div>

                  {ride.stops && ride.stops.length > 0 && (
                    <div className="mt-3 rounded-md bg-gray-50 p-2">
                      <p className="mb-1 text-xs font-semibold text-gray-700">Stops :</p>
                      <ol className="space-y-1">
                        {ride.stops.map((s, idx) => (
                          <li key={idx} className="text-xs text-gray-700">
                            • {s.location}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {paginator && paginator.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
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
