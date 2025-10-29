// app/confirmation/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/BookingContext";
import {
  ArrowLeft,
  User,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  CreditCard,
  Wallet,
} from "lucide-react";
import Image from "next/image";

// ✅ import from our typed API client
import {
  RidesAPI,
  GuestAPI,
  type IStop,
  type RequestRideRequest,
  type IRide,
} from "@/types/api";

// Local-only (not in API types)
type PaymentUI = "cash" | "credit_card";
interface CardInfo {
  card_number: string;
  card_expiry: string;
  card_cvc: string;
  card_holder: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [loading, setLoading] = useState(false);

  const [passengerInfo, setPassengerInfo] = useState({
    passenger_name: "",
    passenger_email: "",
    passenger_phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentUI>("credit_card");
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    card_number: "",
    card_expiry: "",
    card_cvc: "",
    card_holder: "",
  });

  // Redirect back if no ride details
  useEffect(() => {
    if (!state.rideDetails) {
      router.push("/");
    }
  }, [state.rideDetails, router]);

  if (!state.rideDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  const { rideDetails } = state;

  // Final price (EUR) shown in UI
  const finalPrice =
    state.promoCode?.isValid
      ? (rideDetails.estimated_fare || 0) - (state.promoCode.discount || 0)
      : rideDetails.estimated_fare || 0;

  // Helper: map UI method to backend enum
  function mapPaymentForBackend(ui: PaymentUI): "cash" | "stripe" {
    return ui === "credit_card" ? "stripe" : "cash";
  }

  // Helper: auth presence (very light)
  function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token")
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passengerInfo.passenger_name || !passengerInfo.passenger_phone) {
      alert("Veuillez remplir au moins votre nom et téléphone");
      return;
    }

    if (paymentMethod === "credit_card") {
      if (
        !cardInfo.card_number ||
        !cardInfo.card_expiry ||
        !cardInfo.card_cvc ||
        !cardInfo.card_holder
      ) {
        alert("Veuillez remplir tous les champs de la carte bancaire");
        return;
      }
    }

    setLoading(true);

    try {
      // Build stops for API (our type is IStop)
      const stops: IStop[] = (rideDetails.stops || []).map(
        (stop: string, index: number) => ({
          location: stop,
          lat: undefined,
          lng: undefined,
          order: index + 1,
        })
      );

      // Convert finalPrice (EUR) to cents for backend
      const estimatedFareCents = Math.round((finalPrice || 0) * 100);

      const payment_method = mapPaymentForBackend(paymentMethod);

      const isLoggedIn = !!getToken();

      let createdRide: IRide;

      if (isLoggedIn) {
        // ✅ Authenticated flow → use RidesAPI.requestRide
        const payload: RequestRideRequest = {
          pickup_location: rideDetails.pickup_location,
          dropoff_location: rideDetails.dropoff_location,
          pickup_lat: rideDetails.pickup_lat,
          pickup_lng: rideDetails.pickup_lng,
          dropoff_lat: rideDetails.dropoff_lat,
          dropoff_lng: rideDetails.dropoff_lng,
          stops,
          is_scheduled: rideDetails.is_scheduled || false,
          scheduled_at: rideDetails.scheduled_at || null,
          estimated_distance: Number(rideDetails.estimated_distance || 0), // keep unit consistent with your backend
          estimated_duration: Number(rideDetails.estimated_duration || 0), // minutes
          estimated_fare: estimatedFareCents, // cents
          payment_method, // "cash" | "stripe"
          // Note: for logged-in users we don't send guest_* here
        };

        const { ride } = await RidesAPI.requestRide(payload);
        createdRide = ride;
      } else {
        // ✅ Guest flow → use GuestAPI.quickBook (includes guest fields)
        const { ride } = await GuestAPI.quickBook({
          pickup_location: rideDetails.pickup_location,
          dropoff_location: rideDetails.dropoff_location,
          pickup_lat: rideDetails.pickup_lat!,
          pickup_lng: rideDetails.pickup_lng!,
          dropoff_lat: rideDetails.dropoff_lat!,
          dropoff_lng: rideDetails.dropoff_lng!,
          estimated_distance: Number(rideDetails.estimated_distance || 0),
          estimated_duration: Number(rideDetails.estimated_duration || 0),
          estimated_fare: estimatedFareCents, // cents
          guest_name: passengerInfo.passenger_name,
          guest_phone: passengerInfo.passenger_phone,
          guest_email: passengerInfo.passenger_email,
        });

        createdRide = ride;
      }

      // Persist minimal info in context
      dispatch({
        type: "SET_PASSENGER_INFO",
        payload: passengerInfo,
      });

      // Store chosen method in your context (no custom BookingPaymentInfo type needed)
      dispatch({
        type: "SET_PAYMENT_METHOD",
        payload: { method: paymentMethod },
      });

      dispatch({
        type: "SET_CURRENT_RIDE",
        payload: createdRide,
      });

      // If card: next step would normally be Stripe (Payment Element).
      // For now we keep your redirect:
      router.push("/booking-success");
    } catch (error: any) {
      console.error("Error creating ride:", error);
      alert(
        error?.message ||
          "Une erreur est survenue lors de la réservation. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method: PaymentUI) => {
    setPaymentMethod(method);
    if (method !== "credit_card") {
      setCardInfo({
        card_number: "",
        card_expiry: "",
        card_cvc: "",
        card_holder: "",
      });
    }
  };

  const handleCardInfoChange = (field: keyof CardInfo, value: string) => {
    setCardInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              dispatch({ type: "PREVIOUS_STEP" });
              router.push("/");
            }}
            className="p-2 hover:bg-white rounded-lg transition-all border border-gray-200 bg-white shadow-sm"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Confirmer votre course
            </h1>
            <p className="text-gray-600 mt-1">Finalisez votre réservation</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Destination card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Votre destination
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Destination</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {rideDetails.dropoff_location}
                  </p>
                </div>
              </div>

