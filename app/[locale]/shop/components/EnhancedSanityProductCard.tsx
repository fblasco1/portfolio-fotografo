"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import type { SanityProduct } from "@/app/types/store";
import { AddToCartButton } from "../../../components/payment";
import { useRegion } from "@/hooks/useRegion";

interface EnhancedSanityProductCardProps {
  product: SanityProduct;
  locale: string;
  addToCart: (product: SanityProduct) => void;
}

export default function EnhancedSanityProductCard({ 
  product, 
  locale, 
  addToCart 
}: EnhancedSanityProductCardProps) {
  const { region, loading } = useRegion();
  
  // Obtener contenido según el idioma
  const content = product.content[locale as keyof typeof product.content] || product.content.es;
  
  // Obtener URL de la imagen
  const imageUrl = product.image ? urlFor(product.image).url() : "/placeholder.svg";

  // Convertir producto al formato esperado por AddToCartButton
  const productData = {
    id: product._id,
    title: content.title,
    subtitle: content.subtitle,
    image: imageUrl,
    productType: product.category as 'photos' | 'postcards'
  };

  const handleAddToCart = () => {
    addToCart(product);
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
          {region && region.isSupported ? (
            <span>
              {region.symbol}{product.price}
            </span>
          ) : (
            <span>${product.price}</span>
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
        <AddToCartButton
          product={productData}
          locale={locale}
          variant="default"
          size="md"
        />
        
        {/* Información de región */}
        {region && region.isSupported && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            <span>
              {locale === 'es' ? 'Disponible en' : 'Available in'} {region.country}
            </span>
          </div>
        )}
        
        {/* Mensaje de región no soportada */}
        {!loading && (!region || !region.isSupported) && (
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
