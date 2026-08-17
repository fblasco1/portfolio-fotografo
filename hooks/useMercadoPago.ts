'use client';

import { useEffect, useState, useCallback } from 'react';
import { getErrorMessage } from '@/lib/utils';
import type {
  MercadoPagoInstance,
  CardToken,
  PaymentMethod,
  Issuer,
  InstallmentOption,
  CardFormData,
  IdentificationType,
} from '@/app/types/payment';

/** Fallback cuando el SDK falla (public key inválida, red, etc.) */
const FALLBACK_IDENTIFICATION_TYPES: IdentificationType[] = [
  { id: 'DNI', name: 'DNI', type: 'number', min_length: 7, max_length: 8 },
  { id: 'CI', name: 'CI', type: 'number', min_length: 7, max_length: 9 },
  { id: 'CPF', name: 'CPF', type: 'number', min_length: 11, max_length: 11 },
  { id: 'CC', name: 'Cédula', type: 'number', min_length: 6, max_length: 10 },
  { id: 'RUT', name: 'RUT', type: 'string', min_length: 8, max_length: 9 },
];

interface UseMercadoPagoOptions {
  publicKey: string;
  locale?: string;
}

export function useMercadoPago({ publicKey, locale = 'es-AR' }: UseMercadoPagoOptions) {
  const [mp, setMp] = useState<MercadoPagoInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Inicializar Mercado Pago SDK
  useEffect(() => {
    if (!publicKey) {
      console.error('❌ Public key es requerida');
      setError(new Error('Public key es requerida'));
      return;
    }

    const checkSDK = () => {
      if (window.MercadoPago) {
        try {
          const mpInstance = new window.MercadoPago(publicKey, { locale });
          setMp(mpInstance);
          setIsReady(true);
        } catch (err) {
          const e = err as Error;
          setError(e);
          console.error('❌ Error inicializando Mercado Pago SDK:', e?.message ?? String(err));
        }
      } else {
        setTimeout(checkSDK, 100);
      }
    };

    checkSDK();
  }, [publicKey, locale]);

  // Obtener tipos de identificación (usa fallback si SDK no está listo o falla)
  const getIdentificationTypes = useCallback(async (): Promise<IdentificationType[]> => {
    if (!mp) {
      console.warn('Mercado Pago SDK no está listo, usando tipos de identificación por defecto');
      return FALLBACK_IDENTIFICATION_TYPES;
    }

    try {
      const types = await mp.getIdentificationTypes();
      if (Array.isArray(types) && types.length > 0) return types;
      return FALLBACK_IDENTIFICATION_TYPES;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.warn('Tipos de identificación desde SDK fallaron, usando fallback:', msg);
      return FALLBACK_IDENTIFICATION_TYPES;
    }
  }, [mp]);

  // Obtener métodos de pago según BIN (devuelve [] si falla; no lanza)
  const getPaymentMethods = useCallback(async (bin: string): Promise<PaymentMethod[]> => {
    if (!mp) {
      console.warn('Mercado Pago SDK no listo al obtener métodos de pago');
      return [];
    }

    try {
      const methods = await mp.getPaymentMethods({ bin });
      if (Array.isArray(methods)) return methods;
      if (methods && Array.isArray(methods.results)) return methods.results;
      return [];
    } catch (err) {
      const msg = getErrorMessage(err);
      console.warn('Métodos de pago desde SDK fallaron, se ignora BIN:', msg);
      return [];
    }
  }, [mp]);

  // Obtener emisores (devuelve [] si falla)
  const getIssuers = useCallback(async (
    paymentMethodId: string,
    bin: string
  ): Promise<Issuer[]> => {
    if (!mp) return [];
    try {
      const issuers = await mp.getIssuers({ paymentMethodId, bin });
      return Array.isArray(issuers) ? issuers : [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Emisores desde SDK fallaron:', msg);
      return [];
    }
  }, [mp]);

  // Obtener cuotas (devuelve [] si falla)
  const getInstallments = useCallback(async (
    amount: number,
    bin: string
  ): Promise<InstallmentOption[]> => {
    if (!mp) return [];
    try {
      const installments = await mp.getInstallments({
        amount: amount.toString(),
        bin,
        locale,
      });
      return Array.isArray(installments) ? installments : [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Cuotas desde SDK fallaron:', msg);
      return [];
    }
  }, [mp, locale]);

  // Crear token de tarjeta
  const createCardToken = useCallback(async (cardData: CardFormData): Promise<CardToken> => {
    if (!mp) {
      throw new Error('Mercado Pago SDK no está inicializado');
    }

    try {
      console.log('🔒 Tokenizando tarjeta...', {
        cardNumber: cardData.cardNumber?.replace(/\s/g, ''),
        cardExpirationMonth: cardData.cardExpirationMonth,
        cardExpirationYear: cardData.cardExpirationYear,
        securityCode: cardData.securityCode,
        cardholderName: cardData.cardholderName,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber
      });

      // Usar los datos directamente del cardData
      const token = await mp.createCardToken(cardData);
      return token;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('❌ Error creando token de tarjeta:', msg);
      throw new Error(msg);
    }
  }, [mp]);

  return {
    mp,
    isReady,
    error,
    getIdentificationTypes,
    getPaymentMethods,
    getIssuers,
    getInstallments,
    createCardToken,
  };
}

