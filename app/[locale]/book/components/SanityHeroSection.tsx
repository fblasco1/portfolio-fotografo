"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface SanityBookData {
  coverImage?: any;
  content: {
    es: {
      title: string;
      author: string;
      description: string;
    };
    en: {
      title: string;
      author: string;
      description: string;
    };
  };
}

interface SanityHeroSectionProps {
  bookData: SanityBookData;
  locale: string;
}

export default function SanityHeroSection({ bookData, locale }: SanityHeroSectionProps) {
  // Obtener contenido según el idioma
  const content = bookData.content[locale as keyof typeof bookData.content] || bookData.content.es;
  
  // Obtener URL de la imagen de portada
  const coverImageUrl = bookData.coverImage ? urlFor(bookData.coverImage).url() : null;

  return (
    <div className="relative min-h-[50vh] flex flex-col lg:flex-1 lg:min-h-0 lg:shrink">
      {/* Imagen de fondo si existe */}
      {coverImageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={coverImageUrl}
            alt={content.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}
      
      {/* Contenido */}
      <div className="container mx-auto px-4 h-full pt-36 lg:pt-24 flex flex-col justify-center items-start relative z-10 lg:min-h-0 lg:overflow-hidden lg:pb-2">
        <h1 className="text-2xl md:text-4xl lg:text-3xl font-bold text-black">
          {content.title}
        </h1>
        <h2 className="text-md md:text-lg lg:text-base mb-3 lg:mb-2 text-black/80">
          {content.author}
        </h2>
        <div className="bg-white/90 p-4 md:p-6 lg:p-4 max-w-2xl rounded-lg">
          <p className="text-base md:text-lg lg:text-sm text-gray-800 leading-relaxed lg:line-clamp-5">
            {content.description}
          </p>
        </div>
      </div>
    </div>
  );
}
