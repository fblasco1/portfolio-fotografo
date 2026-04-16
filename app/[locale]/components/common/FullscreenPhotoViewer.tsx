"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, ShoppingCart } from "lucide-react";
import { useCurrentLocale } from "@/locales/client";
import { useCart } from "@/contexts/CartContext";

export interface ViewerPhoto {
  url: string;
  /** Diapositiva solo texto (título, ubicación, cuerpo); `url` vacío. */
  kind?: "text" | "image";
  title?: string;
  description?: string;
  /** Texto largo solo en diapositiva `kind: "text"`. */
  body?: string;
  id?: string;
}

interface FullscreenPhotoViewerProps {
  photos: ViewerPhoto[];
  onClose: () => void;
  initialIndex?: number;
  showNavigation?: boolean;
  showCounter?: boolean;
  allowAddToCart?: boolean;
}

function isTextSlide(photo: ViewerPhoto | undefined): boolean {
  return photo?.kind === "text";
}

function useImageUrlsKey(photos: ViewerPhoto[]): string {
  return useMemo(
    () =>
      photos
        .filter((p) => !isTextSlide(p) && p.url)
        .map((p) => p.url)
        .join("\n"),
    [photos],
  );
}

function preloadImages(urls: string[]): void {
  for (const url of urls) {
    const img = new window.Image();
    img.src = url;
  }
}

function SlideImage({
  src,
  alt,
  fetchPriority,
}: {
  src: string;
  alt: string;
  fetchPriority?: "high" | "low" | "auto";
}) {
  return (
    // Imagen directa desde CDN (URLs ya optimizadas en Sanity); sin loader ni Next/Image para máxima fluidez al navegar.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="max-h-full max-w-full object-contain"
      decoding="async"
      fetchPriority={fetchPriority ?? "auto"}
    />
  );
}

export default function FullscreenPhotoViewer({
  photos,
  onClose,
  initialIndex = 0,
  showNavigation = true,
  showCounter = true,
  allowAddToCart = false,
}: FullscreenPhotoViewerProps) {
  const locale = useCurrentLocale() as "es" | "en";
  const { addItem } = useCart();
  const imageUrlsKey = useImageUrlsKey(photos);

  const validInitialIndex =
    photos.length > 0 ? Math.min(Math.max(initialIndex, 0), photos.length - 1) : 0;
  const [currentIndex, setCurrentIndex] = useState(validInitialIndex);
  const [addedToCart, setAddedToCart] = useState(false);

  const totalSlides = photos.length;
  const currentPhoto = photos[currentIndex];
  const onTextSlide = isTextSlide(currentPhoto);

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
    const urls = photos
      .filter((p) => !isTextSlide(p) && p.url)
      .map((p) => p.url);
    preloadImages(urls);
  }, [imageUrlsKey]);

  const nextPhoto = useCallback(() => {
    if (!showNavigation || totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [showNavigation, totalSlides]);

  const prevPhoto = useCallback(() => {
    if (!showNavigation || totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [showNavigation, totalSlides]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }
      if (!showNavigation) return;
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
  }, [showNavigation, nextPhoto, prevPhoto, handleClose]);

  const resolvedTitle = useMemo(() => {
    return currentPhoto?.title || "";
  }, [currentPhoto]);

  const resolvedSubtitle = useMemo(() => {
    return currentPhoto?.description || "";
  }, [currentPhoto]);

  useEffect(() => {
    setAddedToCart(false);
  }, [currentIndex]);

  const handleAddToCart = useCallback(() => {
    if (!allowAddToCart || !currentPhoto?.url || isTextSlide(currentPhoto)) return;

    const uniqueId = currentPhoto.id
      ? `${currentPhoto.id}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      : `photo_${currentIndex}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

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

  const firstImageIndex = photos.findIndex((p) => !isTextSlide(p) && p.url);

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

      {showNavigation && totalSlides > 1 && (
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
        <div className="relative flex h-[calc(100vh-220px)] max-h-[80vh] w-full max-w-5xl items-center justify-center overflow-hidden bg-black">
          {onTextSlide ? (
            <div className="flex max-h-full w-full flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center">
              {currentPhoto?.title && (
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-wide text-white">
                  {currentPhoto.title}
                </h2>
              )}
              {currentPhoto?.description && (
                <p className="mt-3 text-sm uppercase tracking-[0.25em] text-stone-400">
                  {currentPhoto.description}
                </p>
              )}
              {currentPhoto?.body ? (
                <p className="mt-8 max-w-2xl text-base leading-relaxed text-stone-200 whitespace-pre-wrap">
                  {currentPhoto.body}
                </p>
              ) : null}
            </div>
          ) : currentPhoto?.url ? (
            <SlideImage
              src={currentPhoto.url}
              alt={currentPhoto?.description || currentPhoto?.title || "Photo"}
              fetchPriority={currentIndex === firstImageIndex || firstImageIndex === -1 ? "high" : "auto"}
            />
          ) : (
            <div className="bg-white p-8 rounded-lg max-w-2xl max-h-full overflow-y-auto text-gray-800 shadow-lg">
              {currentPhoto?.description || currentPhoto?.title}
            </div>
          )}
        </div>

        {!onTextSlide &&
          (resolvedTitle || resolvedSubtitle || (showCounter && totalSlides > 1) || allowAddToCart) && (
            <div className="mt-8 text-center text-white px-4 space-y-3">
              {resolvedTitle && (
                <h2 className="text-2xl font-semibold tracking-wide">{resolvedTitle}</h2>
              )}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {resolvedSubtitle && (
                  <p className="text-sm text-gray-300 leading-relaxed">{resolvedSubtitle}</p>
                )}
                {allowAddToCart && currentPhoto && currentPhoto.url && (
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
              {showCounter && totalSlides > 1 && (
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                  {locale === "es"
                    ? `${currentIndex + 1} de ${totalSlides}`
                    : `${currentIndex + 1} of ${totalSlides}`}
                </p>
              )}
            </div>
          )}

        {onTextSlide && showCounter && totalSlides > 1 && (
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-gray-400">
            {locale === "es"
              ? `${currentIndex + 1} de ${totalSlides}`
              : `${currentIndex + 1} of ${totalSlides}`}
          </p>
        )}
      </div>
    </div>
  );
}
