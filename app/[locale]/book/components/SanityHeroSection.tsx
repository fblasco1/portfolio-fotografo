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
    <div className="relative min-h-[50vh] lg:min-h-[60vh]">
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
      <div className="container mx-auto px-4 h-full pt-36 lg:pt-32 flex flex-col justify-center items-start relative z-10">
        <h1 className="text-2xl md:text-4xl font-bold text-black">
          {content.title}
        </h1>
        <h2 className="text-md md:text-lg mb-4 lg:mb-6 text-black/80">
          {content.author}
        </h2>
        <div className="bg-white/90 p-4 md:p-6 lg:p-8 max-w-2xl rounded-lg">
          <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed">
            {content.description}
          </p>
        </div>
      </div>
    </div>
  );
}
