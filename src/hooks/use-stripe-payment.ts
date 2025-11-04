// hooks/use-stripe-payment.ts
import { useState, useCallback } from 'react';
import { stripeService } from '@/lib/api/stripe-service';
import { useToast } from './use-toast';

export const useStripePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processCheckoutSession = useCallback(async (rideId: number): Promise<string | null> => {
    setIsProcessing(true);
    
    try {
      // Create checkout session and get the URL
      const data = await stripeService.createCheckoutSession(rideId);
      if (data.successUrl ) {
        // Redirect to Stripe Checkout

        console.log('Redirecting to Stripe Checkout:', data.checkoutSessionId);
        return data.checkoutSessionId;

      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      toast.error('Erreur de paiement', error.message || 'Impossible de créer la session de paiement');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  // Simple method to handle cash payments
  const processCashPayment = useCallback(async (rideId: number, guestPhone?: string): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      await stripeService.processPayment(rideId, {
        method: 'cash',
        guest_phone: guestPhone,
      });
      return true;
    } catch (error: any) {
      console.error('Cash payment error:', error);
      toast.error('Erreur de paiement', error.message || 'Impossible de traiter le paiement en espèces');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    isProcessing,
    processCheckoutSession,
    processCashPayment,
  };
};