/**
 * Servicio para obtener cotizaciones del dólar usando DolarApi.com
 */

const DOLLAR_API_BASE = 'https://dolarapi.com/v1';

// Cache de cotizaciones (válido por 1 hora)
interface CacheEntry {
  rate: number;
  timestamp: number;
}

const rateCache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

// Tasas de cambio fallback (último recurso si la API falla)
const FALLBACK_RATES: Record<string, number> = {
  ARS: 1000,  // 1 USD = 1000 ARS
  BRL: 5,     // 1 USD = 5 BRL
  CLP: 950,   // 1 USD = 950 CLP
  COP: 4000,  // 1 USD = 4000 COP
  MXN: 18,    // 1 USD = 18 MXN
  PEN: 3.7,   // 1 USD = 3.7 PEN
  UYU: 40,    // 1 USD = 40 UYU
  USD: 1,
};

/**
 * Mapea códigos de país a endpoints de DolarApi
 */
function getEndpointForCountry(countryCode: string): string | null {
  const endpoints: Record<string, string> = {
    AR: `${DOLLAR_API_BASE}/dolares/oficial`,      // Argentina - dólar oficial
    CL: `${DOLLAR_API_BASE}/dolares`,              // Chile
    UY: `${DOLLAR_API_BASE}/dolares/oficial`,      // Uruguay
    MX: `${DOLLAR_API_BASE}/dolares`,              // México
    CO: `${DOLLAR_API_BASE}/dolares`,              // Colombia
    PE: `${DOLLAR_API_BASE}/dolares`,              // Perú
    BR: `${DOLLAR_API_BASE}/dolares`,              // Brasil
  };

  return endpoints[countryCode.toUpperCase()] || null;
}

/**
 * Extrae la tasa de cambio del dólar desde la respuesta de la API
 */
function extractRateFromResponse(data: any, countryCode: string): number | null {
  try {
    const upperCode = countryCode.toUpperCase();

    switch (upperCode) {
      case 'AR':
        // Argentina: usar el campo "venta" del dólar oficial
        if (data.venta && typeof data.venta === 'number') {
          return data.venta;
        }
        // Si es un array, buscar el oficial
        if (Array.isArray(data)) {
          const oficial = data.find((d: any) => d.casa === 'oficial');
          if (oficial && oficial.venta) {
            return parseFloat(oficial.venta.toString().replace(',', '.'));
          }
        }
        break;

      case 'CL':
        // Chile: usar el campo de venta o compra
        if (data.venta && typeof data.venta === 'number') {
          return data.venta;
        }
        if (data.compra && typeof data.compra === 'number') {
          return data.compra;
        }
        // Si es un objeto con valores directos
        if (data.valor && typeof data.valor === 'number') {
          return data.valor;
        }
        break;

      case 'UY':
        // Uruguay: similar a Argentina
        if (data.venta && typeof data.venta === 'number') {
          return data.venta;
        }
        break;

      case 'MX':
      case 'CO':
      case 'PE':
      case 'BR':
        // Para otros países, intentar campos comunes
        if (data.venta && typeof data.venta === 'number') {
          return data.venta;
        }
        if (data.compra && typeof data.compra === 'number') {
          return data.compra;
        }
        if (data.valor && typeof data.valor === 'number') {
          return data.valor;
        }
        break;
    }

    return null;
  } catch (error) {
    console.error('Error extrayendo tasa de la respuesta:', error);
    return null;
  }
}

/**
 * Obtiene la cotización del dólar para un país específico
 * @param countryCode Código de país (AR, CL, UY, etc.)
 * @returns Tasa de cambio del dólar (1 USD = X moneda local)
 */
export async function getDollarRate(countryCode: string): Promise<number> {
  const upperCode = countryCode.toUpperCase();
  const cacheKey = upperCode;

  // Verificar cache
  const cached = rateCache.get(cacheKey);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_DURATION) {
      console.log(`💵 Usando tasa en cache para ${upperCode}: ${cached.rate}`);
      return cached.rate;
    }
  }

  // Si es USD, retornar 1 directamente
  if (upperCode === 'US' || upperCode === 'USD') {
    return 1;
  }

  // Obtener endpoint
  const endpoint = getEndpointForCountry(upperCode);
  
  if (!endpoint) {
    console.warn(`⚠️ No hay endpoint para ${upperCode}, usando tasa fallback`);
    return FALLBACK_RATES[CURRENCY_MAP[upperCode] || 'USD'] || 1;
  }

  try {
    console.log(`🌐 Obteniendo cotización de ${upperCode} desde ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
      },
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const rate = extractRateFromResponse(data, upperCode);

    if (rate && rate > 0) {
      // Guardar en cache
      rateCache.set(cacheKey, {
        rate,
        timestamp: Date.now(),
      });
      
      console.log(`✅ Tasa obtenida para ${upperCode}: ${rate}`);
      return rate;
    } else {
      throw new Error('No se pudo extraer la tasa de la respuesta');
    }
  } catch (error) {
    console.error(`❌ Error obteniendo cotización para ${upperCode}:`, error);
    
    // Usar tasa fallback
    const currency = CURRENCY_MAP[upperCode] || 'USD';
    const fallbackRate = FALLBACK_RATES[currency] || 1;
    
    console.warn(`⚠️ Usando tasa fallback para ${upperCode}: ${fallbackRate}`);
    return fallbackRate;
  }
}

/**
 * Mapa de códigos de país a códigos de moneda
 */
const CURRENCY_MAP: Record<string, string> = {
  AR: 'ARS',
  BR: 'BRL',
  CL: 'CLP',
  CO: 'COP',
  MX: 'MXN',
  PE: 'PEN',
  UY: 'UYU',
  US: 'USD',
};

/**
 * Limpia el cache de cotizaciones
 */
export function clearDollarRateCache(): void {
  rateCache.clear();
}

/**
 * Obtiene la tasa de cambio directamente por código de moneda
 */
export async function getDollarRateByCurrency(currency: string, countryCode?: string): Promise<number> {
  // Si ya tenemos el código de país, usarlo directamente
  if (countryCode) {
    return getDollarRate(countryCode);
  }

  // Si no, intentar mapear desde la moneda
  const countryFromCurrency: Record<string, string> = {
    ARS: 'AR',
    BRL: 'BR',
    CLP: 'CL',
    COP: 'CO',
    MXN: 'MX',
    PEN: 'PE',
    UYU: 'UY',
    USD: 'US',
  };

  const country = countryFromCurrency[currency.toUpperCase()];
  if (country) {
    return getDollarRate(country);
  }

  // Si no hay mapeo, usar fallback
  return FALLBACK_RATES[currency.toUpperCase()] || 1;
}
