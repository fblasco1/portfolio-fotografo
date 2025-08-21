import type { RegionInfo } from './region-detector';

export interface PaymentProvider {
  name: string;
  createPaymentIntent(amount: number, currency: string, items: any[]): Promise<any>;
  processPayment(paymentData: any): Promise<any>;
  getPaymentMethods(): string[];
  isAvailable(region: RegionInfo): boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
  paymentUrl?: string;
  provider: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  status: string;
  provider: string;
}

// Factory para crear el proveedor de pago apropiado
export class PaymentFactory {
  private static providers: Map<string, PaymentProvider> = new Map();

  static registerProvider(name: string, provider: PaymentProvider) {
    this.providers.set(name, provider);
  }

  static getProvider(region: RegionInfo): PaymentProvider | null {
    // Solo soportamos Mercado Pago para Latinoamérica
    if (!region.isSupported) {
      console.error(`❌ Región no soportada: ${region.country}`);
      return null;
    }

    const provider = this.providers.get('mercadopago');
    
    if (!provider) {
      console.error('❌ Proveedor de pago Mercado Pago no encontrado');
      return null;
    }

    if (!provider.isAvailable(region)) {
      console.error(`❌ Mercado Pago no disponible para la región: ${region.country}`);
      return null;
    }

    return provider;
  }

  static getAvailableProviders(region: RegionInfo): PaymentProvider[] {
    if (!region.isSupported) {
      return [];
    }
    
    return Array.from(this.providers.values()).filter(provider => 
      provider.isAvailable(region)
    );
  }

  static async createPaymentIntent(
    region: RegionInfo, 
    amount: number, 
    items: any[]
  ): Promise<PaymentIntent | null> {
    const provider = this.getProvider(region);
    
    if (!provider) {
      throw new Error(`No se encontró un proveedor de pago disponible para ${region.country}`);
    }

    try {
      const result = await provider.createPaymentIntent(amount, region.currency, items);
      
      return {
        id: result.id,
        amount: result.amount,
        currency: region.currency,
        status: 'pending',
        clientSecret: result.client_secret,
        paymentUrl: result.init_point,
        provider: provider.name
      };
    } catch (error) {
      console.error(`Error creando intent de pago con ${provider.name}:`, error);
      throw error;
    }
  }

  static async processPayment(
    region: RegionInfo,
    paymentData: any
  ): Promise<PaymentResult> {
    const provider = this.getProvider(region);
    
    if (!provider) {
      return {
        success: false,
        error: `No se encontró un proveedor de pago disponible para ${region.country}`,
        status: 'failed',
        provider: 'unknown'
      };
    }

    try {
      const result = await provider.processPayment(paymentData);
      
      return {
        success: true,
        transactionId: result.transaction_id,
        status: result.status,
        provider: provider.name
      };
    } catch (error: any) {
      console.error(`Error procesando pago con ${provider.name}:`, error);
      
      return {
        success: false,
        error: error.message || 'Error desconocido',
        status: 'failed',
        provider: provider.name
      };
    }
  }
}

