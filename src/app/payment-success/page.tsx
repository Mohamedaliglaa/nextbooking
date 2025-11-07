// app/payment-success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { stripeService } from "@/lib/api/stripe-service";
import type { CheckoutSessionStatus } from "@/types";

interface PaymentDetails extends CheckoutSessionStatus {
  payment_updated?: boolean;
  email_sent?: boolean;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [emailStatus, setEmailStatus] = useState<"pending" | "sent" | "failed">("pending");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");

        console.log("Session ID from URL:", sessionId);
        console.log("Full URL search params:", Array.from(searchParams.entries()));

        if (!sessionId) {
          throw new Error("Aucun ID de session trouvé dans l'URL");
        }

        // Still log if the placeholder slipped through
        if (sessionId.includes("CHECKOUT_SESSION_ID") || sessionId.includes("%7B")) {
          console.warn(
            "Placeholder found in session ID, but continuing verification..."
          );
        }

        console.log("Confirming payment for session:", sessionId);

        // 🆕 USE THE NEW confirmPayment METHOD (this updates status AND sends email)
        const paymentStatus = await stripeService.confirmPayment(sessionId);

        setPaymentDetails(paymentStatus);

        // Check if email was sent
        if (paymentStatus.email_sent) {
          setEmailStatus("sent");
        } else {
          setEmailStatus("failed");
        }

        if (
          paymentStatus.payment_status === "paid" ||
          paymentStatus.payment_intent_status === "succeeded"
        ) {
          setStatus("success");
          
          // If payment is successful but email wasn't sent, try to send it again
          if (!paymentStatus.email_sent) {
            console.log("Payment successful but email not sent, retrying...");
            setTimeout(() => retryEmail(sessionId), 2000);
          }
        } else {
          setStatus("error");
          setError(`Statut du paiement: ${paymentStatus.payment_status}`);
        }
      } catch (err: any) {
        console.error("Payment confirmation error:", err);
        setStatus("error");
        setError(err?.message || "Échec de la confirmation du paiement");
      }
    };

    const retryEmail = async (sessionId: string) => {
      try {
        console.log("Retrying email for session:", sessionId);
        const paymentStatus = await stripeService.confirmPayment(sessionId);
        
        if (paymentStatus.email_sent) {
          setEmailStatus("sent");
          setPaymentDetails(prev => prev ? { ...prev, email_sent: true } : null);
        }
      } catch (err) {
        console.error("Failed to retry email:", err);
      }
    };

    if (searchParams) {
      void confirmPayment();
    }
  }, [searchParams]);

  const handleReturnHome = () => {
    router.push("/");
  };

  const handleViewRide = () => {
    if (paymentDetails?.ride_id) {
      router.push(`/rides/${paymentDetails.ride_id}`);
    } else {
      router.push("/rides");
    }
  };

  const handleRetryEmail = async () => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    setEmailStatus("pending");
    try {
      const paymentStatus = await stripeService.confirmPayment(sessionId);
      if (paymentStatus.email_sent) {
        setEmailStatus("sent");
        setPaymentDetails(prev => prev ? { ...prev, email_sent: true } : null);
      } else {
        setEmailStatus("failed");
      }
    } catch (err) {
      console.error("Failed to retry email:", err);
      setEmailStatus("failed");
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === "loading" && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Clock className="h-16 w-16 text-blue-600 animate-pulse" />
                <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation en cours</h2>
            <p className="text-gray-600 mb-6">Nous finalisons votre paiement et préparons votre confirmation...</p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Cette opération peut prendre quelques secondes
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement Réussi!</h2>
            <p className="text-gray-600 mb-4">Votre course a été confirmée et payée.</p>

            {paymentDetails && (
              <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-semibold">
                      {(paymentDetails.amount_total / 100).toFixed(2)}{" "}
                      {paymentDetails.currency?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className="font-semibold text-green-600">Payé</span>
                  </div>
                  {paymentDetails.ride_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">N° de course:</span>
                      <span className="font-semibold">#{paymentDetails.ride_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email de confirmation:</span>
                    <div className="flex items-center gap-2">
                      {emailStatus === "sent" && (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <Mail className="h-3 w-3" />
                          Envoyé
                        </span>
                      )}
                      {emailStatus === "pending" && (
                        <span className="text-yellow-600 text-xs">En cours...</span>
                      )}
                      {emailStatus === "failed" && (
                        <button
                          onClick={handleRetryEmail}
                          className="text-red-600 text-xs underline hover:text-red-700"
                        >
                          Réessayer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleViewRide}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Voir ma course
              </button>
              <button
                onClick={handleReturnHome}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Retour à l'accueil
              </button>
            </div>

            {emailStatus === "sent" && (
              <p className="text-xs text-gray-500 mt-6">
                Un email de confirmation vous a été envoyé à {paymentDetails?.customer_email}.
              </p>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de Paiement</h2>
            <p className="text-gray-600 mb-4">{error}</p>

            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                Votre paiement n'a pas pu être confirmé. Si le problème persiste, contactez le support.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/")}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Réessayer
              </button>
              <button
                onClick={handleReturnHome}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Retour à l'accueil
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              En cas de problème, contactez le support au +33 1 23 45 67 89
            </p>
          </div>
        )}
      </div>
    </div>
  );
}