// Lista de países de Latinoamérica
const LATIN_AMERICA_COUNTRIES = [
  'AR', // Argentina
  'BO', // Bolivia
  'BR', // Brasil
  'CL', // Chile
  'CO', // Colombia
  'CR', // Costa Rica
  'CU', // Cuba
  'DO', // República Dominicana
  'EC', // Ecuador
  'SV', // El Salvador
  'GT', // Guatemala
  'HN', // Honduras
  'MX', // México
  'NI', // Nicaragua
  'PA', // Panamá
  'PY', // Paraguay
  'PE', // Perú
  'UY', // Uruguay
  'VE', // Venezuela
];

// Configuración de monedas por país
const CURRENCY_CONFIG = {
  AR: { currency: 'ARS', symbol: '$', name: 'Peso Argentino' },
  BR: { currency: 'BRL', symbol: 'R$', name: 'Real Brasileño' },
  CL: { currency: 'CLP', symbol: '$', name: 'Peso Chileno' },
  CO: { currency: 'COP', symbol: '$', name: 'Peso Colombiano' },
  MX: { currency: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  PE: { currency: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
  UY: { currency: 'UYU', symbol: '$', name: 'Peso Uruguayo' },
  // Por defecto USD para otros países
  DEFAULT: { currency: 'USD', symbol: '$', name: 'Dólar Estadounidense' }
};

export interface RegionInfo {
  country: string;
  currency: string;
  symbol: string;
  currencyName: string;
  isLatinAmerica: boolean;
  paymentProvider: 'mercadopago' | 'stripe';
}

/**
 * Detecta la región del usuario basándose en el país
 */
export function detectRegion(countryCode: string): RegionInfo {
  const upperCountry = countryCode.toUpperCase();
  const isLatinAmerica = LATIN_AMERICA_COUNTRIES.includes(upperCountry);
  
  const currencyInfo = CURRENCY_CONFIG[upperCountry as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.DEFAULT;
  
  return {
    country: upperCountry,
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    currencyName: currencyInfo.name,
    isLatinAmerica,
    paymentProvider: isLatinAmerica ? 'mercadopago' : 'stripe'
  };
}

/**
 * Detecta la región del usuario usando la API de geolocalización
 */
export async function detectRegionByIP(): Promise<RegionInfo> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return detectRegion(data.country_code);
  } catch (error) {
    console.error('Error detectando región por IP:', error);
    // Fallback a USD
    return detectRegion('US');
  }
}

/**
 * Detecta la región del usuario usando el navegador
 */
export function detectRegionByBrowser(): RegionInfo {
  const language = navigator.language || navigator.languages?.[0] || 'en-US';
  const countryCode = language.split('-')[1] || 'US';
  
  return detectRegion(countryCode);
}

/**
 * Formatea un precio según la moneda
 */
export function formatPrice(amount: number, currency: string, symbol: string): string {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Convierte un precio de USD a la moneda local
 */
export function convertCurrency(amountUSD: number, targetCurrency: string): number {
  // En un entorno real, usarías una API de conversión de monedas
  // Por ahora, usamos tasas fijas para demostración
  
  const exchangeRates: Record<string, number> = {
    ARS: 1000, // 1 USD = 1000 ARS (aproximado)
    BRL: 5,    // 1 USD = 5 BRL (aproximado)
    CLP: 950,  // 1 USD = 950 CLP (aproximado)
    COP: 4000, // 1 USD = 4000 COP (aproximado)
    MXN: 18,   // 1 USD = 18 MXN (aproximado)
    PEN: 3.7,  // 1 USD = 3.7 PEN (aproximado)
    UYU: 40,   // 1 USD = 40 UYU (aproximado)
    USD: 1,    // 1 USD = 1 USD
  };
  
  const rate = exchangeRates[targetCurrency] || 1;
  return Math.round(amountUSD * rate * 100) / 100; // Redondear a 2 decimales
}

