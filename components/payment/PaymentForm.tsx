'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useRegion } from '@/hooks/useRegion';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { Button } from '@/app/[locale]/components/ui/button';
import { CardForm } from './CardForm';
// import { InstallmentSelector } from './InstallmentSelector'; // Removido - solo pago único
import { MercadoPagoScript } from './MercadoPagoScript';
import type { CardFormData, Installment, PaymentMethod, IdentificationType } from '@/app/types/payment';

interface PaymentFormProps {
  onSuccess: (paymentId: number, status: string) => void;
  onError: (error: string) => void;
  customerInfo?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export function PaymentForm({ onSuccess, onError, customerInfo }: PaymentFormProps) {
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';
  const { items: cart, getTotals, clearCart } = useCart();
  const { region } = useRegion();
  
  // Calcular total
  const totals = getTotals();
  const total = totals?.total || 0;

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState<CardFormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CardFormData, string>>>({});
  
  const [identificationTypes, setIdentificationTypes] = useState<IdentificationType[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  // const [installments, setInstallments] = useState<Installment[]>([]); // Removido - solo pago único
  const selectedInstallment = 1; // Siempre 1 cuota
  const [bin, setBin] = useState<string>('');

  const {
    isReady,
    error: mpError,
    getIdentificationTypes,
    getPaymentMethods,
    // getInstallments: fetchInstallments, // Removido - solo pago único
    createCardToken,
  } = useMercadoPago({ publicKey, locale: region?.country === 'BR' ? 'pt-BR' : 'es-AR' });

  // Cargar tipos de identificación cuando el SDK esté listo
  useEffect(() => {
    if (isReady) {
      getIdentificationTypes()
        .then(setIdentificationTypes)
        .catch((err) => {
          console.error('Error cargando tipos de identificación:', err);
        });
    }
  }, [isReady, getIdentificationTypes]);

  // Detectar método de pago cuando cambia el BIN
  useEffect(() => {
    if (bin.length >= 6 && isReady) {
      console.log('🔍 Detectando método de pago para BIN:', bin);
      getPaymentMethods(bin)
        .then((methods) => {
          console.log('📋 Métodos de pago encontrados:', methods);
          if (methods.length > 0) {
            setPaymentMethod(methods[0]);
            console.log('✅ Método de pago establecido:', methods[0].id);
            // Cuotas fijas en 1 (pago único)
            return [];
          } else {
            console.log('⚠️ No se encontraron métodos de pago para el BIN, usando detección automática');
            // Detectar método de pago automáticamente basado en el BIN
            const detectedMethod = detectPaymentMethodFromBin(bin);
            if (detectedMethod) {
              setPaymentMethod(detectedMethod);
              console.log('✅ Método de pago detectado automáticamente:', detectedMethod.id);
            }
          }
          return [];
        })
        .then(() => {
          // Solo pago único - no necesitamos manejar cuotas
          console.log('✅ Pago único configurado');
        })
        .catch((err) => {
          console.error('❌ Error obteniendo información de la tarjeta:', err);
          // Detectar método de pago automáticamente como fallback
          const detectedMethod = detectPaymentMethodFromBin(bin);
          if (detectedMethod) {
            setPaymentMethod(detectedMethod);
            console.log('✅ Método de pago detectado automáticamente (fallback):', detectedMethod.id);
          }
        });
    } else if (bin.length < 6) {
      setPaymentMethod(null);
    }
  }, [bin, total, isReady, getPaymentMethods]);

  // Función para detectar método de pago basado en BIN
  const detectPaymentMethodFromBin = (bin: string) => {
    const binPrefixes: Record<string, any> = {
      '4': { id: 'visa', name: 'Visa', type: 'credit_card' },
      '5': { id: 'master', name: 'Mastercard', type: 'credit_card' },
      '3': { id: 'amex', name: 'American Express', type: 'credit_card' },
      '6': { id: 'elo', name: 'Elo', type: 'credit_card' },
      '5041': { id: 'visa', name: 'Visa', type: 'credit_card' },
      '5031': { id: 'visa', name: 'Visa', type: 'credit_card' },
      '4013': { id: 'visa', name: 'Visa', type: 'credit_card' },
      '4509': { id: 'visa', name: 'Visa', type: 'credit_card' },
      '4916': { id: 'visa', name: 'Visa', type: 'credit_card' },
      '4177': { id: 'visa', name: 'Visa', type: 'credit_card' },
      '4658': { id: 'visa', name: 'Visa', type: 'credit_card' },
      '5078': { id: 'master', name: 'Mastercard', type: 'credit_card' },
    };

    // Buscar por prefijo exacto primero
    for (const prefix in binPrefixes) {
      if (bin.startsWith(prefix)) {
        return binPrefixes[prefix];
      }
    }

    return null;
  };

  // Validar si el formulario está completo
  const isFormValid = (): boolean => {
    if (!cardData) return false;
    
    // Validación básica sin requerir paymentMethod (se detectará en el backend)
    const isValid = !!(
      cardData.cardNumber &&
      cardData.cardNumber.length >= 13 &&
      cardData.cardholderName &&
      cardData.cardholderName.length >= 3 &&
      cardData.cardExpirationMonth &&
      cardData.cardExpirationYear &&
      cardData.securityCode &&
      cardData.securityCode.length >= 3 &&
      cardData.identificationType &&
      cardData.identificationNumber
    );
    
    // Debug: mostrar estado de validación
    if (!isValid) {
      console.log('🔍 Validación del formulario:', {
        cardNumber: cardData.cardNumber?.length,
        cardholderName: cardData.cardholderName?.length,
        cardExpirationMonth: cardData.cardExpirationMonth,
        cardExpirationYear: cardData.cardExpirationYear,
        securityCode: cardData.securityCode?.length,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber,
        paymentMethod: paymentMethod
      });
    }
    
    return isValid;
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CardFormData, string>> = {};

    if (!cardData) {
      onError('Por favor completa los datos de la tarjeta');
      return false;
    }

    if (!cardData.cardNumber || cardData.cardNumber.length < 13) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    if (!cardData.cardholderName || cardData.cardholderName.length < 3) {
      newErrors.cardholderName = 'Nombre del titular requerido';
    }

    if (!cardData.cardExpirationMonth) {
      newErrors.cardExpirationMonth = 'Mes requerido';
    }

    if (!cardData.cardExpirationYear) {
      newErrors.cardExpirationYear = 'Año requerido';
    }

    if (!cardData.securityCode || cardData.securityCode.length < 3) {
      newErrors.securityCode = 'CVV inválido';
    }

    if (!cardData.identificationType) {
      newErrors.identificationType = 'Tipo de documento requerido';
    }

    if (!cardData.identificationNumber) {
      newErrors.identificationNumber = 'Número de documento requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pago
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !cardData || !paymentMethod || !region || !customerInfo) {
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      console.log('🔒 Iniciando proceso de pago...');

      // 1. Tokenizar tarjeta
      const token = await createCardToken(cardData);

      console.log('✅ Token creado, procesando pago...');

      // 2. Enviar pago al backend
      const response = await fetch('/api/payment/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region,
          paymentData: {
            token: token.id,
            transaction_amount: total,
            installments: selectedInstallment,
            payment_method_id: paymentMethod.id,
            payer: {
              email: customerInfo.email,
              first_name: customerInfo.firstName,
              last_name: customerInfo.lastName,
              identification: {
                type: cardData.identificationType,
                number: cardData.identificationNumber,
              },
            },
            description: `Compra en Portfolio Fotográfico - ${cart.length} items`,
            metadata: {
              cart_items: cart.map((item: any) => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                productType: item.productType,
              })),
            },
          },
        }),
      });

      const data = await response.json();

      if (!data.success || !data.payment) {
        throw new Error(data.error || 'Error procesando el pago');
      }

      const payment = data.payment;

      console.log('✅ Pago procesado:', {
        id: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
      });

      // Limpiar carrito si el pago fue aprobado
      if (payment.status === 'approved') {
        clearCart();
      }

      // Llamar callback de éxito
      onSuccess(payment.id, payment.status);

    } catch (error: any) {
      console.error('❌ Error procesando pago:', error);
      onError(error.message || 'Error procesando el pago. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!publicKey) {
    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            Error: Public Key de Mercado Pago no configurada. 
            Agrega NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY a tu archivo .env.local
          </p>
        </div>
    );
  }

  if (mpError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error cargando Mercado Pago: {mpError.message}</p>
      </div>
    );
  }

  return (
    <>
      <MercadoPagoScript
        publicKey={publicKey}
        onLoad={() => setIsScriptLoaded(true)}
        onError={(err) => onError(`Error cargando SDK: ${err.message}`)}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isReady ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando formulario de pago...</span>
          </div>
        ) : (
          <>
            <CardForm
              identificationTypes={identificationTypes}
              onDataChange={setCardData}
              onBinChange={setBin}
              errors={errors}
            />

            {/* Sección de cuotas eliminada - solo pago único */}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total a pagar:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: region?.currency || 'ARS',
                  }).format(total)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isProcessing || !isReady || !isFormValid()}
                className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando pago...
                  </span>
                ) : (
                  'Pagar ahora'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                🔒 Pago seguro procesado por Mercado Pago
              </p>
            </div>
          </>
        )}
      </form>
    </>
  );
}

