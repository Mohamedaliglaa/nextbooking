// components/stripe/PaymentElement.tsx
'use client';

import React, { useState } from 'react';
import { PaymentElement, useCheckout } from '@stripe/react-stripe-js/checkout';

export default function StripePaymentElement() {
  const checkoutState = useCheckout();
  const [error, setError] = useState<string | null>(null);

  if (checkoutState.type === 'loading') {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement du paiement...</span>
      </div>
    );
  }

  if (checkoutState.type === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Erreur de paiement</p>
        <p className="text-red-600 text-sm mt-1">{checkoutState.error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            }
          }}
          onChange={(e) => {
            setError(null);
          }}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}