// app/confirmation/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/hooks/use-booking";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  User,
  Clock,
  Euro,
  Navigation,
  CreditCard,
  Wallet,
  Shield,
  Calendar,
  MapPin,
  SquareDot,
} from "lucide-react";
import Image from "next/image";
import { stripeService } from "@/lib/api/stripe-service";
import StripeCheckoutProvider from "@/components/stripe/StripeCheckoutProvider";
import type { StopInput } from "@/types/booking";
import { CircleDot } from 'lucide-react';

type PaymentMethod = "cash" | "credit_card";

interface PassengerInfo {
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const {
    rideDetails,
    passengerInfo: contextPassengerInfo,
    paymentMethod: contextPaymentMethod,
    requestRideWithPayment,
    setCurrentRide,
  } = useBooking();

  const { isAuthenticated, user } = useAuth();

  const [loadingCash, setLoadingCash] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);
  const [passengerInfo, setLocalPassengerInfo] = useState<PassengerInfo>({
    passenger_name:
      user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : "",
    passenger_email: user?.email || "",
    passenger_phone: user?.phone_number || "",
  });
  const [paymentMethod, setLocalPaymentMethod] = useState<PaymentMethod>(
    contextPaymentMethod || "credit_card"
  );

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (contextPassengerInfo) setLocalPassengerInfo(contextPassengerInfo);
    if (contextPaymentMethod) setLocalPaymentMethod(contextPaymentMethod);
  }, [contextPassengerInfo, contextPaymentMethod]);

  useEffect(() => {
    if (!rideDetails) router.push("/");
  }, [rideDetails, router]);

  const finalPrice = useMemo(
    () =>
      rideDetails?.estimated_fare
        ? Number(rideDetails.estimated_fare)
        : 0,
    [rideDetails]
  );

  const guestMissingBasics =
    !isAuthenticated &&
    (!passengerInfo.passenger_name?.trim() ||
      !passengerInfo.passenger_phone?.trim());

  function humanizeErrors(e: any): string {
    const errs = e?.errors;
    if (!errs) return e?.message || "Erreur inconnue";
    try {
      return Object.entries(errs)
        .map(([k, v]: any) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("\n");
    } catch {
      return e?.message || "Erreur de validation";
    }
  }

  function preflightValidate(): string | null {
    if (!rideDetails) return "Données de trajet manquantes.";
    const vt = String(rideDetails.vehicle_type || "");
    const allowed = ["standard", "premium", "van", "berline", "break"];
    if (!allowed.includes(vt)) return `vehicle_type invalide: ${vt}`;
    if (!rideDetails.pickup_location || !rideDetails.dropoff_location)
      return "Adresses départ/arrivée manquantes.";
    if (rideDetails.is_scheduled && !rideDetails.scheduled_at)
      return "scheduled_at est requis quand is_scheduled=true.";
    if (
      !isAuthenticated &&
      (!passengerInfo.passenger_name?.trim() ||
        !passengerInfo.passenger_phone?.trim())
    ) {
      return "Nom et téléphone requis pour un invité.";
    }
    return null;
  }

  // ✅ normalize stops for backend
  function normalizeStops(input?: StopInput[]) {
    if (!Array.isArray(input)) return [];
    return input
      .filter(Boolean)
      .map((s: any) => {
        if (typeof s === "string") return { location: s, lat: null, lng: null };
        const location = s?.location ?? s?.address ?? String(s ?? "");
        const lat = s?.lat ?? s?.latitude ?? null;
        const lng = s?.lng ?? s?.longitude ?? null;
        return { location: String(location), lat, lng };
      });
  }

  const buildRidePayload = (method: "cash" | "stripe") => {
    if (!rideDetails) return null;

    const allowedVehicleType =
      (rideDetails.vehicle_type as
        | "standard"
        | "premium"
        | "van"
        | "berline"
        | "break"
        | undefined) || undefined;

    const isScheduled = !!rideDetails.is_scheduled;
    const stops = normalizeStops(rideDetails.stops);

    const base: any = {
      pickup_location: rideDetails.pickup_location,
      dropoff_location: rideDetails.dropoff_location,
      pickup_lat: Number(rideDetails.pickup_lat),
      pickup_lng: Number(rideDetails.pickup_lng),
      dropoff_lat: Number(rideDetails.dropoff_lat),
      dropoff_lng: Number(rideDetails.dropoff_lng),
      vehicle_type: allowedVehicleType,
      is_scheduled: isScheduled,
      ...(isScheduled && rideDetails.scheduled_at
        ? { scheduled_at: rideDetails.scheduled_at }
        : {}),
      stops,
      estimated_distance: Number(rideDetails.estimated_distance),
      estimated_duration: Math.round(
        Number(rideDetails.estimated_duration)
      ),
      estimated_fare: Number(finalPrice),
      payment_method: method,
    };

    if (isAuthenticated) return base;

    const guest: any = {};
    if (passengerInfo.passenger_name?.trim())
      guest.guest_name = passengerInfo.passenger_name.trim();
    if (passengerInfo.passenger_phone?.trim())
      guest.guest_phone = passengerInfo.passenger_phone.trim();
    if (passengerInfo.passenger_email?.trim())
      guest.guest_email = passengerInfo.passenger_email.trim();

    return Object.keys(guest).length ? { ...base, ...guest } : base;
  };

  const handleCardClick = async () => {
    if (!rideDetails) return;
    const localErr = preflightValidate();
    if (localErr) return setPaymentError(localErr);

    setPaymentError(null);
    setLoadingCard(true);
    try {
      const ridePayload = buildRidePayload("stripe");
      const ride = await requestRideWithPayment(ridePayload as any, "stripe");
      setCurrentRide(ride);

      const session = await stripeService.createCheckoutSession(ride.id);
      if (!session?.clientSecret)
        throw new Error(
          "Client secret introuvable. Vérifiez la configuration Embedded Checkout."
        );

      setClientSecret(session.clientSecret);
    } catch (e: any) {
      console.error("Stripe init error:", e);
      setPaymentError(humanizeErrors(e));
    } finally {
      setLoadingCard(false);
    }
  };

  const handleCashClick = async () => {
    if (!rideDetails) return;
    const localErr = preflightValidate();
    if (localErr) return setPaymentError(localErr);

    setPaymentError(null);
    setLoadingCash(true);
    try {
      const ridePayload = buildRidePayload("cash");
      const ride = await requestRideWithPayment(ridePayload as any, "cash");
      setCurrentRide(ride);
      router.push("/booking-success");
    } catch (e: any) {
      console.error("Cash booking error:", e);
      setPaymentError(humanizeErrors(e));
    } finally {
      setLoadingCash(false);
    }
  };

  const handlePaymentMethodChange = (m: PaymentMethod) => {
    setLocalPaymentMethod(m);
    setPaymentError(null);
    if (m !== "credit_card") setClientSecret(null);
  };

  const formatDuration = (minutes: number): string => {
    if (!minutes && minutes !== 0) return "-";
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const mm = minutes % 60;
    return `${h}h${mm.toString().padStart(2, "0")}`;
  };

  if (!rideDetails) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirection...</p>
        </div>
      </div>
    );
  }

  const hasStops =
    Array.isArray(rideDetails.stops) && rideDetails.stops.length > 0;
  const isScheduled = !!rideDetails.is_scheduled;

  // unified main CTA label / disabled / handler
  const isProcessing =
    paymentMethod === "cash" ? loadingCash : loadingCard;
  const isMainButtonDisabled =
    guestMissingBasics ||
    isProcessing ||
    (paymentMethod === "credit_card" && !!clientSecret);

  const mainButtonLabel =
    paymentMethod === "cash"
      ? isProcessing
        ? "Réservation en cours..."
        : `Confirmer la réservation — ${finalPrice.toFixed(2)} €`
      : clientSecret
      ? "Paiement en cours dans le module ci-dessus"
      : isProcessing
      ? "Initialisation du paiement..."
      : `Payer par carte — ${finalPrice.toFixed(2)} €`;

  const handleMainClick = () => {
    if (paymentMethod === "cash") {
      void handleCashClick();
    } else if (!clientSecret) {
      void handleCardClick();
    }
  };

  return (
    <main className="pt-4 min-h-screen bg-muted">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-xl border border-border bg-card hover:bg-accent transition-colors shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Étape 2 / 2
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mt-1">
                Confirmer votre course
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Vérifiez les détails et choisissez votre mode de paiement.
              </p>
            </div>
          </div>

          {isScheduled && rideDetails.scheduled_at && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-xs text-foreground">
              <Calendar className="h-4 w-4 text-chart-2" />
              <span className="font-medium">Course programmée</span>
              <span className="text-muted-foreground">
                {new Date(rideDetails.scheduled_at).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-[1.6fr,1.2fr] gap-6 items-start">
          {/* Left column */}
          <div className="space-y-6">
            {/* === MINIMALIST FIRST SECTION === */}
            <section className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6 space-y-5">
              {/* Header row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Euro className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-card-foreground">
                      Votre course
                    </h2>
                    {isScheduled && rideDetails.scheduled_at && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        Course programmée le{" "}
                        {new Date(
                          rideDetails.scheduled_at
                        ).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Prix estimé
                  </span>
                  <span className="text-xl sm:text-2xl font-semibold text-primary">
                    {finalPrice.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-3">
                {/* Départ */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-6 w-6 rounded-full bg-chart-2/10 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-chart-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Départ
                    </p>
                    <p className="text-sm text-card-foreground mt-0.5 break-words">
                      {rideDetails.pickup_location}
                    </p>
                  </div>
                </div>

                {/* Stops */}
                {hasStops && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center">
                      <CircleDot className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        Arrêts
                      </p>
                      <div className="space-y-1.5">
                        {rideDetails.stops?.map((stop, index) => (
                          <div
                            key={index}
                            className="text-xs text-card-foreground flex gap-1.5"
                          >
                            <span className="text-muted-foreground shrink-0">
                              {index + 1}.
                            </span>
                            <span className="break-words">
                              {typeof stop === "string"
                                ? stop
                                : (stop as any)?.location || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Destination */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-6 w-6 rounded-full bg-chart-4/10 flex items-center justify-center">
                    <SquareDot className="h-3.5 w-3.5 text-chart-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Destination
                    </p>
                    <p className="text-sm text-card-foreground mt-0.5 break-words">
                      {rideDetails.dropoff_location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/80" />

              {/* Compact info strip */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDuration(rideDetails.estimated_duration)}</span>
                </div>
                <span className="hidden sm:inline-block text-border">•</span>
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5" />
                  <span>{rideDetails.estimated_distance} km</span>
                </div>
                <span className="hidden sm:inline-block text-border">•</span>
                <div className="flex items-center gap-1.5">
                  {rideDetails.vehicle?.icon && (
                    <div className="relative h-5 w-8 overflow-hidden rounded-sm bg-muted">
                      <Image
                        src={rideDetails.vehicle.icon}
                        alt={rideDetails.vehicle.name}
                        fill
                        sizes="32px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span>
                    {rideDetails.vehicle?.name} · max{" "}
                    {rideDetails.vehicle?.capacity} passagers
                  </span>
                </div>
              </div>
            </section>
            {/* === END MINIMALIST FIRST SECTION === */}

            {/* Passenger info */}
            <section className="rounded-2xl border border-border bg-card shadow-lg p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-chart-2/10 border border-chart-2/40">
                  <User className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">
                    Vos informations
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Ces informations seront communiquées à votre chauffeur.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-card-foreground mb-1.5">
                    Nom et Prénom{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={passengerInfo.passenger_name}
                    onChange={(e) =>
                      setLocalPassengerInfo((prev) => ({
                        ...prev,
                        passenger_name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-card-foreground mb-1.5">
                      Téléphone{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      value={passengerInfo.passenger_phone}
                      onChange={(e) =>
                        setLocalPassengerInfo((prev) => ({
                          ...prev,
                          passenger_phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-card-foreground mb-1.5">
                      Email{" "}
                      {isAuthenticated && (
                        <span className="text-destructive">*</span>
                      )}
                    </label>
                    <input
                      type="email"
                      required={isAuthenticated}
                      value={passengerInfo.passenger_email}
                      onChange={(e) =>
                        setLocalPassengerInfo((prev) => ({
                          ...prev,
                          passenger_email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="vous@email.com"
                    />
                  </div>
                </div>

                {!isAuthenticated && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Vous pouvez réserver sans créer de compte. Nous utilisons vos
                    coordonnées uniquement pour cette course.
                  </p>
                )}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-border bg-card shadow-lg p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-chart-3/10 border border-chart-3/40">
                  <CreditCard className="h-4 w-4 text-chart-3" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">
                    Méthode de paiement
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Choisissez comment vous souhaitez régler votre course.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Method selector (Stripe first, then cash) */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* CARD FIRST */}
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("credit_card")}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-2 ${
                      paymentMethod === "credit_card"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <CreditCard
                          className={`h-5 w-5 ${
                            paymentMethod === "credit_card"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-card-foreground">
                          Carte bancaire
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Paiement sécurisé via Stripe.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* CASH SECOND */}
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("cash")}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-2 ${
                      paymentMethod === "cash"
                        ? "border-chart-4 bg-chart-4/10 shadow-sm"
                        : "border-border bg-background hover:border-chart-4/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Wallet
                          className={`h-5 w-5 ${
                            paymentMethod === "cash"
                              ? "text-chart-4"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-card-foreground">
                          Paiement en espèces
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vous payez directement au chauffeur.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Method details */}
                {paymentMethod === "credit_card" && (
                  <div className="space-y-4">
                    {clientSecret && (
                      <div className="rounded-xl border border-border bg-background p-3">
                        <StripeCheckoutProvider clientSecret={clientSecret} />
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="space-y-4"></div>
                )}

                {/* Errors */}
                {paymentError && (
                  <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3">
                    <p className="text-sm font-semibold text-destructive">
                      {paymentMethod === "credit_card"
                        ? "Erreur de paiement"
                        : "Erreur"}
                    </p>
                    <p className="text-xs text-destructive mt-1 whitespace-pre-line">
                      {paymentError}
                    </p>
                  </div>
                )}

                {/* Main CTA that switches between cash / card */}
                <button
                  onClick={handleMainClick}
                  disabled={isMainButtonDisabled}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing && !clientSecret && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                  )}
                  {mainButtonLabel}
                </button>

                {paymentMethod === "credit_card" && clientSecret && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    Complétez le formulaire de paiement ci-dessus pour finaliser
                    la réservation.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right column: recap */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card shadow-md p-5">
              <h3 className="text-sm font-semibold text-card-foreground mb-3">
                Récapitulatif
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="text-card-foreground">
                    {rideDetails.estimated_distance} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Durée estimée
                  </span>
                  <span className="text-card-foreground">
                    {formatDuration(rideDetails.estimated_duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Type de véhicule
                  </span>
                  <span className="text-card-foreground">
                    {rideDetails.vehicle?.name}
                  </span>
                </div>
              </div>

              <div className="my-4 h-px bg-border" />

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <p className="uppercase tracking-[0.2em]">
                    Total à payer
                  </p>
                  <p className="mt-1">
                    Taxes et frais de service inclus.
                  </p>
                </div>
                <p className="text-2xl font-semibold text-primary">
                  {finalPrice.toFixed(2)} €
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 text-[11px] text-muted-foreground">
  {/* Header sécurité */}
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 rounded-full bg-primary/5 text-primary">
      <Shield className="h-3.5 w-3.5" />
    </div>
    <p className="font-semibold text-[12px] text-card-foreground">
      Sécurité & sérénité garanties
    </p>
  </div>

  {/* 3 petits “pills” d’info */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted">
      <CreditCard className="h-3.5 w-3.5 text-primary" />
      <span>Paiement 100% sécurisé</span>
    </div>

    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted">
      <User className="h-3.5 w-3.5 text-chart-4" />
      <span>Chauffeurs vérifiés</span>
    </div>

    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted">
      <Euro className="h-3.5 w-3.5 text-chart-1" />
      <span>Prix transparents</span>
    </div>
  </div>

  {/* Texte légal */}
  <p className="text-[11px] leading-relaxed text-center">
    En confirmant votre course, vous acceptez nos{" "}
    <span className="underline underline-offset-2">
      conditions générales
    </span>{" "}
    et notre{" "}
    <span className="underline underline-offset-2">
      politique de confidentialité
    </span>.
  </p>
</div>

          </aside>
        </div>
      </div>
    </main>
  );
}
