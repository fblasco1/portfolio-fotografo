import { client } from './sanity';
import type { ProductSize } from '@/contexts/CartContext';

export interface SizePricingOption {
  priceUSD: number;
  enabled: boolean;
}

export interface PhotoSizePricing {
  size15x21?: SizePricingOption;
  size20x30?: SizePricingOption;
  size30x45?: SizePricingOption;
}

export interface PostcardSizePricing {
  size15x21?: SizePricingOption;
}

export interface SizePricing {
  photo?: PhotoSizePricing;
  postcard?: PostcardSizePricing;
}

export type ProductCategoryOption = 'photo' | 'postcard';

const SIZE_FIELD_MAP: Record<ProductCategoryOption, Partial<Record<ProductSize, string>>> = {
  photo: {
    '15x21': 'size15x21',
    '20x30': 'size20x30',
    '30x45': 'size30x45'
  },
  postcard: {
    '15x21': 'size15x21'
  }
};

type PricingGroup = PhotoSizePricing | PostcardSizePricing;

const getPricingGroup = (
  pricing: SizePricing | null,
  productType: ProductCategoryOption
): PricingGroup | null => {
  if (!pricing) return null;
  return productType === 'postcard' ? pricing.postcard || null : pricing.photo || null;
};

// Cache para precios (evita múltiples llamadas)
let pricingCache: { data: SizePricing | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene la configuración de precios por tamaño desde Sanity
 * Usa cache para mejorar el rendimiento
 */
export async function getSizePricing(forceRefresh: boolean = false): Promise<SizePricing | null> {
  if (!forceRefresh && pricingCache) {
    const now = Date.now();
    if (now - pricingCache.timestamp < CACHE_DURATION) {
      return pricingCache.data;
    }
  }

  try {
    // Verificar que el cliente de Sanity esté configurado
    if (!client) {
      console.warn('Sanity client not configured');
      return pricingCache?.data || null;
    }

    const query = `*[_type == "sizePricing"][0] {
      "photo": photoPricing {
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
      },
      "postcard": postcardPricing {
        size15x21 {
          priceUSD,
          enabled
        }
      }
    }`;

    const pricing = await client.fetch(query);
    const result = pricing || null;

    pricingCache = {
      data: result,
      timestamp: Date.now()
    };

    return result;
  } catch (error: any) {
    // Mejorar el manejo de errores para evitar que se propague
    const errorMessage = error?.message || String(error);
    console.error('Error fetching size pricing from Sanity:', errorMessage);
    
    // Si hay cache, usar ese valor en lugar de fallar completamente
    if (pricingCache?.data) {
      console.warn('Using cached pricing data due to fetch error');
      return pricingCache.data;
    }
    
    // Si no hay cache y hay error, retornar null silenciosamente
    // El componente debe manejar el caso cuando pricing es null
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
export function getPriceUSDForSize(
  pricing: SizePricing | null,
  size: ProductSize,
  options?: { productType?: ProductCategoryOption }
): number {
  if (size === 'custom') {
    return 0;
  }

  const productType = options?.productType ?? 'photo';
  const group = getPricingGroup(pricing, productType);
  if (!group) {
    return 0;
  }

  const fieldName = SIZE_FIELD_MAP[productType]?.[size];
  if (!fieldName) {
    return 0;
  }

  const sizePricing = group[fieldName as keyof PricingGroup] as SizePricingOption | undefined;
  if (!sizePricing || !sizePricing.enabled || !sizePricing.priceUSD || sizePricing.priceUSD <= 0) {
    return 0;
  }

  return sizePricing.priceUSD;
}

/**
 * Verifica si un tamaño está disponible
 */
export function isSizeAvailable(
  pricing: SizePricing | null,
  size: ProductSize,
  options?: { productType?: ProductCategoryOption }
): boolean {
  if (size === 'custom') {
    return options?.productType === 'postcard' ? false : true;
  }

  const productType = options?.productType ?? 'photo';
  const group = getPricingGroup(pricing, productType);
  if (!group) {
    return false;
  }

  const fieldName = SIZE_FIELD_MAP[productType]?.[size];
  if (!fieldName) {
    return false;
  }

  const sizePricing = group[fieldName as keyof PricingGroup] as SizePricingOption | undefined;
  if (!sizePricing) {
    return false;
  }

  return Boolean(sizePricing.enabled && sizePricing.priceUSD && sizePricing.priceUSD > 0);
}

/**
 * Obtiene todos los tamaños disponibles
 * Esta función es síncrona y rápida, no hace llamadas a la API
 */
export function getAvailableSizes(
  pricing: SizePricing | null,
  options?: {
    productType?: ProductCategoryOption;
    includeCustomForPostcard?: boolean;
  }
): ProductSize[] {
  const productType = options?.productType ?? 'photo';
  const sizes: ProductSize[] = [];

  const group = getPricingGroup(pricing, productType);
  if (!group) {
    return productType === 'photo' ? ['custom'] : [];
  }

  const standardSizes: ProductSize[] =
    productType === 'postcard'
      ? ['15x21']
      : ['15x21', '20x30', '30x45'];

  for (const size of standardSizes) {
    if (isSizeAvailable(pricing, size, { productType })) {
      sizes.push(size);
    }
  }

  const shouldIncludeCustom =
    productType === 'photo' || options?.includeCustomForPostcard;

  if (shouldIncludeCustom) {
    sizes.push('custom');
  }

  return sizes;
}

