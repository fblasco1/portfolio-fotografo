"use client";

import { useState, useMemo } from "react";
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

function getGalleryDescription(gallery: SanityGallery, locale: string): string | undefined {
  const content =
    gallery.content[locale as keyof typeof gallery.content] || gallery.content.es;
  const text = content?.description?.trim();
  return text || undefined;
}

/** URLs acotadas para menos peso y carga más rápida desde el CDN de Sanity. */
function sanityViewerUrl(source: unknown): string {
  try {
    return urlFor(source).width(2400).quality(85).url();
  } catch {
    return urlFor(source).url();
  }
}

/** Primera diapositiva: texto; luego portada (si existe) y el resto de fotos. */
function getViewerSlides(gallery: SanityGallery, locale: string): ViewerPhoto[] {
  const title = getGalleryTitle(gallery, locale);
  const longDescription = getGalleryDescription(gallery, locale);
  const slides: ViewerPhoto[] = [
    {
      kind: "text",
      url: "",
      title,
      description: gallery.location,
      body: longDescription ?? "",
      id: `${gallery._id}_text`,
    },
  ];

  if (gallery.cover) {
    slides.push({
      kind: "image",
      url: sanityViewerUrl(gallery.cover),
      title,
      description: gallery.location,
      id: `${gallery._id}_cover`,
    });
  }

  if (gallery.photos && gallery.photos.length > 0) {
    gallery.photos.forEach((photo, index) => {
      slides.push({
        kind: "image",
        url: sanityViewerUrl(photo),
        title,
        description: gallery.location,
        id: `${gallery._id}_photo_${index}`,
      });
    });
  }

  return slides;
}

export default function SanityPhotoGallery({ galleries, locale }: SanityPhotoGalleryProps) {
  const [selectedGallery, setSelectedGallery] = useState<SanityGallery | null>(null);

  const viewerSlides = useMemo(
    () => (selectedGallery ? getViewerSlides(selectedGallery, locale) : []),
    [selectedGallery, locale],
  );

  const showNav = viewerSlides.length > 1;

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
          photos={viewerSlides}
          onClose={() => setSelectedGallery(null)}
          showNavigation={showNav}
          showCounter={showNav}
          allowAddToCart={true}
        />
      )}

      <Cart locale={locale} variant="floating" />
    </div>
  );
}
