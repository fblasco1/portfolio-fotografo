import type { PaymentProvider, RegionInfo } from './payment-factory';

export class StripeProvider implements PaymentProvider {
  name = 'stripe';
  private secretKey: string;
  private publishableKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
    this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    
    if (!this.secretKey || !this.publishableKey) {
      console.warn('⚠️ STRIPE_SECRET_KEY o STRIPE_PUBLISHABLE_KEY no están configuradas');
    }
  }

  isAvailable(region: RegionInfo): boolean {
    // Stripe está disponible globalmente, pero preferimos Mercado Pago para Latinoamérica
    return !region.isLatinAmerica && !!this.secretKey && !!this.publishableKey;
  }

  getPaymentMethods(): string[] {
    return [
      'card',
      'apple_pay',
      'google_pay',
      'bank_transfer',
      'sepa_debit'
    ];
  }

  async createPaymentIntent(amount: number, currency: string, items: any[]): Promise<any> {
    if (!this.secretKey) {
      throw new Error('Stripe no está configurado');
    }

    try {
      const paymentIntent = {
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency: currency.toLowerCase(),
        metadata: {
          items: JSON.stringify(items.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price
          }))),
          order_id: `order_${Date.now()}`
        },
        automatic_payment_methods: {
          enabled: true
        }
      };

      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(paymentIntent as any).toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error de Stripe: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        amount: data.amount / 100, // Convertir de centavos
        client_secret: data.client_secret,
        currency: data.currency,
        status: data.status
      };
    } catch (error) {
      console.error('Error creando Payment Intent de Stripe:', error);
      throw error;
    }
  }

  async processPayment(paymentData: any): Promise<any> {
    // Stripe procesa el pago a través del client_secret
    // Este método se usa para confirmar el pago
    if (!this.secretKey) {
      throw new Error('Stripe no está configurado');
    }

    try {
      const { payment_intent_id } = paymentData;
      
      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${payment_intent_id}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error verificando pago: ${response.statusText}`);
      }

      const paymentIntent = await response.json();
      
      return {
        transaction_id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        payment_method: paymentIntent.payment_method,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      console.error('Error procesando pago de Stripe:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<any> {
    if (!this.secretKey) {
      throw new Error('Stripe no está configurado');
    }

    try {
      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          payment_method: paymentMethodId
        }).toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error confirmando pago: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirmando pago de Stripe:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<any> {
    if (!this.secretKey) {
      throw new Error('Stripe no está configurado');
    }

    try {
      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
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

  getPublishableKey(): string {
    return this.publishableKey;
  }
}

