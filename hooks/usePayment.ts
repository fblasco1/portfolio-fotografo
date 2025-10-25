"use client";

import { useState } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import type { RegionInfo } from '@/lib/payment/region-detector';
import type { PaymentIntent, PaymentResult } from '@/lib/payment/payment-factory';

interface UsePaymentReturn {
  // Estados
  loading: boolean;
  error: string | null;
  paymentIntent: PaymentIntent | null;
  
  // Funciones
  createPaymentIntent: (items: any[], customerInfo?: any) => Promise<PaymentIntent | null>;
  processPayment: (paymentData: any) => Promise<PaymentResult>;
  clearError: () => void;
}

export function usePayment(): UsePaymentReturn {
  const { region } = useRegion();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  const createPaymentIntent = async (items: any[], customerInfo?: any): Promise<PaymentIntent | null> => {
    if (!region) {
      setError('Región no detectada');
      return null;
    }

    setLoading(true);
    setError(null);

    try {

      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region,
          items,
          customerInfo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creando sesión de pago');
      }

      if (!data.success) {
        throw new Error(data.error || 'Error en la respuesta del servidor');
      }

      setPaymentIntent(data.paymentIntent);
      return data.paymentIntent;

    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      console.error('❌ Error creando sesión de pago:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (paymentData: any): Promise<PaymentResult> => {
    if (!region) {
      return {
        success: false,
        error: 'Región no detectada',
        status: 'failed',
        provider: 'unknown'
      };
    }

    setLoading(true);
    setError(null);

    try {

      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region,
          paymentData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando pago');
      }

      if (!data.success) {
        throw new Error(data.error || 'Error en la respuesta del servidor');
      }

      return data.result;

    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      console.error('❌ Error procesando pago:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        status: 'failed',
        provider: region.paymentProvider
      };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    paymentIntent,
    createPaymentIntent,
    processPayment,
    clearError
  };
}

