// app/confirmation/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/hooks/use-booking";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, User, Clock, DollarSign, Navigation, CreditCard, Wallet, Shield } from "lucide-react";
import Image from "next/image";
import { stripeService } from "@/lib/api/stripe-service";
import StripeCheckoutProvider from "@/components/stripe/StripeCheckoutProvider";
import type { StopInput } from "@/types/booking";

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
    passenger_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "",
    passenger_email: user?.email || "",
    passenger_phone: user?.phone_number || "",
  });
  const [paymentMethod, setLocalPaymentMethod] = useState<PaymentMethod>(contextPaymentMethod || "credit_card");

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
    () => (rideDetails?.estimated_fare ? Number(rideDetails.estimated_fare) : 0),
    [rideDetails]
  );

  const guestMissingBasics =
    !isAuthenticated &&
    (!passengerInfo.passenger_name?.trim() || !passengerInfo.passenger_phone?.trim());

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
    if (!isAuthenticated && (!passengerInfo.passenger_name?.trim() || !passengerInfo.passenger_phone?.trim())) {
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
      (rideDetails.vehicle_type as "standard" | "premium" | "van" | "berline" | "break" | undefined) || undefined;

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
      ...(isScheduled && rideDetails.scheduled_at ? { scheduled_at: rideDetails.scheduled_at } : {}),
      stops,
      estimated_distance: Number(rideDetails.estimated_distance),
      estimated_duration: Math.round(Number(rideDetails.estimated_duration)),
      estimated_fare: Number(finalPrice),
      payment_method: method,
    };

    if (isAuthenticated) return base;

    const guest: any = {};
    if (passengerInfo.passenger_name?.trim()) guest.guest_name = passengerInfo.passenger_name.trim();
    if (passengerInfo.passenger_phone?.trim()) guest.guest_phone = passengerInfo.passenger_phone.trim();
    if (passengerInfo.passenger_email?.trim()) guest.guest_email = passengerInfo.passenger_email.trim();

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
      if (!session?.clientSecret) throw new Error("Client secret introuvable. Vérifiez la configuration Embedded Checkout.");

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  // ... UI exactly as in your last file (omitted for brevity) ...


  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-white rounded-lg transition-all border border-gray-200 bg-white shadow-sm"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Confirmer votre course
            </h1>
            <p className="text-gray-600 mt-1">
              Vérifiez les détails et finalisez votre réservation
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Estimation */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Estimation de votre course
            </h2>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Départ</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {rideDetails.pickup_location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Destination</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {rideDetails.dropoff_location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDuration(rideDetails.estimated_duration)}
                  </p>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Navigation className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-bold text-gray-900">
                    {rideDetails.estimated_distance} km
                  </p>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Prix</p>
                  <p className="text-lg font-bold text-gray-900">
                    {finalPrice.toFixed(2)}€
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 mt-4">
                {rideDetails.vehicle?.icon && (
                  <div className="relative w-16 h-12 flex-shrink-0">
                    <Image
                      src={rideDetails.vehicle.icon}
                      alt={rideDetails.vehicle.name}
                      fill
                      sizes="(max-width: 768px) 64px, 128px"
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {rideDetails.vehicle?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Jusqu'à {rideDetails.vehicle?.capacity} passagers
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {finalPrice.toFixed(2)} €
                  </p>
                  <p className="text-xs text-gray-500">Prix final TTC</p>
                </div>
              </div>
            </div>
          </div>

          {/* Infos perso */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Vos informations
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet {!isAuthenticated && "(requis pour réserver)"}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone {!isAuthenticated && "(requis pour réserver)"}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email {isAuthenticated ? "(obligatoire)" : "(optionnel)"}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Méthode de paiement
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange("cash")}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    paymentMethod === "cash"
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet
                      className={`h-6 w-6 ${
                        paymentMethod === "cash"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Paiement en espèces
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Payez à la fin du trajet
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange("credit_card")}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    paymentMethod === "credit_card"
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard
                      className={`h-6 w-6 ${
                        paymentMethod === "credit_card"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Carte bancaire
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Paiement sécurisé Stripe
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {paymentMethod === "credit_card" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-800">
                          Paiement sécurisé Stripe
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Cliquez sur « Payer par carte » pour ouvrir le
                          formulaire.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!clientSecret && (
                    <button
                      onClick={handleCardClick}
                      disabled={loadingCard || guestMissingBasics}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-60"
                    >
                      {loadingCard ? "Initialisation..." : "Payer par carte"}
                    </button>
                  )}

                  {clientSecret && (
                    <div id="checkout" className="bg-white p-0 rounded-lg">
                      <StripeCheckoutProvider clientSecret={clientSecret} />
                    </div>
                  )}

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium">Erreur de paiement</p>
                      <p className="text-red-600 text-sm mt-1 whitespace-pre-line">
                        {paymentError}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">
                          Paiement en espèces
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Vous réglerez {finalPrice.toFixed(2)} € directement au
                          chauffeur à la fin du trajet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCashClick}
                    disabled={loadingCash || guestMissingBasics}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    {loadingCash ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Réservation en cours...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5" />
                        Confirmer la réservation - {finalPrice.toFixed(2)} €
                      </>
                    )}
                  </button>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium">Erreur</p>
                      <p className="text-red-600 text-sm mt-1 whitespace-pre-line">
                        {paymentError}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <p className="text-xs text-gray-600">
              ✓ Paiement 100% sécurisé • ✓ Chauffeur vérifié • ✓ Prix transparent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
