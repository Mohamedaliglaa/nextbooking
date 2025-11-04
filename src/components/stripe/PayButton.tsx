// components/stripe/PayButton.tsx
'use client';

import React, { useState } from 'react';
import { useCheckout } from '@stripe/react-stripe-js/checkout';
import { CreditCard, Loader } from 'lucide-react';

interface PayButtonProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PayButton({ amount, onSuccess, onError }: PayButtonProps) {
  const checkoutState = useCheckout();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (checkoutState.type !== 'success') return;

    setLoading(true);
    
    try {
      const result = await checkoutState.checkout.confirm();
      
      if (result.type === 'error') {
        onError?.(result.error.message);
      } else if (result.type === 'success') {
        onSuccess?.();
      }
    } catch (error: any) {
      onError?.(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutState.type !== 'success') {
    return null;
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-lg shadow-lg flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
          Traitement en cours...
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5" />
          Payer {amount.toFixed(2)} €
        </>
      )}
    </button>
  );
}