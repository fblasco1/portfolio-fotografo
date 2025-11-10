"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCurrentLocale } from "@/locales/client";

export interface ViewerPhoto {
  url: string;
  title?: string;
  description?: string;
}

interface FullscreenPhotoViewerProps {
  photos: ViewerPhoto[];
  onClose: () => void;
  initialIndex?: number;
  showNavigation?: boolean;
  showCounter?: boolean;
  viewerTitle?: string;
  viewerSubtitle?: string;
}

export default function FullscreenPhotoViewer({
  photos,
  onClose,
  initialIndex = 0,
  showNavigation = true,
  showCounter = true,
  viewerTitle,
  viewerSubtitle,
}: FullscreenPhotoViewerProps) {
  const locale = useCurrentLocale() as "es" | "en";
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0))
  );
  const [isLoading, setIsLoading] = useState(true);

  const totalPhotos = photos.length;
  const currentPhoto = photos[currentIndex];

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    setCurrentIndex(Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0)));
  }, [initialIndex, photos.length]);

  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  useEffect(() => {
    if (!currentPhoto?.url) {
      setIsLoading(false);
    }
  }, [currentPhoto?.url]);

  const nextPhoto = useCallback(() => {
    if (!showNavigation || totalPhotos <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  }, [showNavigation, totalPhotos]);

  const prevPhoto = useCallback(() => {
    if (!showNavigation || totalPhotos <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  }, [showNavigation, totalPhotos]);

  useEffect(() => {
    if (!showNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nextPhoto();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showNavigation, nextPhoto, prevPhoto, handleClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  const resolvedTitle = useMemo(() => {
    if (viewerTitle) return viewerTitle;
    return currentPhoto?.title || "";
  }, [viewerTitle, currentPhoto]);

  const resolvedSubtitle = useMemo(() => {
    if (viewerSubtitle) return viewerSubtitle;
    return currentPhoto?.description || "";
  }, [viewerSubtitle, currentPhoto]);

  if (!photos || photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-6 max-w-sm text-center space-y-4">
          <p className="text-gray-800 text-sm">
            {locale === "es"
              ? "No hay imágenes disponibles."
              : "No images available."}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-700 text-white rounded-md hover:bg-stone-600 transition-colors"
          >
            {locale === "es" ? "Cerrar" : "Close"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
        onClick={(event) => {
          event.stopPropagation();
          handleClose();
        }}
        aria-label={locale === "es" ? "Cerrar visor" : "Close viewer"}
      >
        <X size={28} />
      </button>

      {showNavigation && totalPhotos > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:text-gray-300 transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              prevPhoto();
            }}
            aria-label={locale === "es" ? "Anterior" : "Previous"}
          >
            <ChevronLeft size={32} />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:text-gray-300 transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              nextPhoto();
            }}
            aria-label={locale === "es" ? "Siguiente" : "Next"}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div
        className="relative w-full h-full flex flex-col items-center justify-center px-4 py-12"
        onClick={(event) => event.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-white/70"></div>
          </div>
        )}

        <div className="relative w-full max-w-5xl h-[calc(100vh-220px)] max-h-[80vh] flex items-center justify-center overflow-hidden bg-black">
          {currentPhoto?.url ? (
            <Image
              src={currentPhoto.url}
              alt={currentPhoto?.description || currentPhoto?.title || "Photo"}
              fill
              sizes="100vw"
              className="object-contain"
              priority
              loading="eager"
              onLoadingComplete={() => setIsLoading(false)}
            />
          ) : (
            <div className="bg-white p-8 rounded-lg max-w-2xl max-h-full overflow-y-auto text-gray-800 shadow-lg">
              {currentPhoto?.description || currentPhoto?.title}
            </div>
          )}
        </div>

        {(resolvedTitle || resolvedSubtitle || (showCounter && totalPhotos > 1)) && (
          <div className="mt-8 text-center text-white px-4 space-y-3">
            {resolvedTitle && (
              <h2 className="text-2xl font-semibold tracking-wide">{resolvedTitle}</h2>
            )}
            {resolvedSubtitle && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {resolvedSubtitle}
              </p>
            )}
            {showCounter && totalPhotos > 1 && (
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                {locale === "es"
                  ? `${currentIndex + 1} de ${totalPhotos}`
                  : `${currentIndex + 1} of ${totalPhotos}`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

