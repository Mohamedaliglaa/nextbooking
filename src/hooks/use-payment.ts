import { useState, useCallback } from 'react';
import { useUIStore } from '@/lib/store/ui-store';
import { paymentService } from '@/lib/api/payment-service';
import { CheckoutSessionResponse, Payment, ProcessPaymentRequest } from '@/types/payment';

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { setLoading, addToast } = useUIStore();

  const createCheckoutSession = useCallback(async (rideId: number): Promise<CheckoutSessionResponse> => {
    setLoading('payment', true);
    try {
      const session = await paymentService.createCheckoutSession(rideId);
      return session;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de paiement',
        description: error.message || 'Impossible de créer la session de paiement',
      });
      throw error;
    } finally {
      setLoading('payment', false);
    }
  }, [setLoading, addToast]);

  const processPayment = useCallback(async (rideId: number, paymentData: ProcessPaymentRequest): Promise<Payment> => {
    setIsProcessing(true);
    try {
      const payment = await paymentService.processPayment(rideId, paymentData);
      
      addToast({
        type: 'success',
        title: 'Paiement traité',
        description: 'Votre paiement a été traité avec succès',
      });
      
      return payment;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de paiement',
        description: error.message || 'Impossible de traiter le paiement',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [addToast]);

  const requestRefund = useCallback(async (paymentId: number, reason: string): Promise<Payment> => {
    setLoading('payment', true);
    try {
      const payment = await paymentService.requestRefund(paymentId, reason);
      
      addToast({
        type: 'success',
        title: 'Demande de remboursement',
        description: 'Votre demande a été envoyée',
      });
      
      return payment;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de remboursement',
        description: error.message || 'Impossible de demander le remboursement',
      });
      throw error;
    } finally {
      setLoading('payment', false);
    }
  }, [setLoading, addToast]);

  return {
    isProcessing,
    createCheckoutSession,
    processPayment,
    requestRefund,
  };
};
