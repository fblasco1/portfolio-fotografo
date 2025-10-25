import { client } from './sanity';
import { productsQuery } from './queries';
import type { SanityProduct } from '@/app/types/store';

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
      image,
      order,
      isAvailable,
      pricing {
        argentina {
          price,
          enabled
        },
        brazil {
          price,
          enabled
        },
        chile {
          price,
          enabled
        },
        colombia {
          price,
          enabled
        },
        mexico {
          price,
          enabled
        },
        peru {
          price,
          enabled
        },
        uruguay {
          price,
          enabled
        }
      },
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
  locale: 'es' | 'en' = 'es'
) {
  return {
    id: product._id,
    title: product.content[locale].title,
    subtitle: product.content[locale].subtitle,
    image: product.image?.asset?.url || '',
    productType: product.category === 'photo' ? 'photos' : 'postcards' as 'photos' | 'postcards',
    pricing: product.pricing || {} // Incluir toda la información de precios o objeto vacío
  };
}

/**
 * Obtiene el precio de un producto para una región específica
 */
export function getProductPriceForRegion(
  product: SanityProduct, 
  currency: string
): number {
  // Validar que el producto tenga pricing
  if (!product || !product.pricing) {
    console.warn(`Product ${product?._id || 'unknown'} has no pricing information`);
    return 0;
  }

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
  if (!region) {
    console.warn(`Unsupported currency: ${currency}`);
    return 0;
  }

  const regionPricing = product.pricing[region as keyof typeof product.pricing];
  if (!regionPricing) {
    console.warn(`No pricing found for currency ${currency} in product ${product._id}`);
    return 0;
  }

  if (!regionPricing.enabled || !regionPricing.price) {
    console.warn(`Pricing not enabled or price not set for ${currency} in product ${product._id}`);
    return 0;
  }

  return regionPricing.price;
}

/**
 * Verifica si un producto está disponible en una región específica
 */
export function isProductAvailableInRegion(
  product: SanityProduct, 
  currency: string
): boolean {
  // Validar que el producto tenga pricing
  if (!product || !product.pricing) {
    return false;
  }

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
  if (!region) {
    return false;
  }

  const regionPricing = product.pricing[region as keyof typeof product.pricing];
  if (!regionPricing) {
    return false;
  }

  const isAvailable = Boolean(regionPricing.enabled && regionPricing.price >= 0);
  return isAvailable;
}

/**
 * Verifica si un producto es de testing (precio 0)
 */
export function isTestProduct(product: SanityProduct): boolean {
  if (!product || !product.pricing) {
    return false;
  }

  // Verificar si algún precio es 0
  const hasZeroPrice = Object.values(product.pricing).some(pricing => 
    pricing && pricing.enabled && pricing.price === 0
  );

  // Verificar si el título indica que es de testing
  const isTestTitle = 
    product.content?.es?.title?.toLowerCase().includes('test') ||
    product.content?.es?.title?.toLowerCase().includes('prueba') ||
    product.content?.en?.title?.toLowerCase().includes('test');

  return hasZeroPrice || isTestTitle;
}
