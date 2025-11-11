"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { stripeService } from "@/lib/api/stripe-service";
import type { CheckoutSessionStatus } from "@/types";

interface PaymentDetails extends CheckoutSessionStatus {
  payment_updated?: boolean;
  email_sent?: boolean;
}

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [emailStatus, setEmailStatus] = useState<"pending" | "sent" | "failed">("pending");

  const sessionId = searchParams.get("session_id");

  const retryEmail = async (id: string) => {
    setEmailStatus("pending");
    try {
      const paymentStatus = await stripeService.confirmPayment(id);
      setEmailStatus(paymentStatus.email_sent ? "sent" : "failed");
      setPaymentDetails(prev => prev ? { ...prev, email_sent: paymentStatus.email_sent } : prev);
    } catch {
      setEmailStatus("failed");
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("Aucun ID de session trouvé dans l'URL");
      return;
    }

    const confirmPayment = async () => {
      try {
        const paymentStatus = await stripeService.confirmPayment(sessionId);
        setPaymentDetails(paymentStatus);
        setEmailStatus(paymentStatus.email_sent ? "sent" : "failed");

        if (paymentStatus.payment_status === "paid" || paymentStatus.payment_intent_status === "succeeded") {
          setStatus("success");
          if (!paymentStatus.email_sent) setTimeout(() => retryEmail(sessionId), 2000);
        } else {
          setStatus("error");
          setError(`Statut du paiement : ${paymentStatus.payment_status}`);
        }
      } catch (err: any) {
        setStatus("error");
        setError(err?.message || "Échec de la confirmation du paiement");
      }
    };

    confirmPayment();
  }, [sessionId]);

  const handleReturnHome = () => router.push("/");
  const handleViewRide = () => router.push(paymentDetails?.ride_id ? `/rides/${paymentDetails.ride_id}` : "/rides");

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 transition-all duration-500">
        {status === "loading" && (
          <div className="text-center animate-fade-in">
            <Clock className="h-16 w-16 text-blue-600 animate-spin-slow mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation en cours</h2>
            <p className="text-gray-600 mb-4">Nous finalisons votre paiement et préparons votre confirmation...</p>
            <p className="text-sm text-blue-700 bg-blue-50 rounded-lg p-3">Cette opération peut prendre quelques secondes.</p>
          </div>
        )}

        {status === "success" && paymentDetails && (
          <div className="text-center animate-fade-in">
            <CheckCircle className="h-16 w-16 text-green-600 animate-bounce mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement Réussi 🎉</h2>
            <p className="text-gray-600 mb-4">Votre course a été confirmée et payée.</p>

            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left text-sm">
              <div className="space-y-2">
                <div className="flex justify-between"><span>Montant :</span><span className="font-semibold">{(paymentDetails.amount_total / 100).toFixed(2)} {paymentDetails.currency?.toUpperCase()}</span></div>
                {paymentDetails.ride_id && <div className="flex justify-between"><span>Course N° :</span><span className="font-semibold">#{paymentDetails.ride_id}</span></div>}
                <div className="flex justify-between items-center">
                  <span>Email de confirmation :</span>
                  {emailStatus === "sent" ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs"><Mail className="h-3 w-3" /> Envoyé</span>
                  ) : emailStatus === "pending" ? (
                    <span className="text-yellow-600 text-xs">Envoi en cours...</span>
                  ) : (
                    <button onClick={() => sessionId && retryEmail(sessionId)} className="text-red-600 text-xs underline hover:text-red-700">Réessayer</button>
                  )}
                </div>
              </div>
            </div>

            <button onClick={handleViewRide} className="w-full bg-blue-600 text-white py-3 rounded-lg mb-2 hover:bg-blue-700 transition">Voir ma course</button>
            <button onClick={handleReturnHome} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition">Retour à l'accueil</button>

            {emailStatus === "sent" && <p className="text-xs text-gray-500 mt-6">Un email de confirmation a été envoyé à {paymentDetails.customer_email}.</p>}
          </div>
        )}

        {status === "error" && (
          <div className="text-center animate-fade-in">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de Paiement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-red-50 rounded-lg p-4 mb-6 text-sm text-red-700">Votre paiement n'a pas pu être confirmé. Si le problème persiste, contactez le support.</div>
            <button onClick={() => router.refresh()} className="w-full bg-blue-600 text-white py-3 rounded-lg mb-2 hover:bg-blue-700 transition">Réessayer</button>
            <button onClick={handleReturnHome} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition">Retour à l'accueil</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-40 text-gray-500">Chargement...</div>}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
