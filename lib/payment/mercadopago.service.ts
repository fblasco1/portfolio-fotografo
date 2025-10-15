import type { PaymentProvider, RegionInfo } from './payment-factory';
import type {
  PaymentRequest,
  PaymentResponse,
  InstallmentOption,
  PaymentMethod,
  Issuer,
} from '@/app/types/payment';

export class MercadoPagoProvider implements PaymentProvider {
  name = 'mercadopago';
  private accessToken: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    
    if (!this.accessToken) {
      console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN no está configurada');
    }
  }

  isAvailable(region: RegionInfo): boolean {
    // Mercado Pago está disponible en Latinoamérica
    return region.isLatinAmerica && !!this.accessToken;
  }

  getPaymentMethods(): string[] {
    return [
      'credit_card',
      'debit_card',
      'bank_transfer',
      'cash',
      'digital_wallet'
    ];
  }

  /**
   * Crear un pago usando Checkout API (Transparente)
   * @param paymentData Datos del pago incluyendo token de tarjeta
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      // Generar ID de orden único
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Preparar payload para Mercado Pago (solo parámetros válidos)
      const payload = {
        token: paymentData.token,
        transaction_amount: paymentData.transaction_amount,
        installments: paymentData.installments,
        ...(paymentData.payment_method_id && { payment_method_id: paymentData.payment_method_id }),
        ...(paymentData.issuer_id && { issuer_id: paymentData.issuer_id }),
        payer: {
          email: paymentData.payer.email,
          first_name: paymentData.payer.first_name,
          last_name: paymentData.payer.last_name,
          identification: paymentData.payer.identification,
          address: paymentData.payer.address,
          phone: paymentData.payer.phone,
        },
        description: paymentData.description || 'Compra en Portfolio Fotográfico',
        external_reference: paymentData.external_reference || orderId,
        statement_descriptor: paymentData.statement_descriptor || 'CRISTIAN PIROVANO',
        metadata: {
          ...(paymentData.metadata || {}),
          platform: 'portfolio-fotografo',
          integration_type: 'checkout_api',
          integration_version: '2.0.0',
          order_id: orderId,
          created_at: new Date().toISOString(),
        },
        // Solo incluir notification_url en producción (no en localhost)
        ...(this.baseUrl && !this.baseUrl.includes('localhost') ? {
          notification_url: paymentData.notification_url || 
            `${this.baseUrl}/api/payment/webhook/mercadopago?source_news=webhooks`
        } : {}),
      };

        // Log para debugging (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          console.log('Creando pago con Checkout API:', {
            orderId,
            amount: payload.transaction_amount,
            installments: payload.installments,
            payment_method: payload.payment_method_id,
            email: payload.payer.email,
          });
        }

      // Generar Idempotency Key único para prevenir duplicados
      const idempotencyKey = `${orderId}_${Date.now()}`;

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
          'X-Platform-Id': 'portfolio-fotografo',
          'X-Integrator-Id': 'dev_portfolio',
        },
        body: JSON.stringify(payload),
      });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (process.env.NODE_ENV === 'development') {
            console.error('Error de Mercado Pago:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
              orderId,
            });
          }

          // Manejar errores específicos de Mercado Pago
          const errorMessage = this.getErrorMessage(errorData, response.status);
          throw new Error(errorMessage);
        }

      const data: PaymentResponse = await response.json();

      // Log exitoso (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        console.log('Pago creado exitosamente:', {
          paymentId: data.id,
          status: data.status,
          statusDetail: data.status_detail,
          amount: data.transaction_amount,
          orderId,
        });
      }

      return data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error crítico creando pago:', {
          error: error.message,
          stack: error.stack,
        });
      }

      throw new Error(
        `No se pudo procesar el pago: ${error.message || 'Error desconocido'}`
      );
    }
  }

  /**
   * Obtener cuotas disponibles para un monto y tarjeta
   */
  async getInstallments(
    amount: number,
    bin: string,
    locale?: string
  ): Promise<InstallmentOption[]> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const params = new URLSearchParams({
        amount: amount.toString(),
        bin: bin,
        ...(locale && { locale }),
      });

      const response = await fetch(
        `https://api.mercadopago.com/v1/payment_methods/installments?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo cuotas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error obteniendo cuotas:', error);
      throw error;
    }
  }

  /**
   * Obtener métodos de pago disponibles
   */
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const response = await fetch(
        'https://api.mercadopago.com/v1/payment_methods',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo métodos de pago: ${response.statusText}`);
      }

      const methods: PaymentMethod[] = await response.json();
      
      // Filtrar solo tarjetas de crédito y débito
      return methods.filter(
        (method) => method.payment_type_id === 'credit_card' || 
                    method.payment_type_id === 'debit_card'
      );
    } catch (error: any) {
      console.error('Error obteniendo métodos de pago:', error);
      throw error;
    }
  }

  /**
   * Obtener emisores (bancos) para un método de pago
   */
  async getIssuers(
    paymentMethodId: string,
    bin: string
  ): Promise<Issuer[]> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const params = new URLSearchParams({
        payment_method_id: paymentMethodId,
        bin: bin,
      });

      const response = await fetch(
        `https://api.mercadopago.com/v1/payment_methods/card_issuers?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo emisores: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error obteniendo emisores:', error);
      throw error;
    }
  }

  /**
   * Obtener el estado de un pago
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo estado del pago: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error obteniendo estado del pago:', error);
      throw error;
    }
  }

  /**
   * Procesar un pago (método legacy para compatibilidad)
   * @deprecated Usar createPayment en su lugar
   */
  async processPayment(paymentData: any): Promise<any> {
    const { payment_id } = paymentData;
    
    if (payment_id) {
      return this.getPaymentStatus(payment_id);
    }
    
    throw new Error('payment_id es requerido');
  }


  /**
   * Obtener mensaje de error amigable basado en el error de Mercado Pago
   */
  private getErrorMessage(errorData: any, status: number): string {
    // Errores específicos conocidos
    const errorMessages: Record<string, string> = {
      'bin_exclusion': 'La tarjeta ingresada no es válida o no está permitida para este tipo de transacción. Por favor, intenta con otra tarjeta de crédito o débito.',
      'invalid_card_number': 'El número de tarjeta ingresado no es válido. Verifica los datos e intenta nuevamente.',
      'invalid_expiration_date': 'La fecha de vencimiento de la tarjeta no es válida. Verifica el mes y año.',
      'invalid_security_code': 'El código de seguridad (CVV) ingresado no es válido.',
      'invalid_cardholder_name': 'El nombre del titular de la tarjeta no es válido.',
      'invalid_identification': 'El documento de identificación ingresado no es válido.',
      'insufficient_amount': 'El monto de la transacción es insuficiente.',
      'duplicated_payment': 'Ya existe un pago con los mismos datos. Por favor, espera unos minutos e intenta nuevamente.',
      'card_disabled': 'La tarjeta ingresada está deshabilitada. Contacta a tu banco o intenta con otra tarjeta.',
      'card_not_supported': 'El tipo de tarjeta ingresada no es compatible con este método de pago.',
      'invalid_payment_method': 'El método de pago seleccionado no es válido.',
      'payment_method_not_found': 'El método de pago no fue encontrado. Verifica los datos de la tarjeta.',
      'invalid_installments': 'El número de cuotas seleccionado no es válido.',
      'invalid_issuer': 'El emisor de la tarjeta no es válido.',
      'call_for_authorize': 'La transacción requiere autorización. Contacta a tu banco para autorizar el pago.',
      'card_not_authorized': 'La tarjeta no está autorizada para realizar esta transacción.',
      'expired_card': 'La tarjeta ingresada ha expirado. Verifica la fecha de vencimiento.',
      'invalid_user': 'Los datos del usuario no son válidos.',
      'invalid_payer': 'Los datos del pagador no son válidos.',
      'invalid_transaction_amount': 'El monto de la transacción no es válido.',
      'invalid_currency': 'La moneda de la transacción no es válida.',
      'invalid_operation_type': 'El tipo de operación no es válido.',
      'invalid_payment_type': 'El tipo de pago no es válido.',
      'invalid_payment_method_id': 'El ID del método de pago no es válido.',
      'invalid_token': 'El token de la tarjeta no es válido o ha expirado.',
      'invalid_external_reference': 'La referencia externa no es válida.',
      'invalid_notification_url': 'La URL de notificación no es válida.',
      'invalid_metadata': 'Los metadatos no son válidos.',
      'invalid_statement_descriptor': 'El descriptor de estado no es válido.',
      'invalid_processing_mode': 'El modo de procesamiento no es válido.',
      'invalid_merchant_account': 'La cuenta del comerciante no es válida.',
      'invalid_merchant_services': 'Los servicios del comerciante no son válidos.',
      'invalid_merchant_operations': 'Las operaciones del comerciante no son válidas.',
      'invalid_merchant_risk': 'El riesgo del comerciante no es válido.',
      'invalid_merchant_limits': 'Los límites del comerciante no son válidos.',
      'invalid_merchant_configuration': 'La configuración del comerciante no es válida.',
      'invalid_merchant_status': 'El estado del comerciante no es válido.',
      'invalid_merchant_verification': 'La verificación del comerciante no es válida.',
      'invalid_merchant_authorization': 'La autorización del comerciante no es válida.',
      'invalid_merchant_permissions': 'Los permisos del comerciante no son válidos.',
      'invalid_merchant_credentials': 'Las credenciales del comerciante no son válidas.',
      'invalid_merchant_environment': 'El entorno del comerciante no es válido.',
      'invalid_merchant_integration': 'La integración del comerciante no es válida.',
      'invalid_merchant_test_mode': 'El modo de prueba del comerciante no es válido.',
      'invalid_merchant_production_mode': 'El modo de producción del comerciante no es válido.',
      'invalid_merchant_sandbox_mode': 'El modo sandbox del comerciante no es válido.',
      'invalid_merchant_webhook': 'El webhook del comerciante no es válido.',
      'invalid_merchant_callback': 'El callback del comerciante no es válido.',
      'invalid_merchant_redirect': 'La redirección del comerciante no es válida.',
      'invalid_merchant_notification': 'La notificación del comerciante no es válida.',
      'invalid_merchant_webhook_url': 'La URL del webhook del comerciante no es válida.',
      'invalid_merchant_callback_url': 'La URL del callback del comerciante no es válida.',
      'invalid_merchant_redirect_url': 'La URL de redirección del comerciante no es válida.',
      'invalid_merchant_notification_url': 'La URL de notificación del comerciante no es válida.',
    };

    // Buscar el código de error específico
    if (errorData.cause && Array.isArray(errorData.cause)) {
      for (const cause of errorData.cause) {
        if (cause.code && errorMessages[cause.code]) {
          return errorMessages[cause.code];
        }
      }
    }

    // Si hay un código de error directo
    if (errorData.code && errorMessages[errorData.code]) {
      return errorMessages[errorData.code];
    }

    // Si hay un mensaje específico
    if (errorData.message) {
      return `Error de Mercado Pago: ${errorData.message}`;
    }

    // Si hay causas con descripciones
    if (errorData.cause && Array.isArray(errorData.cause)) {
      const causes = errorData.cause.map((c: any) => c.description || c.code).join(', ');
      return `Error de Mercado Pago: ${causes}`;
    }

    // Error genérico basado en el status
    const statusMessages: Record<number, string> = {
      400: 'Los datos enviados no son válidos. Por favor, verifica la información e intenta nuevamente.',
      401: 'Error de autenticación. Por favor, contacta al soporte técnico.',
      403: 'No tienes permisos para realizar esta operación.',
      404: 'El recurso solicitado no fue encontrado.',
      422: 'Los datos enviados no son válidos. Por favor, verifica la información e intenta nuevamente.',
      429: 'Has realizado demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.',
      500: 'Error interno del servidor. Por favor, intenta nuevamente más tarde.',
      502: 'Error de conexión con el servidor. Por favor, intenta nuevamente más tarde.',
      503: 'El servicio no está disponible temporalmente. Por favor, intenta nuevamente más tarde.',
    };

    return statusMessages[status] || `Error de Mercado Pago (${status}). Por favor, intenta nuevamente.`;
  }
}
