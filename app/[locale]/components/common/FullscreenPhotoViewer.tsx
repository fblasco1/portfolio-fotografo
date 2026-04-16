"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ShoppingCart } from "lucide-react";
import { useCurrentLocale } from "@/locales/client";
import { useCart } from "@/contexts/CartContext";

export interface ViewerPhoto {
  url: string;
  title?: string;
  description?: string;
  id?: string;
}

interface FullscreenPhotoViewerProps {
  photos: ViewerPhoto[];
  onClose: () => void;
  initialIndex?: number;
  showNavigation?: boolean;
  showCounter?: boolean;
  viewerTitle?: string;
  viewerSubtitle?: string;
  /** Texto largo de la carpeta (p. ej. desde Sanity); se muestra en la pantalla inicial mientras se precargan las fotos. */
  folderDescription?: string;
  allowAddToCart?: boolean;
}

type ViewerPhase = "intro" | "gallery";

function usePhotoPreloadKey(photos: ViewerPhoto[]): string {
  return useMemo(() => photos.map((p) => p.url).join("\n"), [photos]);
}

function preloadImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let pending = urls.length;
    const done = () => {
      pending -= 1;
      if (pending <= 0) resolve();
    };
    for (const url of urls) {
      const img = new window.Image();
      img.onload = done;
      img.onerror = done;
      img.src = url;
    }
  });
}

