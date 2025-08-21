import { PaymentFactory } from './payment-factory';
import { MercadoPagoProvider } from './mercadopago.service';

// Registrar proveedores de pago
export function initializePaymentProviders() {
  console.log('🔧 Inicializando proveedores de pago...');
  
  // Registrar solo Mercado Pago para Latinoamérica
  const mercadopagoProvider = new MercadoPagoProvider();
  PaymentFactory.registerProvider('mercadopago', mercadopagoProvider);
  console.log('✅ Mercado Pago registrado');
  
  console.log('🎉 Proveedores de pago inicializados correctamente');
}

// Configuración de precios por región (solo Latinoamérica)
export const PRICE_CONFIG = {
  photos: {
    ARS: 50000, // Convertido a pesos argentinos
    BRL: 250,   // Convertido a reales brasileños
    CLP: 47500, // Convertido a pesos chilenos
    COP: 200000, // Convertido a pesos colombianos
    MXN: 900,   // Convertido a pesos mexicanos
    PEN: 185,   // Convertido a soles peruanos
    UYU: 2000   // Convertido a pesos uruguayos
  },
  postcards: {
    ARS: 15000,
    BRL: 75,
    CLP: 14250,
    COP: 60000,
    MXN: 270,
    PEN: 55.5,
    UYU: 600
  }
};

// Configuración de envío por región (solo Latinoamérica)
export const SHIPPING_CONFIG = {
  ARS: { cost: 10000, name: 'Envío Nacional' },
  BRL: { cost: 50, name: 'Envio Nacional' },
  CLP: { cost: 9500, name: 'Envío Nacional' },
  COP: { cost: 40000, name: 'Envío Nacional' },
  MXN: { cost: 180, name: 'Envío Nacional' },
  PEN: { cost: 37, name: 'Envío Nacional' },
  UYU: { cost: 400, name: 'Envío Nacional' }
};

// Configuración de impuestos por región (solo Latinoamérica)
export const TAX_CONFIG = {
  ARS: 0.21, // 21% IVA en Argentina
  BRL: 0.17, // 17% ICMS en Brasil
  CLP: 0.19, // 19% IVA en Chile
  COP: 0.19, // 19% IVA en Colombia
  MXN: 0.16, // 16% IVA en México
  PEN: 0.18, // 18% IGV en Perú
  UYU: 0.22  // 22% IVA en Uruguay
};

/**
 * Calcula el precio total incluyendo impuestos y envío
 */
export function calculateTotalPrice(
  subtotal: number,
  currency: string,
  includeShipping: boolean = true
): {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
} {
  const taxRate = TAX_CONFIG[currency as keyof typeof TAX_CONFIG] || 0;
  const shippingCost = includeShipping ? (SHIPPING_CONFIG[currency as keyof typeof SHIPPING_CONFIG]?.cost || 0) : 0;
  
  const tax = subtotal * taxRate;
  const total = subtotal + tax + shippingCost;
  
  return {
    subtotal,
    tax,
    shipping: shippingCost,
    total
  };
}

/**
 * Obtiene el precio de un producto en la moneda especificada
 */
export function getProductPrice(productType: 'photos' | 'postcards', currency: string): number {
  const prices = PRICE_CONFIG[productType];
  return prices[currency as keyof typeof prices] || 0;
}

/**
 * Verifica si una moneda está soportada
 */
export function isCurrencySupported(currency: string): boolean {
  return Object.keys(TAX_CONFIG).includes(currency);
}

