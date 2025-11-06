import { client } from './sanity';
import type { ProductSize } from '@/contexts/CartContext';

export interface SizePricing {
  size15x21?: {
    priceUSD: number;
    enabled: boolean;
  };
  size20x30?: {
    priceUSD: number;
    enabled: boolean;
  };
  size30x45?: {
    priceUSD: number;
    enabled: boolean;
  };
}

// Mapeo de tamaños (código del sistema) a nombres de campo en Sanity
const SIZE_FIELD_MAP: Record<ProductSize, string> = {
  '15x21': 'size15x21',
  '20x30': 'size20x30',
  '30x45': 'size30x45',
  'custom': 'custom'
};

// Cache para precios (evita múltiples llamadas)
let pricingCache: { data: SizePricing | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene la configuración de precios por tamaño desde Sanity
 * Usa cache para mejorar el rendimiento
 */
export async function getSizePricing(forceRefresh: boolean = false): Promise<SizePricing | null> {
  // Verificar cache primero (si no se fuerza refresh)
  if (!forceRefresh && pricingCache) {
    const now = Date.now();
    if (now - pricingCache.timestamp < CACHE_DURATION) {
      return pricingCache.data;
    }
  }

  try {
    const query = `*[_type == "sizePricing"][0] {
      size15x21 {
        priceUSD,
        enabled
      },
      size20x30 {
        priceUSD,
        enabled
      },
      size30x45 {
        priceUSD,
        enabled
      }
    }`;
    
    const pricing = await client.fetch(query);
    
    const result = pricing || null;
    
    // Actualizar cache
    pricingCache = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching size pricing from Sanity:', error);
    // Si hay error pero tenemos cache, devolver cache
    if (pricingCache) {
      return pricingCache.data;
    }
    return null;
  }
}

/**
 * Limpia el cache de precios (útil para forzar refresh después de actualizar en Sanity)
 */
export function clearPricingCache(): void {
  pricingCache = null;
}

/**
 * Obtiene el precio en USD para un tamaño específico
 */
export function getPriceUSDForSize(pricing: SizePricing | null, size: ProductSize): number {
  if (size === 'custom' || !pricing) {
    return 0;
  }

  const fieldName = SIZE_FIELD_MAP[size];
  const sizePricing = pricing[fieldName as keyof SizePricing];
  
  if (!sizePricing || !sizePricing.enabled || !sizePricing.priceUSD || sizePricing.priceUSD <= 0) {
    return 0;
  }

  return sizePricing.priceUSD;
}

/**
 * Verifica si un tamaño está disponible
 */
export function isSizeAvailable(pricing: SizePricing | null, size: ProductSize): boolean {
  if (size === 'custom') {
    return true; // Los tamaños personalizados siempre están disponibles
  }

  if (!pricing) {
    return false;
  }

  const fieldName = SIZE_FIELD_MAP[size];
  const sizePricing = pricing[fieldName as keyof SizePricing];
  
  if (!sizePricing) {
    return false;
  }

  return Boolean(sizePricing.enabled && sizePricing.priceUSD && sizePricing.priceUSD > 0);
}

/**
 * Obtiene todos los tamaños disponibles
 * Esta función es síncrona y rápida, no hace llamadas a la API
 */
export function getAvailableSizes(pricing: SizePricing | null): ProductSize[] {
  const sizes: ProductSize[] = [];
  
  if (!pricing) {
    // Si no hay precios, devolver solo custom para que el usuario pueda contactar
    return ['custom'];
  }

  const standardSizes: ProductSize[] = ['15x21', '20x30', '30x45'];
  
  for (const size of standardSizes) {
    if (isSizeAvailable(pricing, size)) {
      sizes.push(size);
    }
  }

  // Siempre agregar opción de tamaño personalizado
  sizes.push('custom');

  return sizes;
}

