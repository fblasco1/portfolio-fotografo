'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRegion } from '@/contexts/RegionContext';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { getErrorMessage, formatPaymentError } from '@/lib/utils';
import { Button } from '@/app/[locale]/components/ui/button';
import { CardForm } from './CardForm';
// import { InstallmentSelector } from './InstallmentSelector'; // Removido - solo pago único
import { MercadoPagoScript } from './MercadoPagoScript';
import type { CardFormData, Installment, PaymentMethod, IdentificationType } from '@/app/types/payment';

export type PaymentLineItem = {
  id: string;
  title: string;
  quantity: number;
  productType: 'photos' | 'postcards' | 'book';
};

interface PaymentFormProps {
  onSuccess: (paymentId: number | string, status: string) => void;
  onError: (error: string) => void;
  customerInfo?: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: {
      street_name?: string;
      street_number?: string;
      city?: string;
      zip_code?: string;
      federal_unit?: string;
    };
  };
  total?: number; // Total calculado desde el checkout
  /** Checkout libro u otro flujo sin carrito de tienda: metadata MP y sin vaciar el carrito de fotos */
  paymentLineItems?: PaymentLineItem[];
}

export function PaymentForm({
  onSuccess,
  onError,
  customerInfo,
  total: propTotal,
  paymentLineItems,
}: PaymentFormProps) {
  const publicKey = (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '').trim();
  const { items: cart, getTotals, clearCart } = useCart();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && publicKey) {
      const prefijo = publicKey.startsWith('TEST-') ? 'TEST-' : publicKey.startsWith('APP_USR-') ? 'APP_USR-' : '?';
      console.info(`[MP] Public key: ${prefijo}... (${publicKey.length} chars)`);
    }
  }, [publicKey]);
  const { region } = useRegion();
  
  // Usar el total pasado como prop, o calcularlo desde el carrito como fallback
  const totals = getTotals();
  const total = propTotal !== undefined ? propTotal : (totals?.total || 0);

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState<CardFormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CardFormData, string>>>({});
  
  const [identificationTypes, setIdentificationTypes] = useState<IdentificationType[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const selectedInstallment = 1;
  const [bin, setBin] = useState<string>('');

  const {
    isReady,
    error: mpError,
    getIdentificationTypes,
    getPaymentMethods,
    createCardToken,
  } = useMercadoPago({ publicKey, locale: region?.country === 'BR' ? 'pt-BR' : 'es-AR' });

  // Cargar tipos de identificación cuando el SDK esté listo (usa fallback si falla)
  useEffect(() => {
    if (isReady) {
      getIdentificationTypes()
        .then(setIdentificationTypes)
        .catch((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('Error cargando tipos de identificación:', msg);
          setIdentificationTypes([
            { id: 'DNI', name: 'DNI', type: 'number', min_length: 7, max_length: 8 },
            { id: 'CI', name: 'CI', type: 'number', min_length: 7, max_length: 9 },
            { id: 'CPF', name: 'CPF', type: 'number', min_length: 11, max_length: 11 },
          ]);
        });
    }
  }, [isReady, getIdentificationTypes]);

  // Detectar método de pago cuando cambia el BIN (getPaymentMethods ya devuelve [] si falla)
  useEffect(() => {
    if (bin.length >= 6 && isReady) {
      getPaymentMethods(bin)
        .then((response: any) => {
          let methodsArray: any[] = [];
          if (response && response.results && Array.isArray(response.results)) {
            methodsArray = response.results;
          } else if (Array.isArray(response)) {
            methodsArray = response;
          } else if (response && response.id) {
            methodsArray = [response];
          }

          if (methodsArray.length > 0) {
            setPaymentMethod(methodsArray[0]);
          } else {
            setPaymentMethod(null);
          }
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('Error obteniendo información de la tarjeta:', msg);
          setPaymentMethod(null);
        });
    } else {
      setPaymentMethod(null);
    }
  }, [bin, isReady, getPaymentMethods]);

  // Función para obtener el payment_method_id correcto
  const getCorrectPaymentMethodId = (method: any) => {
    if (!method || !method.id) {
      return undefined;
    }

    // El id que devuelve la API de Mercado Pago YA ES el payment_method_id correcto
    return method.id;
  };


  // Validar si el formulario está completo
  const isFormValid = (): boolean => {
    if (!cardData) return false;
    
    return !!(
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

    if (!validateForm() || !cardData || !region || !customerInfo) {
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      // 1. Tokenizar tarjeta
      const token = await createCardToken(cardData);

      // 2. Obtener método de pago correcto (si está disponible)
             const correctPaymentMethodId = paymentMethod ? getCorrectPaymentMethodId(paymentMethod) : undefined;

      // Generar external_reference único y robusto
      const lineItemsForMp =
        paymentLineItems && paymentLineItems.length > 0
          ? paymentLineItems
          : cart.map((item: any) => ({
              id: item.id,
              title: item.title,
              quantity: item.quantity || 1,
              productType: (item.productType || 'photos') as PaymentLineItem['productType'],
            }));

      const isIsolatedBookPayment = !!(paymentLineItems && paymentLineItems.length > 0);

      const externalReference = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${lineItemsForMp.length}items`;

      // Procesar teléfono para formato de Mercado Pago
      // Formato esperado: { area_code: "11", number: "12345678" }
      const phoneNumber = customerInfo?.phone || '';
      const phoneParts = phoneNumber.replace(/\D/g, ''); // Solo números
      let phoneAreaCode: string | undefined = undefined;
      let phoneNumberOnly: string | undefined = undefined;
      
      if (phoneParts.length >= 10) {
        // Formato internacional o con código de área: +54 11 1234-5678 o 11 1234-5678
        // Extraer código de área (últimos 2-4 dígitos antes del número)
        const lastDigits = phoneParts.slice(-8); // Últimos 8 dígitos son el número
        phoneNumberOnly = lastDigits;
        const remaining = phoneParts.slice(0, -8);
        if (remaining.length >= 2) {
          phoneAreaCode = remaining.slice(-2); // Últimos 2 dígitos del código de área
        }
      } else if (phoneParts.length >= 8) {
        // Solo número sin código de área
        phoneNumberOnly = phoneParts.slice(-8);
      }

      // 3. Enviar pago al backend
      const response = await fetch('/api/payment/v2/create-payment', {
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
            currency_id: region?.currency || 'ARS',
            ...(correctPaymentMethodId && { payment_method_id: correctPaymentMethodId }),
            payer: {
              email: customerInfo?.email || '',
              first_name: customerInfo?.firstName || '',
              last_name: customerInfo?.lastName || '',
              identification: {
                type: cardData.identificationType,
                number: cardData.identificationNumber,
              },
              // Agregar teléfono si está disponible (mejora aprobación de pagos)
              ...(phoneNumberOnly && phoneNumberOnly.length >= 8 && {
                phone: {
                  ...(phoneAreaCode && { area_code: phoneAreaCode }),
                  number: phoneNumberOnly,
                },
              }),
              // Agregar dirección si está disponible
              ...(customerInfo?.address && customerInfo.address.street_name && {
                address: {
                  zip_code: customerInfo.address.zip_code || '',
                  street_name: customerInfo.address.street_name || '',
                  street_number: customerInfo.address.street_number || '',
                  ...(customerInfo.address.city && { city: customerInfo.address.city }),
                  ...(customerInfo.address.federal_unit && { federal_unit: customerInfo.address.federal_unit }),
                },
              }),
            },
            description: isIsolatedBookPayment
              ? `Preventa libro — ${lineItemsForMp[0]?.title || 'Libro'}`
              : `Compra en Portfolio Fotográfico - ${lineItemsForMp.length} items`,
            external_reference: externalReference, // ✅ Mejorado: referencia única y consistente
            metadata: {
              cart_items: lineItemsForMp.map((item) => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                productType: item.productType,
              })),
              order_reference: externalReference,
              cart_total_items: lineItemsForMp.length,
            },
          },
        }),
      });

      const data = await response.json();

      if (!data.success || !data.payment) {
        let errorMessage = data.error || 'Error procesando el pago';
        
        // Manejar errores específicos de creación de orden
        if (data.error && data.error.includes('crear la orden')) {
          errorMessage = 'Error al iniciar el proceso de pago. Por favor, intenta nuevamente. Si el problema persiste, contacta al soporte.';
        } else if (data.error && data.error.includes('El carrito está vacío')) {
          errorMessage = 'El carrito está vacío. Agrega productos antes de proceder al pago.';
        }
        // Manejar errores específicos de Mercado Pago
        else if (data.error && data.error.includes('bin_exclusion')) {
          errorMessage = 'La tarjeta ingresada no es válida o no está permitida para este tipo de transacción. Por favor, intenta con otra tarjeta de crédito o débito.';
        } else if (data.error && data.error.includes('invalid_card_number')) {
          errorMessage = 'El número de tarjeta ingresado no es válido. Verifica los datos e intenta nuevamente.';
        } else if (data.error && data.error.includes('invalid_expiration_date')) {
          errorMessage = 'La fecha de vencimiento de la tarjeta no es válida. Verifica el mes y año.';
        } else if (data.error && data.error.includes('invalid_security_code')) {
          errorMessage = 'El código de seguridad (CVV) ingresado no es válido.';
        } else if (data.error && data.error.includes('card_disabled')) {
          errorMessage = 'La tarjeta ingresada está deshabilitada. Contacta a tu banco o intenta con otra tarjeta.';
        } else if (data.error && data.error.includes('expired_card')) {
          errorMessage = 'La tarjeta ingresada ha expirado. Verifica la fecha de vencimiento.';
        } else if (data.error && data.error.includes('call_for_authorize')) {
          errorMessage = 'La transacción requiere autorización. Contacta a tu banco para autorizar el pago.';
        }
        
        throw new Error(errorMessage);
      }

      const payment = data.payment;

      // Limpiar carrito de la tienda solo si el pago no es el flujo aislado del libro
      if (payment.status === 'approved' && !isIsolatedBookPayment) {
        clearCart();
      }

      // Llamar callback de éxito
      onSuccess(payment.id, payment.status);

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      const friendly = formatPaymentError(msg);
      console.error('❌ Error procesando pago:', msg);
      onError(friendly || 'Error procesando el pago. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!publicKey) {
    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
          <p className="text-red-600 font-medium">
            Public Key de Mercado Pago no configurada.
          </p>
          <p className="text-red-700 text-sm">
            Agrega <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY</code> en <code className="bg-red-100 px-1 rounded">.env.local</code> y reinicia el servidor (<code className="bg-red-100 px-1 rounded">npm run dev</code>) después de guardar.
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

