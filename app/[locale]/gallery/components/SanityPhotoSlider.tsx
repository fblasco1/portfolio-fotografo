"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { urlFor } from "@/lib/sanity";
import type { SanityGallery } from "@/app/types/gallery";

interface SanityPhotoSliderProps {
  gallery: SanityGallery;
  locale: string;
  onClose: () => void;
}

export default function SanityPhotoSlider({ gallery, locale, onClose }: SanityPhotoSliderProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Obtener contenido según el idioma
  const content = gallery.content[locale as keyof typeof gallery.content] || gallery.content.es;
  
  // Obtener fotos de la galería
  const photos = gallery.photos || [];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") nextPhoto();
    if (e.key === "ArrowLeft") prevPhoto();
  };

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg">No hay fotos en esta galería</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X size={24} />
        </button>

        {/* Botones navegación */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Imagen actual */}
        <div className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden bg-black rounded-lg">
          <Image
            src={urlFor(photos[currentPhotoIndex]).url()}
            alt={`${content.title} - Foto ${currentPhotoIndex + 1}`}
            fill
            sizes="(max-width: 768px) 80vw, 800px"
            className="object-contain"
          />
        </div>


        {/* Información de la galería */}
        <div className="absolute bottom-4 left-4 right-4 text-white text-center">
          <h2 className="text-xl font-semibold">{content.title}</h2>
          <p className="text-sm text-gray-300">{gallery.location}</p>
          {photos.length > 1 && (
            <p className="text-sm text-gray-400 mt-1">
              {currentPhotoIndex + 1} de {photos.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
