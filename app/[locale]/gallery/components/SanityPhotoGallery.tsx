"use client";

import { useState } from "react";
import type { SanityGallery } from "@/app/types/gallery";
import SanityGalleryCard from "./SanityGalleryCard";
import FullscreenPhotoViewer, { type ViewerPhoto } from "@/app/[locale]/components/common/FullscreenPhotoViewer";
import { urlFor } from "@/lib/sanity";

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
  return (gallery.photos || []).map((photo) => ({
    url: urlFor(photo).url(),
    title,
    description: gallery.location,
  }));
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
          showNavigation={Boolean(selectedGallery.photos && selectedGallery.photos.length > 1)}
          showCounter={Boolean(selectedGallery.photos && selectedGallery.photos.length > 1)}
        />
      )}
    </div>
  );
}
