import type { RegionInfo } from './region-detector';
import type { PaymentRequest, PaymentResponse } from '@/app/types/payment';

// Re-exportar RegionInfo para que esté disponible
export type { RegionInfo };

export interface PaymentProvider {
  name: string;
  // Nuevo método para Checkout API
  createPayment?(paymentData: PaymentRequest): Promise<PaymentResponse>;
  // Método legacy (Checkout Pro) - ahora opcional
  createPaymentIntent?(amount: number, currency: string, items: any[], customerInfo?: any): Promise<any>;
  processPayment(paymentData: any): Promise<any>;
  getPaymentMethods(): string[];
  isAvailable(region: RegionInfo): boolean;
  // Métodos adicionales para Checkout API
  getInstallments?(amount: number, bin: string, locale?: string): Promise<any[]>;
  getAvailablePaymentMethods?(): Promise<any[]>;
  getIssuers?(paymentMethodId: string, bin: string): Promise<any[]>;
  getPaymentStatus?(paymentId: string): Promise<PaymentResponse>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
  paymentUrl?: string;
  provider: string;
  external_reference?: string;
  metadata?: any;
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

  /**
   * Crear un pago usando Checkout API (recomendado)
   */
  static async createPayment(
    region: RegionInfo,
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    const provider = this.getProvider(region);
    
    if (!provider) {
      throw new Error(`No se encontró un proveedor de pago disponible para ${region.country}`);
    }

    if (!provider.createPayment) {
      throw new Error(`El proveedor ${provider.name} no soporta createPayment`);
    }

    try {
      console.log(`💳 Creando pago con ${provider.name}:`, {
        amount: paymentData.transaction_amount,
        installments: paymentData.installments,
        payment_method: paymentData.payment_method_id,
      });

      const result = await provider.createPayment(paymentData);
      
      console.log(`✅ Pago creado con ${provider.name}:`, {
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
      });

      return result;
    } catch (error) {
      console.error(`❌ Error creando pago con ${provider.name}:`, error);
      throw error;
    }
  }

  /**
   * Crear un intent de pago usando Checkout Pro (legacy)
   * @deprecated Usar createPayment en su lugar
   */
  static async createPaymentIntent(
    region: RegionInfo, 
    amount: number, 
    items: any[],
    customerInfo?: any
  ): Promise<PaymentIntent | null> {
    const provider = this.getProvider(region);
    
    if (!provider) {
      throw new Error(`No se encontró un proveedor de pago disponible para ${region.country}`);
    }

    if (!provider.createPaymentIntent) {
      throw new Error(`El proveedor ${provider.name} no soporta createPaymentIntent`);
    }

    try {
      const result = await provider.createPaymentIntent(amount, region.currency, items, customerInfo);
      
      return {
        id: result.id,
        amount: result.amount,
        currency: region.currency,
        status: 'pending',
        clientSecret: result.client_secret,
        paymentUrl: result.init_point,
        provider: provider.name,
        external_reference: result.external_reference,
        metadata: result.metadata
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

