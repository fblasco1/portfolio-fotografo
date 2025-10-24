"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/locales/client";
import type { Photo } from "../../../types/gallery";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoSliderProps {
  photos: Photo[];
  onClose: () => void;
}

export default function StaticPhotoSlider({ photos, onClose }: PhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const t = useI18n();

  const preloadImages = () => {
    const nextIndex = (currentIndex + 1) % photos.length;
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    [nextIndex, prevIndex].forEach((index) => {
      const img = new window.Image();
      img.src = photos[index].url;
    });
  };

  useEffect(() => {
    preloadImages();
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <button className="absolute top-4 right-4 text-white" onClick={onClose}>
        <X size={24} />
      </button>
      <button className="absolute left-4 text-white" onClick={goToPrevious}>
        <ChevronLeft size={24} />
      </button>
      <div className="relative w-full max-w-4xl h-full max-h-[80vh] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}
        {currentPhoto.url ? (
          <Image
            src={currentPhoto.url || "/placeholder.svg"}
            alt={t(currentPhoto.description as any)}
            layout="fill"
            objectFit="contain"
            priority
            loading="eager"
            onLoadingComplete={() => setIsLoading(false)}
          />
        ) : (
          <div className="bg-white p-8 rounded-lg max-w-2xl max-h-full overflow-y-auto">
            <p className="text-gray-700">
              {t(currentPhoto.description as any)}
            </p>
          </div>
        )}
      </div>
      <button className="absolute right-4 text-white" onClick={goToNext}>
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
