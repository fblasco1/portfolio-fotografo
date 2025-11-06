"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/app/[locale]/components/ui/card";
import { Eye } from "lucide-react";
import { AddToCartButton } from "@/components/payment";
import { useRegion } from "@/contexts/RegionContext";
import { urlFor } from "@/lib/sanity";
import { isTestProduct } from "@/lib/sanity-products";
import { getAvailableSizes, type SizePricing } from "@/lib/sanity-pricing";
import SizeSelector from "@/components/product/SizeSelector";
import StaticPhotoSlider from "./PhotoSlider";
import type { StoreItem, SanityProduct } from "@/app/types/store";
import type { ProductSize } from "@/contexts/CartContext";

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
  pricing?: SizePricing | null; // Precios ya cargados desde PhotoStore
}

export default function ProductCard({ 
  product, 
  t, 
  locale, 
  productType = 'photos',
  variant = 'basic',
  pricing: propPricing
}: ProductCardProps) {
  const router = useRouter();
  const { region, loading } = useRegion();
  const [showSlider, setShowSlider] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  // Determinar si es un SanityProduct o StoreItem
  const isSanityProduct = '_id' in product;
  
  // Obtener datos del producto según el tipo
  const productData = isSanityProduct ? {
    id: product._id,
    title: product.content?.[locale as keyof typeof product.content]?.title || product.content?.es?.title || 'Producto',
    subtitle: product.content?.[locale as keyof typeof product.content]?.subtitle || product.content?.es?.subtitle || 'Descripción del producto',
    image: getImageUrl(product.image),
    productType: product.category as 'photos' | 'postcards'
  } : {
    id: product.id.toString(),
    title: t ? t(product.titleKey) : product.titleKey,
    subtitle: product.subtitle,
    image: product.url,
    productType: productType,
    pricing: undefined
  };

  // Los precios ahora son globales, no por producto
  // Si se pasan precios desde el padre, usarlos; si no, cargarlos
  const [pricing, setPricing] = useState<SizePricing | null>(propPricing || null);
  const [pricingLoaded, setPricingLoaded] = useState(!!propPricing);
  const hasGlobalPricing = isSanityProduct && (pricingLoaded || !!pricing);

  // Verificar si es un producto de testing
  const isTest = isSanityProduct ? isTestProduct(product) : false;

  // Obtener tamaños disponibles (solo para SanityProduct)
  // Si ya tenemos pricing, calcular tamaños sincrónicamente; si no, cargarlo
  const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);
  const [sizesLoaded, setSizesLoaded] = useState(false);

  // Si recibimos pricing desde props, actualizar estado
  useEffect(() => {
    if (propPricing !== undefined) {
      setPricing(propPricing);
      setPricingLoaded(true);
    }
  }, [propPricing]);

  // Calcular tamaños disponibles cuando tengamos pricing
  useEffect(() => {
    if (isSanityProduct) {
      if (pricing) {
        // Si ya tenemos pricing, calcular tamaños sincrónicamente (rápido)
        const sizes = getAvailableSizes(pricing);
        setAvailableSizes(sizes);
        setSizesLoaded(true);
        
        // Auto-seleccionar primer tamaño disponible si no hay selección
        if (!selectedSize && sizes.length > 0) {
          const firstStandardSize = sizes.find(size => size !== 'custom');
          if (firstStandardSize) {
            setSelectedSize(firstStandardSize);
          }
        }
      } else if (pricingLoaded && !pricing) {
        // Si ya se cargó pero no hay pricing, solo mostrar custom
        setAvailableSizes(['custom']);
        setSizesLoaded(true);
      } else if (!pricingLoaded) {
        // Si no se ha cargado aún, mostrar loading
        setSizesLoaded(false);
      }
    } else {
      setSizesLoaded(true);
    }
  }, [isSanityProduct, pricing, pricingLoaded, selectedSize]);

  const handleCustomSizeContact = () => {
    // Determinar el tipo de producto (FOTO o POSTAL)
    const productTypeLabel = productData.productType === 'photos' 
      ? (locale === 'es' ? 'FOTO' : 'PHOTO')
      : (locale === 'es' ? 'POSTAL' : 'POSTCARD');
    
    // Construir el asunto del formulario
    const subject = locale === 'es'
      ? `Solicitud de ${productTypeLabel} ${productData.title} en tamaño personalizado`
      : `Request for ${productTypeLabel} ${productData.title} in custom size`;
    
    // Redirigir al formulario de contacto con los parámetros
    const params = new URLSearchParams({
      subject: subject,
      productType: productData.productType,
      productName: productData.title
    });
    
    router.push(`/${locale}/contact?${params.toString()}`);
  };

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
            
            {/* Spacer para empujar el selector y botón hacia abajo */}
            <div className="flex-grow"></div>
            
            {/* Mostrar loading mientras se cargan los tamaños */}
            {isSanityProduct && hasGlobalPricing && !sizesLoaded ? (
              <div className="mb-4 flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-600"></div>
              </div>
            ) : (
              <>
                {/* Selector de tamaño (siempre visible para SanityProduct con precios globales) */}
                {isSanityProduct && hasGlobalPricing && sizesLoaded && (
                  <div className="mb-4">
                    <SizeSelector
                      product={product as SanityProduct}
                      selectedSize={selectedSize}
                      onSizeChange={setSelectedSize}
                      locale={locale as 'es' | 'en'}
                      onCustomSizeContact={handleCustomSizeContact}
                      pricing={pricing}
                    />
                  </div>
                )}
                
                {/* Botón de agregar al carrito */}
                {isSanityProduct ? (
                  hasGlobalPricing && sizesLoaded ? (
                    <AddToCartButton
                      product={productData}
                      selectedSize={selectedSize}
                      locale={locale}
                      size="sm"
                      className="w-full"
                    />
                  ) : null
                ) : (
                  <AddToCartButton
                    product={productData}
                    selectedSize={selectedSize || '15x21'}
                    locale={locale}
                    size="sm"
                    className="w-full"
                  />
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
