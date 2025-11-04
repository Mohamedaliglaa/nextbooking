'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

// IMPORTANT: must exist in .env.local and start with pk_test_ (or pk_live_)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

type Props = { clientSecret: string };

export default function StripeCheckoutProvider({ clientSecret }: Props) {
  // Basic config guard (helps catch missing env quickly)
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.error('[Stripe] Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
        Erreur de configuration Stripe côté client.
      </div>
    );
  }

  // If your API encoded the secret, decode once (safe if already plain)
  const secret =
    typeof clientSecret === 'string' ? decodeURIComponent(clientSecret) : '';

  // Must be a Checkout Session client secret: cs_test_..._secret_... (or cs_live_...)
  const looksValid = /^cs_(test|live)_[^_]+_secret_.+/.test(secret);
  if (!looksValid) {
    console.error('[Stripe] Invalid Embedded Checkout client secret:', secret);
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
        Erreur de paiement : client secret invalide.
      </div>
    );
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: secret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
