"use client";

import Image from "next/image";
import type { SanityProduct } from "@/lib/sanity-products";
import { AddToCartButton } from "../../../../components/payment";
import { useRegion } from "@/hooks/useRegion";
import { urlFor } from "@/lib/sanity";
import { getProductPriceForRegion, isProductAvailableInRegion } from "@/lib/sanity-products";

// Función segura para obtener URL de imagen
const getImageUrl = (image: any) => {
  try {
    // Si no hay imagen, usar placeholder
    if (!image || !image.asset) {
      return "/placeholder.svg";
    }
    
    // Si ya es una URL, usarla directamente
    if (typeof image === 'string') {
      return image;
    }
    
    // Usar urlFor seguro
    try {
      const builder = (urlFor as any)(image);
      if (builder && builder.width && builder.height && builder.url) {
        return builder.width(400).height(400).url() || "/placeholder.svg";
      }
    } catch (urlError) {
      console.warn('Error using urlFor:', urlError);
    }
    
    // Fallback a URL directa si está disponible
    return image.asset?.url || "/placeholder.svg";
  } catch (error) {
    console.warn('Error getting image URL:', error);
    return "/placeholder.svg";
  }
};

interface EnhancedSanityProductCardProps {
  product: SanityProduct;
  locale: string;
}

export default function EnhancedSanityProductCard({ 
  product, 
  locale
}: EnhancedSanityProductCardProps) {
  const { region, loading } = useRegion();
  
  // Obtener contenido según el idioma
  const content = product.content?.[locale as keyof typeof product.content] || product.content?.es || {
    title: 'Producto',
    subtitle: 'Descripción del producto'
  };
  
  // Obtener URL de la imagen
  const imageUrl = getImageUrl(product.image);

  // Verificar si el producto tiene precios configurados
  const hasPricing = Boolean(product.pricing);

  // Obtener precio según la región del usuario
  const productPrice = region && region.currency && hasPricing
    ? getProductPriceForRegion(product, region.currency)
    : 0;

  // Verificar si el producto está disponible en la región
  const isAvailableInRegion = region && region.currency && hasPricing
    ? isProductAvailableInRegion(product, region.currency)
    : false;

  // Convertir producto al formato esperado por AddToCartButton
  const productData = {
    id: product._id,
    title: content.title,
    subtitle: content.subtitle,
    image: imageUrl,
    productType: product.category as 'photos' | 'postcards',
    pricing: product.pricing
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Image
          src={imageUrl}
          alt={content.title}
          width={400}
          height={300}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {!hasPricing ? (
            <span className="text-yellow-400">
              {locale === 'es' ? 'Sin precio' : 'No price'}
            </span>
          ) : region && region.isSupported && isAvailableInRegion ? (
            <span>
              {region.symbol}{productPrice.toLocaleString()}
            </span>
          ) : region && region.isSupported ? (
            <span className="text-gray-400">
              {locale === 'es' ? 'No disponible' : 'Not available'}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {content.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {content.subtitle}
        </p>
        
        {/* Botón de agregar al carrito mejorado */}
        {!hasPricing ? (
          <button
            disabled
            className="w-full px-4 py-2 bg-yellow-200 text-yellow-800 rounded-md cursor-not-allowed"
          >
            {locale === 'es' ? 'Precios no configurados' : 'Prices not configured'}
          </button>
        ) : region && region.isSupported && isAvailableInRegion ? (
          <AddToCartButton
            product={productData}
            locale={locale}
            variant="default"
            size="md"
          />
        ) : (
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
          >
            {locale === 'es' ? 'No disponible' : 'Not available'}
          </button>
        )}
        
        {/* Mensaje de precios no configurados */}
        {!hasPricing && (
          <div className="mt-2 text-xs text-yellow-600 text-center">
            <span>
              {locale === 'es' ? 'Configure los precios en Sanity' : 'Configure prices in Sanity'}
            </span>
          </div>
        )}
        
        {/* Información de región */}
        {hasPricing && region && region.isSupported && isAvailableInRegion && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            <span>
              {locale === 'es' ? 'Disponible en' : 'Available in'} {region.country}
            </span>
          </div>
        )}
        
        {/* Mensaje de producto no disponible en región */}
        {hasPricing && region && region.isSupported && !isAvailableInRegion && (
          <div className="mt-2 text-xs text-orange-600 text-center">
            <span>
              {locale === 'es' ? 'No disponible en tu región' : 'Not available in your region'}
            </span>
          </div>
        )}
        
        {/* Mensaje de región no soportada */}
        {hasPricing && !loading && (!region || !region.isSupported) && (
          <div className="mt-2 text-xs text-orange-600 text-center">
            <span>
              {locale === 'es' ? 'Solo en Latinoamérica' : 'Latin America only'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
