"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { urlFor } from "@/lib/sanity";
import { X } from "lucide-react";

interface SlideshowClientProps {
  images: any[];
}

export default function SlideshowClient({ images }: SlideshowClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile && images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % images.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMobile, images.length]);

  // Manejar tecla Escape para cerrar el lightbox en móvil
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex !== null && e.key === "Escape") {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex]);

  // Si no hay imágenes, mostrar un mensaje o imagen por defecto
  if (!images || images.length === 0) {
    return (
      <div className="fixed inset-0 z-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg">No hay imágenes configuradas para el slideshow</p>
          <p className="text-sm mt-2">Configura las imágenes desde el panel de administración</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isMobile ? (
        <div className="fixed inset-0 z-0">
          {images.map((image, index) => (
            <div
              key={image._key || index}
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-1000",
                {
                  "opacity-100": index === currentImageIndex,
                  "opacity-0": index !== currentImageIndex,
                }
              )}
            >
              <div className="absolute inset-0 bg-black/30 z-10" />
              <Image
                src={urlFor(image).url()}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 pt-24 px-2">
            {images.map((image, index) => (
              <div
                key={image._key || index}
                className={cn(
                  "relative w-full cursor-pointer",
                  index % 5 === 0
                    ? "col-span-2 row-span-2"
                    : "col-span-1 row-span-1"
                )}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={urlFor(image).url()}
                  alt={`Image ${index + 1}`}
                  className="object-cover rounded-lg"
                  layout="responsive"
                  width={300}
                  height={200}
                />
              </div>
            ))}
          </div>

          {/* Lightbox solo para móvil - muestra solo la imagen clickeada */}
          {selectedImageIndex !== null && (
            <div
              className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center"
              onClick={() => setSelectedImageIndex(null)}
            >
              <div
                className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto px-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botón cerrar */}
                <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={24} />
                </button>

                {/* Imagen ampliada */}
                <div className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
                  <Image
                    src={urlFor(images[selectedImageIndex]).url()}
                    alt={`Imagen ${selectedImageIndex + 1}`}
                    fill
                    sizes="95vw"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
