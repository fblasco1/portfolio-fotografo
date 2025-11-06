import { client } from './sanity';
import { productsQuery } from './queries';
import type { SanityProduct } from '@/app/types/store';
import type { ProductSize } from '@/contexts/CartContext';
import { getSizePricing, getPriceUSDForSize, isSizeAvailable as checkSizeAvailable, getAvailableSizes as getAvailableSizesFromPricing } from './sanity-pricing';

// Re-export SanityProduct from types/store to avoid duplication
export type { SanityProduct } from '@/app/types/store';

/**
 * Obtiene todos los productos disponibles desde Sanity
 */
export async function getProducts(): Promise<SanityProduct[]> {
  try {
    const products = await client.fetch(productsQuery);
    return products || [];
  } catch (error) {
    console.error('Error fetching products from Sanity:', error);
    return [];
  }
}

/**
 * Obtiene un producto específico por ID desde Sanity
 */
export async function getProductById(id: string): Promise<SanityProduct | null> {
  try {
    const query = `*[_type == "product" && _id == $id && isAvailable == true][0] {
      _id,
      _type,
      category,
      image {
        asset-> {
          _id,
          url,
          metadata {
            dimensions
          }
        }
      },
      order,
      isAvailable,
      content {
        es {
          title,
          subtitle
        },
        en {
          title,
          subtitle
        }
      }
    }`;
    
    const product = await client.fetch(query, { id });
    return product || null;
  } catch (error) {
    console.error('Error fetching product from Sanity:', error);
    return null;
  }
}

/**
 * Convierte un producto de Sanity al formato del carrito
 */
export function convertSanityProductToCartItem(
  product: SanityProduct,
  size: ProductSize,
  locale: 'es' | 'en' = 'es'
) {
  return {
    id: product._id,
    title: product.content[locale].title,
    subtitle: product.content[locale].subtitle,
    image: product.image?.asset?.url || '',
    productType: product.category === 'photo' ? 'photos' : 'postcards' as 'photos' | 'postcards',
    size
  };
}

/**
 * Obtiene el precio en USD de un producto para un tamaño específico
 * Los precios ahora vienen de una configuración global, no del producto
 */
export async function getProductPriceUSD(
  product: SanityProduct,
  size: ProductSize
): Promise<number> {
  if (size === 'custom') {
    return 0; // Los tamaños personalizados no tienen precio fijo
  }

  const pricing = await getSizePricing();
  return getPriceUSDForSize(pricing, size);
}

/**
 * Versión síncrona que requiere el pricing ya cargado
 */
export function getProductPriceUSDSync(
  pricing: Awaited<ReturnType<typeof getSizePricing>>,
  size: ProductSize
): number {
  return getPriceUSDForSize(pricing, size);
}

/**
 * Obtiene el precio convertido de un producto para un tamaño y moneda específicos
 */
export async function getProductPriceForSize(
  product: SanityProduct,
  size: ProductSize,
  currency: string,
  countryCode?: string
): Promise<number> {
  const priceUSD = await getProductPriceUSD(product, size);
  
  if (priceUSD === 0) {
    return 0;
  }

  // Convertir USD a moneda local
  const { convertUSDToLocal } = await import('./currency-converter');
  return convertUSDToLocal(priceUSD, currency, countryCode);
}

/**
 * Verifica si un tamaño específico está disponible
 * Los tamaños ahora son globales, no específicos del producto
 */
export async function isSizeAvailable(
  product: SanityProduct,
  size: ProductSize
): Promise<boolean> {
  const pricing = await getSizePricing();
  return checkSizeAvailable(pricing, size);
}

/**
 * Obtiene todos los tamaños disponibles
 * Los tamaños ahora son globales, no específicos del producto
 * Esta función ahora es async pero usa cache, así que debería ser rápida
 */
export async function getAvailableSizes(product: SanityProduct): Promise<ProductSize[]> {
  const pricing = await getSizePricing();
  return getAvailableSizesFromPricing(pricing);
}

/**
 * Verifica si un producto es de testing (título contiene "test")
 */
export function isTestProduct(product: SanityProduct): boolean {
  // Verificar si el título indica que es de testing
  const isTestTitle = 
    product.content?.es?.title?.toLowerCase().includes('test') ||
    product.content?.es?.title?.toLowerCase().includes('prueba') ||
    product.content?.en?.title?.toLowerCase().includes('test');

  return isTestTitle;
}

// Mantener función de compatibilidad temporal
export async function isProductAvailableInRegion(
  product: SanityProduct,
  currency: string
): Promise<boolean> {
  // Verificar si el producto tiene al menos un tamaño disponible
  const availableSizes = await getAvailableSizes(product);
  return availableSizes.length > 1; // Más de 1 porque siempre incluye 'custom'
}

// Mantener función de compatibilidad temporal
export async function getProductPriceForRegion(
  product: SanityProduct,
  currency: string
): Promise<number> {
  // Retornar el precio del primer tamaño disponible o 0
  const availableSizes = await getAvailableSizes(product);
  const firstStandardSize = availableSizes.find(size => size !== 'custom') as ProductSize | undefined;
  
  if (!firstStandardSize) {
    return 0;
  }

  return getProductPriceUSD(product, firstStandardSize);
}
