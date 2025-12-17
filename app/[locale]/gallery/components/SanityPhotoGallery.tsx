"use client";

import { useState } from "react";
import type { SanityGallery } from "@/app/types/gallery";
import SanityGalleryCard from "./SanityGalleryCard";
import FullscreenPhotoViewer, { type ViewerPhoto } from "@/app/[locale]/components/common/FullscreenPhotoViewer";
import { urlFor } from "@/lib/sanity";
import Cart from "@/app/[locale]/shop/components/Cart";

interface SanityPhotoGalleryProps {
  galleries: SanityGallery[];
  locale: string;
}

function getGalleryTitle(gallery: SanityGallery, locale: string): string {
  return (
    gallery.content[locale as keyof typeof gallery.content]?.title ||
    gallery.content.es.title ||
    gallery._id
  );
}

function getViewerPhotos(gallery: SanityGallery, locale: string): ViewerPhoto[] {
  const title = getGalleryTitle(gallery, locale);
  const photos: ViewerPhoto[] = [];
  
  // Agregar la imagen de portada como primera foto si existe
  if (gallery.cover) {
    photos.push({
      url: urlFor(gallery.cover).url(),
      title,
      description: gallery.location,
      id: `${gallery._id}_cover`, // ID único para la portada
    });
  }
  
  // Agregar las demás fotos del carrusel
  if (gallery.photos && gallery.photos.length > 0) {
    gallery.photos.forEach((photo, index) => {
      photos.push({
        url: urlFor(photo).url(),
        title,
        description: gallery.location,
        id: `${gallery._id}_photo_${index}`, // ID único para cada foto
      });
    });
  }
  
  return photos;
}

export default function SanityPhotoGallery({ galleries, locale }: SanityPhotoGalleryProps) {
  const [selectedGallery, setSelectedGallery] = useState<SanityGallery | null>(null);

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <SanityGalleryCard
            key={gallery._id}
            gallery={gallery}
            locale={locale}
            onClick={() => setSelectedGallery(gallery)}
          />
        ))}
      </div>
      {selectedGallery && (
        <FullscreenPhotoViewer
          photos={getViewerPhotos(selectedGallery, locale)}
          onClose={() => setSelectedGallery(null)}
          viewerTitle={getGalleryTitle(selectedGallery, locale)}
          viewerSubtitle={selectedGallery.location}
          showNavigation={(() => {
            const photos = getViewerPhotos(selectedGallery, locale);
            return photos.length > 1;
          })()}
          showCounter={(() => {
            const photos = getViewerPhotos(selectedGallery, locale);
            return photos.length > 1;
          })()}
          allowAddToCart={true}
        />
      )}
      
      {/* Carrito flotante */}
      <Cart locale={locale} variant="floating" />
    </div>
  );
}
