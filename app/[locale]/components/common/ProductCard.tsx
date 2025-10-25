"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/app/[locale]/components/ui/card";
import { Eye } from "lucide-react";
import { AddToCartButton } from "@/components/payment";
import { useRegion } from "@/contexts/RegionContext";
import { urlFor } from "@/lib/sanity";
import { getProductPriceForRegion, isProductAvailableInRegion, isTestProduct } from "@/lib/sanity-products";
import StaticPhotoSlider from "./PhotoSlider";
import type { StoreItem, SanityProduct } from "@/app/types/store";

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

interface ProductCardProps {
  product: StoreItem | SanityProduct;
  t?: any;
  locale: string;
  productType?: 'photos' | 'postcards';
  variant?: 'basic' | 'enhanced';
}

export default function ProductCard({ 
  product, 
  t, 
  locale, 
  productType = 'photos',
  variant = 'basic'
}: ProductCardProps) {
  const { region, loading } = useRegion();
  const [showSlider, setShowSlider] = useState(false);

  // Determinar si es un SanityProduct o StoreItem
  const isSanityProduct = '_id' in product;
  
  // Obtener datos del producto según el tipo
  const productData = isSanityProduct ? {
    id: product._id,
    title: product.content?.[locale as keyof typeof product.content]?.title || product.content?.es?.title || 'Producto',
    subtitle: product.content?.[locale as keyof typeof product.content]?.subtitle || product.content?.es?.subtitle || 'Descripción del producto',
    image: getImageUrl(product.image),
    productType: product.category as 'photos' | 'postcards',
    pricing: product.pricing
  } : {
    id: product.id.toString(),
    title: t ? t(product.titleKey) : product.titleKey,
    subtitle: product.subtitle,
    image: product.url,
    productType: productType,
    pricing: undefined
  };

  // Verificar si el producto tiene precios configurados (solo para SanityProduct)
  const hasPricing = isSanityProduct && Boolean(product.pricing);

  // Obtener precio según la región del usuario (solo para SanityProduct)
  const productPrice = isSanityProduct && region && region.currency && hasPricing
    ? getProductPriceForRegion(product, region.currency)
    : 0;

  // Verificar si el producto está disponible en la región (solo para SanityProduct)
  const isAvailableInRegion = isSanityProduct && region && region.currency && hasPricing
    ? isProductAvailableInRegion(product, region.currency)
    : true; 

  // Verificar si es un producto de testing
  const isTest = isSanityProduct ? isTestProduct(product) : false;

  // Convertir el producto a formato compatible con PhotoSlider
  const photos = [{
    id: isSanityProduct ? parseInt(product._id) : product.id,
    url: productData.image,
    title: productData.title,
    description: productData.subtitle
  }];

  return (
    <>
      <Card className="h-full">
        <CardContent className="flex flex-col h-full p-0">
          {/* Imagen con hover effect para abrir slider */}
          <div 
            className="relative w-full h-64 cursor-pointer group overflow-hidden bg-gray-100"
            onClick={() => setShowSlider(true)}
          >
            {productData.image ? (
              <Image
                src={productData.image}
                alt={productData.title}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">
                    {product.category === 'photo' ? '📷' : '📮'}
                  </div>
                  <div className="text-sm font-medium">
                    {locale === 'es' ? 'Sin imagen' : 'No image'}
                  </div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye size={24} className="text-white" />
            </div>
            
            {/* Badge de precio (solo para SanityProduct con precios) */}
            {isSanityProduct && (
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
            )}

            {/* Badge de testing */}
            {isTest && (
              <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                🧪 {locale === 'es' ? 'TEST' : 'TEST'}
              </div>
            )}
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-4 flex flex-col flex-grow">
            <CardTitle className="text-lg font-semibold mb-2">
              {productData.title}
            </CardTitle>
            <p className="text-sm text-gray-500 mb-4">
              {productData.subtitle}
            </p>
            
            {/* Spacer para empujar el botón hacia abajo */}
            <div className="flex-grow"></div>
            
            {/* Botón de agregar al carrito */}
            {isSanityProduct && !hasPricing ? (
              <button
                disabled
                className="w-full px-4 py-2 bg-yellow-200 text-yellow-800 rounded-md cursor-not-allowed"
              >
                {locale === 'es' ? 'Precios no configurados' : 'Prices not configured'}
              </button>
            ) : isSanityProduct && region && region.isSupported && isAvailableInRegion ? (
              <AddToCartButton
                product={productData}
                locale={locale}
                size="sm"
                className="w-full"
              />
            ) : isSanityProduct ? (
              <button
                disabled
                className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
              >
                {locale === 'es' ? 'No disponible' : 'Not available'}
              </button>
            ) : (
              <AddToCartButton
                product={productData}
                locale={locale}
                size="sm"
                className="w-full"
              />
            )}
            
            {/* Mensajes informativos (solo para SanityProduct) */}
            {isSanityProduct && (
              <>
                {!hasPricing && (
                  <div className="mt-2 text-xs text-yellow-600 text-center">
                    <span>
                      {locale === 'es' ? 'Configure los precios en Sanity' : 'Configure prices in Sanity'}
                    </span>
                  </div>
                )}
                
                {hasPricing && region && region.isSupported && isAvailableInRegion && (
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    <span>
                      {locale === 'es' ? 'Disponible en' : 'Available in'} {region.country}
                    </span>
                  </div>
                )}
                
                {hasPricing && region && region.isSupported && !isAvailableInRegion && (
                  <div className="mt-2 text-xs text-orange-600 text-center">
                    <span>
                      {locale === 'es' ? 'No disponible en tu región' : 'Not available in your region'}
                    </span>
                  </div>
                )}
                
                {hasPricing && !loading && (!region || !region.isSupported) && (
                  <div className="mt-2 text-xs text-orange-600 text-center">
                    <span>
                      {locale === 'es' ? 'Solo en Latinoamérica' : 'Latin America only'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slider para ver imagen en alta resolución */}
      {showSlider && (
        <StaticPhotoSlider
          photos={photos}
          onClose={() => setShowSlider(false)}
        />
      )}
    </>
  );
}
