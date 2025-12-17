"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import type { SanityGallery } from "@/app/types/gallery";

interface SanityGalleryCardProps {
  gallery: SanityGallery;
  locale: string;
  onClick: () => void;
}

export default function SanityGalleryCard({ gallery, locale, onClick }: SanityGalleryCardProps) {
  // Obtener contenido según el idioma
  const content = gallery.content[locale as keyof typeof gallery.content] || gallery.content.es;
  
  // Usar la imagen de portada (cover) como portada de la tarjeta
  const hasCover = gallery.cover;
  const coverUrl = hasCover ? urlFor(gallery.cover).url() : "/placeholder.svg";

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white"
      onClick={onClick}
    >
      {hasCover ? (
        <Image
          src={coverUrl}
          alt={content.title}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📸</div>
            <div className="text-sm">
              {locale === 'en' ? 'Images coming soon' : 'Imágenes próximamente'}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{content.title}</h3>
        <p className="text-sm text-gray-500">{gallery.location}</p>
        {content.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{content.description}</p>
        )}
      </div>
    </div>
  );
}
