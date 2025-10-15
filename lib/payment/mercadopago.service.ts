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
      
      // Preparar payload para Mercado Pago
      const payload = {
        token: paymentData.token,
        transaction_amount: paymentData.transaction_amount,
        installments: paymentData.installments,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
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

      // Log para debugging
      console.log('💳 Creando pago con Checkout API:', {
        orderId,
        amount: payload.transaction_amount,
        installments: payload.installments,
        payment_method: payload.payment_method_id,
        email: payload.payer.email,
      });

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
        console.error('❌ Error de Mercado Pago:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          orderId,
        });

        // Extraer mensaje de error
        let errorMessage = `Error de Mercado Pago (${response.status})`;
        
        if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        } else if (errorData.cause && Array.isArray(errorData.cause)) {
          const causes = errorData.cause.map((c: any) => c.description || c.code).join(', ');
          errorMessage += `: ${causes}`;
        } else if (errorData.error) {
          errorMessage += `: ${errorData.error}`;
        }

        throw new Error(errorMessage);
      }

      const data: PaymentResponse = await response.json();

      // Log exitoso
      console.log('✅ Pago creado exitosamente:', {
        paymentId: data.id,
        status: data.status,
        statusDetail: data.status_detail,
        amount: data.transaction_amount,
        orderId,
      });

      return data;
    } catch (error: any) {
      console.error('❌ Error crítico creando pago:', {
        error: error.message,
        stack: error.stack,
      });

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
}
