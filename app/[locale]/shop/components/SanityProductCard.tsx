"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import type { SanityProduct } from "@/app/types/store";

interface SanityProductCardProps {
  product: SanityProduct;
  locale: string;
  addToCart: (product: SanityProduct) => void;
}

export default function SanityProductCard({ product, locale, addToCart }: SanityProductCardProps) {
  // Obtener contenido según el idioma
  const content = product.content[locale as keyof typeof product.content] || product.content.es;
  
  // Obtener URL de la imagen
  const imageUrl = product.image ? urlFor(product.image).url() : "/placeholder.svg";

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
          ${product.price}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {content.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {content.subtitle}
        </p>
        
        <button
          onClick={handleAddToCart}
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors duration-200"
        >
          {locale === 'en' ? 'Add to Cart' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  );
}
