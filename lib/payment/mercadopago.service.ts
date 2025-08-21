import type { PaymentProvider, RegionInfo } from './payment-factory';

export class MercadoPagoProvider implements PaymentProvider {
  name = 'mercadopago';
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    
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

  async createPaymentIntent(amount: number, currency: string, items: any[]): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const preference = {
        items: items.map(item => ({
          title: item.title,
          unit_price: item.price,
          quantity: item.quantity,
          currency_id: currency,
          picture_url: item.image
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`
        },
        auto_return: 'approved',
        external_reference: `order_${Date.now()}`,
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook/mercadopago`,
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
      };

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preference)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error de Mercado Pago: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        amount: amount,
        client_secret: data.id, // Mercado Pago usa el preference ID
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point
      };
    } catch (error) {
      console.error('Error creando preferencia de Mercado Pago:', error);
      throw error;
    }
  }

  async processPayment(paymentData: any): Promise<any> {
    // Mercado Pago procesa el pago en su plataforma
    // Este método se usa para verificar el estado del pago
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const { payment_id } = paymentData;
      
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error verificando pago: ${response.statusText}`);
      }

      const payment = await response.json();
      
      return {
        transaction_id: payment.id,
        status: payment.status,
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        payment_method: payment.payment_method?.type,
        external_reference: payment.external_reference
      };
    } catch (error) {
      console.error('Error procesando pago de Mercado Pago:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error obteniendo estado del pago: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estado del pago:', error);
      throw error;
    }
  }
}

