"use client";

import { useState } from "react";
import type { SanityGallery } from "@/app/types/gallery";
import SanityGalleryCard from "./SanityGalleryCard";
import SanityPhotoSlider from "./SanityPhotoSlider";

interface SanityPhotoGalleryProps {
  galleries: SanityGallery[];
  locale: string;
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
        <SanityPhotoSlider
          gallery={selectedGallery}
          locale={locale}
          onClose={() => setSelectedGallery(null)}
        />
      )}
    </div>
  );
}