              {/* Estimated info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Temps estimé</p>
                  <p className="text-lg font-bold text-gray-900">
                    {rideDetails.estimated_duration} min
                  </p>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Navigation className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-bold text-gray-900">
                    {rideDetails.estimated_distance} km
                  </p>
                </div>
              </div>

              {/* Selected vehicle */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mt-4">
                {rideDetails.vehicle?.icon && (
                  <div className="relative w-16 h-12 flex-shrink-0">
                    <Image
                      src={rideDetails.vehicle.icon}
                      alt={rideDetails.vehicle.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {rideDetails.vehicle?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Jusqu&apos;à {rideDetails.vehicle?.capacity} passagers
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {finalPrice.toFixed(2)} €
                  </p>
                  <p className="text-xs text-gray-500">Prix final</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Vos informations
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={passengerInfo.passenger_name}
                  onChange={(e) =>
                    setPassengerInfo((prev) => ({
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
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={passengerInfo.passenger_phone}
                  onChange={(e) =>
                    setPassengerInfo((prev) => ({
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
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={passengerInfo.passenger_email}
                  onChange={(e) =>
                    setPassengerInfo((prev) => ({
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

          {/* Payment method */}
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
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
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
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
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
                        Paiement sécurisé
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {paymentMethod === "credit_card" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de carte *
                    </label>
                    <input
                      type="text"
                      value={cardInfo.card_number}
                      onChange={(e) =>
                        handleCardInfoChange("card_number", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d&apos;expiration *
                      </label>
                      <input
                        type="text"
                        value={cardInfo.card_expiry}
                        onChange={(e) =>
                          handleCardInfoChange("card_expiry", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC *
                      </label>
                      <input
                        type="text"
                        value={cardInfo.card_cvc}
                        onChange={(e) =>
                          handleCardInfoChange("card_cvc", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titulaire de la carte *
                    </label>
                    <input
                      type="text"
                      value={cardInfo.card_holder}
                      onChange={(e) =>
                        handleCardInfoChange("card_holder", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nom comme sur la carte"
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700">
                      🔒 Paiement sécurisé - Vos informations bancaires sont
                      cryptées et protégées
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">
                        Paiement en espèces
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Vous réglerez le montant de {finalPrice.toFixed(2)} € directement au chauffeur à la fin du trajet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !passengerInfo.passenger_name ||
              !passengerInfo.passenger_phone
            }
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-lg shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Réservation en cours...
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" />
                {paymentMethod === "cash"
                  ? `Confirmer la réservation - Payer ${finalPrice.toFixed(
                      2
                    )} € en espèces`
                  : `Payer ${finalPrice.toFixed(2)} € par carte`}
              </>
            )}
          </button>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-600">
              ✓ Paiement sécurisé • ✓ Chauffeur vérifié • ✓ Trajet optimal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
