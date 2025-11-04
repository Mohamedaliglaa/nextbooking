// lib/stripe-config.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe("pk_test_51SL8CcCRRX26ohgIxCvMUC44R8bcsB7ANMj9ya4wPinO23gs1apSahv6nOT9Yy07rBQldvcsryZZuyr7u9Ku92yt005ysiuOel");
  }
  return stripePromise;
};