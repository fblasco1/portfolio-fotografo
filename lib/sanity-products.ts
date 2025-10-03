import { client } from './sanity';
import { productsQuery } from './queries';

export interface SanityProduct {
  _id: string;
  _type: string;
  category: 'photo' | 'postcard';
  image: any;
  order: number;
  isAvailable: boolean;
  description?: {
    es?: string;
    en?: string;
  };
  pricing: {
    argentina?: {
      price: number;
      enabled: boolean;
    };
    brazil?: {
      price: number;
      enabled: boolean;
    };
    chile?: {
      price: number;
      enabled: boolean;
    };
    colombia?: {
      price: number;
      enabled: boolean;
    };
    mexico?: {
      price: number;
      enabled: boolean;
    };
    peru?: {
      price: number;
      enabled: boolean;
    };
    uruguay?: {
      price: number;
      enabled: boolean;
    };
  };
  content: {
    es: {
      title: string;
      subtitle: string;
    };
    en: {
      title: string;
      subtitle: string;
    };
  };
  tags?: string[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    featured?: boolean;
  };
}

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
    pricing: product.pricing // Incluir toda la información de precios
  };
}

/**
 * Obtiene el precio de un producto para una región específica
 */
export function getProductPriceForRegion(
  product: SanityProduct, 
  currency: string
): number {
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
  if (!region || !product.pricing[region as keyof typeof product.pricing]) {
    console.warn(`No pricing found for currency ${currency} in product ${product._id}`);
    return 0;
  }

  const regionPricing = product.pricing[region as keyof typeof product.pricing];
  if (!regionPricing?.enabled || !regionPricing?.price) {
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
  if (!region || !product.pricing[region as keyof typeof product.pricing]) {
    return false;
  }

  const regionPricing = product.pricing[region as keyof typeof product.pricing];
  return Boolean(regionPricing?.enabled && regionPricing?.price > 0);
}
