/// <reference types="google.maps" />

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/api/admin-service";
import { Ride } from "@/types/booking";
import { useLoadGoogleMaps } from "@/hooks/useLoadGoogleMaps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

/** Build a universal Maps deep link (app on mobile, web on desktop) */
function mapsLink(opts: { lat?: number; lng?: number; text?: string }) {
  const hasCoords =
    Number.isFinite(opts.lat) &&
    typeof opts.lat === "number" &&
    Number.isFinite(opts.lng!) &&
    typeof opts.lng === "number";

  if (hasCoords) {
    return `https://www.google.com/maps/search/?api=1&query=${opts.lat},${opts.lng}`;
  }
  const q = encodeURIComponent(opts.text ?? "");
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** type guard for google namespace */
function getGoogle(): typeof google | null {
  const g = (window as any).google as (typeof google | undefined);
  return g && g.maps ? g : null;
}

export default function RideDetailPage() {
  const { id } = useParams();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  const mapsLoaded = useLoadGoogleMaps(GOOGLE_API_KEY);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminService.getRide(Number(id));
        if (!cancelled) setRide(data);
      } catch (e: any) {
        if (!cancelled) toast.error(e?.message || "Impossible de charger la course");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const sortedStops = useMemo(() => {
    const stops = Array.isArray(ride?.stops) ? ride!.stops! : [];
    return [...stops].sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [ride]);

  useEffect(() => {
    if (!mapsLoaded || !ride || !mapRef.current) return;
    const g = getGoogle();
    if (!g) return;

    const pickup = {
      lat: Number(ride.pickup_lat),
      lng: Number(ride.pickup_lng),
      text: ride.pickup_location ?? "Départ",
      label: "Départ",
    };
    const dropoff = {
      lat: Number(ride.dropoff_lat),
      lng: Number(ride.dropoff_lng),
      text: ride.dropoff_location ?? "Arrivée",
      label: "Arrivée",
    };

    const map = new g.maps.Map(mapRef.current, {
      center: {
        lat: Number.isFinite(pickup.lat) ? pickup.lat : 48.8566,
        lng: Number.isFinite(pickup.lng) ? pickup.lng : 2.3522,
      },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    const geocoder = new g.maps.Geocoder();

    type Pt = { lat: number; lng: number; label: string; text?: string; n?: number };

    const stopsPts: Pt[] = sortedStops.map((s, idx) => ({
      lat: s?.lat != null ? Number(s.lat) : NaN,
      lng: s?.lng != null ? Number(s.lng) : NaN,
      text: s?.location ?? `Arrêt ${idx + 1}`,
      label: `Arrêt ${idx + 1}`,
      n: idx + 1,
    }));

    const points: Pt[] = [{ ...pickup, label: "Départ" }, ...stopsPts, { ...dropoff, label: "Arrivée" }];

    const fillMissing = async (p: Pt): Promise<Pt> => {
      if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) return p;
      if (!p.text) return p;
      try {
        const { results } = await geocoder.geocode({ address: p.text });
        const loc = results?.[0]?.geometry?.location;
        if (loc) return { ...p, lat: loc.lat(), lng: loc.lng() };
      } catch {}
      return p;
    };

    (async () => {
      const resolved = await Promise.all(points.map(fillMissing));
      const usable = resolved.filter(pt => Number.isFinite(pt.lat) && Number.isFinite(pt.lng)) as Pt[];
      if (usable.length === 0) return;

      const bounds = new g.maps.LatLngBounds();
      usable.forEach(p => bounds.extend(new g.maps.LatLng(p.lat, p.lng)));
      map.fitBounds(bounds);

      // polyline pickup -> stops -> dropoff
      new g.maps.Polyline({
        path: usable.map(p => ({ lat: p.lat, lng: p.lng })),
        map,
        strokeColor: "#2563eb",
        strokeOpacity: 0.95,
        strokeWeight: 4,
      });

      // helpers: icons
      function simplePin(color: string): google.maps.Icon {
        const svg =
          `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">
             <circle cx="14" cy="14" r="10" fill="${color}" stroke="white" stroke-width="3"/>
           </svg>`;
        return {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
          scaledSize: new g!.maps.Size(28, 28),
          anchor: new g!.maps.Point(14, 14),
        };
      }
      function numberedPin(n: number): google.maps.Icon {
        const svg =
          `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
            <circle cx="15" cy="15" r="12" fill="#111827" stroke="white" stroke-width="3"/>
            <text x="50%" y="55%" text-anchor="middle" font-family="Inter,Arial" font-size="14" font-weight="700" fill="#ffffff">${n}</text>
           </svg>`;
        return {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
          scaledSize: new g!.maps.Size(30, 30),
          anchor: new g!.maps.Point(15, 15),
        };
      }

      // add markers + click (open maps)
      // pickup
      {
        const url = mapsLink({ lat: usable[0].lat, lng: usable[0].lng, text: pickup.text });
        const m = new g.maps.Marker({
          map,
          position: { lat: usable[0].lat, lng: usable[0].lng },
          title: pickup.label,
          icon: simplePin("#10b981"),
        });
        m.addListener("click", () => window.open(url, "_blank"));
      }

      // mid stops
      if (usable.length > 2) {
        for (let i = 1; i < usable.length - 1; i++) {
          const n = usable[i].n ?? i;
          const m = new g.maps.Marker({
            map,
            position: { lat: usable[i].lat, lng: usable[i].lng },
            title: usable[i].label,
            icon: numberedPin(n),
          });
          const url = mapsLink({ lat: usable[i].lat, lng: usable[i].lng, text: usable[i].text });
          m.addListener("click", () => window.open(url, "_blank"));
        }
      }

      // dropoff
      {
        const last = usable[usable.length - 1];
        const url = mapsLink({ lat: last.lat, lng: last.lng, text: dropoff.text });
        const m = new g.maps.Marker({
          map,
          position: { lat: last.lat, lng: last.lng },
          title: dropoff.label,
          icon: simplePin("#ef4444"),
        });
        m.addListener("click", () => window.open(url, "_blank"));
      }
    })();
  }, [mapsLoaded, ride, sortedStops]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ride) {
    return <p className="text-center text-sm text-muted-foreground">Course introuvable.</p>;
  }

  // precompute links for the info cards
  const pickupLink = mapsLink({
    lat: Number(ride.pickup_lat),
    lng: Number(ride.pickup_lng),
    text: ride.pickup_location ?? undefined,
  });
  const dropoffLink = mapsLink({
    lat: Number(ride.dropoff_lat),
    lng: Number(ride.dropoff_lng),
    text: ride.dropoff_location ?? undefined,
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Détails de la course #{ride.id}</h1>
        <Button asChild variant="outline">
          <Link href="/admin/rides">Retour</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Informations de la course</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Info label="Passager" value={ride.passenger?.first_name ?? ride.guest_name ?? "-"} />
          <Info label="Chauffeur" value={ride.driver?.first_name ?? (ride.driver_id ? `ID ${ride.driver_id}` : "—")} />
          <Info label="Statut" value={ride.status ?? "—"} />
          <Info label="Paiement" value={ride.payment_status ?? "—"} />
          <Info label="Méthode de paiement" value={ride.payment_method ?? "—"} />
          <Info label="Tarif" value={`${Number(ride.fare ?? 0).toFixed(2)} €`} />
          <Info label="Distance" value={ride.distance ? `${Number(ride.distance).toFixed(2)} km` : "—"} />
          <Info label="Durée" value={ride.duration ? `${Number(ride.duration).toFixed(1)} min` : "—"} />
          <InfoLink label="Départ" text={ride.pickup_location ?? "—"} href={pickupLink} />
          <InfoLink label="Arrivée" text={ride.dropoff_location ?? "—"} href={dropoffLink} />
          <Info label="Créée le" value={ride.created_at ? new Date(ride.created_at).toLocaleString() : "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Carte du trajet</CardTitle></CardHeader>
        <CardContent><div ref={mapRef} className="w-full h-[400px] rounded-lg border" /></CardContent>
      </Card>

      {sortedStops.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Arrêts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sortedStops.map((s, i) => {
              const href = mapsLink({
                lat: s?.lat != null ? Number(s.lat) : undefined,
                lng: s?.lng != null ? Number(s.lng) : undefined,
                text: s?.location,
              });
              const coords =
                s?.lat != null && s?.lng != null
                  ? ` (${Number(s.lat).toFixed(5)}, ${Number(s.lng).toFixed(5)})`
                  : "";
              return (
                <div key={i} className="text-sm">
                  <span className="font-medium">Arrêt {i + 1}:</span>{" "}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    title="Ouvrir dans Google Maps"
                  >
                    {s.location}
                  </a>
                  <span className="text-muted-foreground">{coords}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function InfoLink({ label, text, href }: { label: string; text: string; href: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-blue-600 hover:underline"
        title="Ouvrir dans Google Maps"
      >
        {text}
      </a>
    </div>
  );
}
