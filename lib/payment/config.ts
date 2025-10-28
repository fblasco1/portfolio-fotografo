import { PaymentFactory } from './payment-factory';
import { MercadoPagoProvider } from './mercadopago.service';

// Flag para asegurar que solo se inicialice una vez
let isInitialized = false;

// Registrar proveedores de pago (singleton)
export function initializePaymentProviders() {
  // Si ya fue inicializado, no hacer nada
  if (isInitialized) {
    return;
  }
  
  // Registrar solo Mercado Pago para Latinoamérica
  const mercadopagoProvider = new MercadoPagoProvider();
  PaymentFactory.registerProvider('mercadopago', mercadopagoProvider);
  
  // Marcar como inicializado
  isInitialized = true;
  
  // Log solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🎉 Proveedores de pago inicializados');
  }
}

// Configuración de precios por región (solo Latinoamérica)
// Estos precios se obtienen ahora desde Sanity, pero mantenemos valores por defecto
export const DEFAULT_PRICE_CONFIG = {
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
 * @param productType Tipo de producto ('photos' | 'postcards')
 * @param currency Moneda del producto
 * @param productPricing Información de precios por región desde Sanity (opcional)
 */
export function getProductPrice(
  productType: 'photos' | 'postcards', 
  currency: string, 
  productPricing?: any
): number {
  // Verificaciones de seguridad
  if (!productType || !currency) {
    console.warn('getProductPrice: productType o currency no están definidos', { productType, currency });
    return 0;
  }
  
  // Si tenemos precios por región desde Sanity, los usamos
  if (productPricing) {
    const regionMap: Record<string, string> = {
      'ARS': 'argentina',
      'BRL': 'brazil', 
      'CLP': 'chile',
      'COP': 'colombia',
      'MXN': 'mexico',
      'PEN': 'peru',
      'UYU': 'uruguay'
    };

    const region = regionMap[currency];
    if (region && productPricing[region]) {
      const regionPricing = productPricing[region];
      if (regionPricing.enabled && regionPricing.price > 0) {
        return regionPricing.price;
      }
    }
  }
  
  // Fallback a precios por defecto
  const prices = DEFAULT_PRICE_CONFIG[productType];
  if (!prices) {
    console.warn('getProductPrice: productType no encontrado en DEFAULT_PRICE_CONFIG', { productType });
    return 0;
  }
  
  const price = prices[currency as keyof typeof prices];
  if (price === undefined) {
    console.warn('getProductPrice: currency no encontrada en precios', { productType, currency });
    return 0;
  }
  
  return price;
}

/**
 * Convierte un precio base (en USD) a la moneda local
 * @param basePrice Precio base en USD
 * @param targetCurrency Moneda objetivo
 */
function convertPriceToCurrency(basePrice: number, targetCurrency: string): number {
  // Tasa de conversión aproximada desde USD a monedas locales
  const exchangeRates: Record<string, number> = {
    ARS: 1000,   // 1 USD = 1000 ARS
    BRL: 5,      // 1 USD = 5 BRL
    CLP: 950,    // 1 USD = 950 CLP
    COP: 4000,   // 1 USD = 4000 COP
    MXN: 18,     // 1 USD = 18 MXN
    PEN: 3.7,    // 1 USD = 3.7 PEN
    UYU: 40      // 1 USD = 40 UYU
  };
  
  const rate = exchangeRates[targetCurrency] || 1;
  return Math.round(basePrice * rate);
}

/**
 * Verifica si una moneda está soportada
 */
export function isCurrencySupported(currency: string): boolean {
  return Object.keys(TAX_CONFIG).includes(currency);
}