export default function FullscreenPhotoViewer({
  photos,
  onClose,
  initialIndex = 0,
  showNavigation = true,
  showCounter = true,
  viewerTitle,
  viewerSubtitle,
  folderDescription,
  allowAddToCart = false,
}: FullscreenPhotoViewerProps) {
  const locale = useCurrentLocale() as "es" | "en";
  const { addItem } = useCart();
  const preloadKey = usePhotoPreloadKey(photos);

  const validInitialIndex = photos.length > 0
    ? Math.min(Math.max(initialIndex, 0), photos.length - 1)
    : 0;
  const [currentIndex, setCurrentIndex] = useState(validInitialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [phase, setPhase] = useState<ViewerPhase>("intro");
  const [preloadDone, setPreloadDone] = useState(false);
  const introEnteredAt = useRef<number>(0);

  const totalPhotos = photos.length;
  const currentPhoto = photos[currentIndex];

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (photos.length > 0) {
      const validIndex = Math.min(Math.max(initialIndex, 0), photos.length - 1);
      setCurrentIndex(validIndex);
    }
  }, [initialIndex, photos.length]);

  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex, phase]);

  useEffect(() => {
    if (!currentPhoto?.url) {
      setIsLoading(false);
    }
  }, [currentPhoto?.url]);

  useEffect(() => {
    const urls = photos.map((p) => p.url).filter(Boolean);
    let cancelled = false;
    setPreloadDone(false);
    setPhase("intro");
    introEnteredAt.current = Date.now();

    if (urls.length === 0) {
      setPreloadDone(true);
      setPhase("gallery");
      return;
    }

    void (async () => {
      await preloadImages(urls);
      if (cancelled) return;
      setPreloadDone(true);
      const elapsed = Date.now() - introEnteredAt.current;
      const minIntroMs = 450;
      const wait = Math.max(0, minIntroMs - elapsed);
      window.setTimeout(() => {
        if (!cancelled) setPhase("gallery");
      }, wait);
    })();

    return () => {
      cancelled = true;
    };
  }, [preloadKey]);

  const nextPhoto = useCallback(() => {
    if (phase !== "gallery" || !showNavigation || totalPhotos <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  }, [phase, showNavigation, totalPhotos]);

  const prevPhoto = useCallback(() => {
    if (phase !== "gallery" || !showNavigation || totalPhotos <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  }, [phase, showNavigation, totalPhotos]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }
      if (phase !== "gallery" || !showNavigation) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextPhoto();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, showNavigation, nextPhoto, prevPhoto, handleClose]);

  const resolvedTitle = useMemo(() => {
    if (viewerTitle) return viewerTitle;
    return currentPhoto?.title || "";
  }, [viewerTitle, currentPhoto]);

  const resolvedSubtitle = useMemo(() => {
    if (viewerSubtitle) return viewerSubtitle;
    return currentPhoto?.description || "";
  }, [viewerSubtitle, currentPhoto]);

  useEffect(() => {
    setAddedToCart(false);
  }, [currentIndex]);

  const handleAddToCart = useCallback(() => {
    if (!allowAddToCart || !currentPhoto) return;

    const uniqueId = currentPhoto.id
      ? `${currentPhoto.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : `photo_${currentIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const photoTitle = resolvedTitle || currentPhoto.title || `Foto ${currentIndex + 1}`;
    const photoSubtitle = resolvedSubtitle || currentPhoto.description || "";

    addItem({
      id: uniqueId,
      title: photoTitle,
      subtitle: photoSubtitle,
      image: currentPhoto.url,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [allowAddToCart, currentPhoto, currentIndex, resolvedTitle, resolvedSubtitle, addItem]);

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

  const introTitle = viewerTitle || currentPhoto?.title || "";
  const introBody =
    folderDescription?.trim() ||
    (locale === "es"
      ? "Preparando las fotografías de esta serie…"
      : "Preparing photographs from this series…");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-busy={phase === "intro" && !preloadDone}
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

      {phase === "gallery" && showNavigation && totalPhotos > 1 && (
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
        {phase === "intro" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
            {introTitle && (
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-wide text-white mb-4">
                {introTitle}
              </h2>
            )}
            {viewerSubtitle && (
              <p className="text-sm uppercase tracking-[0.25em] text-stone-400 mb-6">
                {viewerSubtitle}
              </p>
            )}
            <p className="text-base sm:text-lg text-stone-200 leading-relaxed whitespace-pre-wrap">
              {introBody}
            </p>
            <div className="mt-10 flex flex-col items-center gap-3" aria-hidden="true">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white/90" />
              <p className="text-xs text-stone-500 uppercase tracking-widest">
                {locale === "es" ? "Cargando imágenes" : "Loading images"}
              </p>
            </div>
          </div>
        )}

        {phase === "gallery" && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-white/70" />
          </div>
        )}

        <div
          className={`relative w-full max-w-5xl h-[calc(100vh-220px)] max-h-[80vh] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-300 ${
            phase === "intro" ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {currentPhoto?.url ? (
            <Image
              src={currentPhoto.url}
              alt={currentPhoto?.description || currentPhoto?.title || "Photo"}
              fill
              sizes="100vw"
              className="object-contain"
              priority
              unoptimized
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div className="bg-white p-8 rounded-lg max-w-2xl max-h-full overflow-y-auto text-gray-800 shadow-lg">
              {currentPhoto?.description || currentPhoto?.title}
            </div>
          )}
        </div>

        {phase === "gallery" &&
          (resolvedTitle || resolvedSubtitle || (showCounter && totalPhotos > 1) || allowAddToCart) && (
            <div className="mt-8 text-center text-white px-4 space-y-3">
              {resolvedTitle && (
                <h2 className="text-2xl font-semibold tracking-wide">{resolvedTitle}</h2>
              )}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {resolvedSubtitle && (
                  <p className="text-sm text-gray-300 leading-relaxed">{resolvedSubtitle}</p>
                )}
                {allowAddToCart && currentPhoto && (
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      addedToCart
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-stone-700/80 hover:bg-stone-600/80"
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAddToCart();
                    }}
                    aria-label={locale === "es" ? "Agregar al carrito" : "Add to cart"}
                  >
                    {addedToCart ? (
                      <>
                        <span className="text-lg">✓</span>
                        <span className="text-sm font-medium">
                          {locale === "es" ? "Agregado" : "Added"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">+</span>
                        <span className="text-sm font-medium">
                          {locale === "es" ? "Agregar al carrito" : "Add to cart"}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
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
