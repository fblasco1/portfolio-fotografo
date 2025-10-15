'use client';

import { useEffect, useState, useCallback } from 'react';
import type {
  MercadoPagoInstance,
  CardToken,
  PaymentMethod,
  Issuer,
  InstallmentOption,
  CardFormData,
  IdentificationType,
} from '@/app/types/payment';

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

    console.log('🚀 Inicializando Mercado Pago SDK con public key:', publicKey.substring(0, 10) + '...');

    // Esperar a que el SDK esté disponible
    const checkSDK = () => {
      if (window.MercadoPago) {
        try {
          console.log('📦 Creando instancia de Mercado Pago...');
          const mpInstance = new window.MercadoPago(publicKey, { locale });
          setMp(mpInstance);
          setIsReady(true);
          console.log('✅ Mercado Pago SDK inicializado correctamente');
        } catch (err) {
          setError(err as Error);
          console.error('❌ Error inicializando Mercado Pago SDK:', err);
        }
      } else {
        console.log('⏳ Esperando que el SDK de Mercado Pago esté disponible...');
        // Reintentar después de 100ms
        setTimeout(checkSDK, 100);
      }
    };

    checkSDK();
  }, [publicKey, locale]);

  // Obtener tipos de identificación
  const getIdentificationTypes = useCallback(async (): Promise<IdentificationType[]> => {
    if (!mp) {
      throw new Error('Mercado Pago SDK no está inicializado');
    }

    try {
      return await mp.getIdentificationTypes();
    } catch (err) {
      console.error('Error obteniendo tipos de identificación:', err);
      throw err;
    }
  }, [mp]);

  // Obtener métodos de pago según BIN
  const getPaymentMethods = useCallback(async (bin: string): Promise<PaymentMethod[]> => {
    if (!mp) {
      console.error('❌ Mercado Pago SDK no está inicializado');
      throw new Error('Mercado Pago SDK no está inicializado');
    }

    try {
      console.log('🔍 Obteniendo métodos de pago para BIN:', bin);
      const methods = await mp.getPaymentMethods({ bin });
      console.log('📋 Respuesta de métodos de pago:', methods);
      return methods;
    } catch (err) {
      console.error('❌ Error obteniendo métodos de pago:', err);
      throw err;
    }
  }, [mp]);

  // Obtener emisores
  const getIssuers = useCallback(async (
    paymentMethodId: string,
    bin: string
  ): Promise<Issuer[]> => {
    if (!mp) {
      throw new Error('Mercado Pago SDK no está inicializado');
    }

    try {
      return await mp.getIssuers({ paymentMethodId, bin });
    } catch (err) {
      console.error('Error obteniendo emisores:', err);
      throw err;
    }
  }, [mp]);

  // Obtener cuotas
  const getInstallments = useCallback(async (
    amount: number,
    bin: string
  ): Promise<InstallmentOption[]> => {
    if (!mp) {
      throw new Error('Mercado Pago SDK no está inicializado');
    }

    try {
      return await mp.getInstallments({
        amount: amount.toString(),
        bin,
        locale,
      });
    } catch (err) {
      console.error('Error obteniendo cuotas:', err);
      throw err;
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
      console.log('✅ Token creado exitosamente:', token.id);
      return token;
    } catch (err) {
      console.error('❌ Error creando token de tarjeta:', err);
      throw err;
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

