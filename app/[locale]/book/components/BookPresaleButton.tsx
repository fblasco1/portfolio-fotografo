"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRegion } from "@/contexts/RegionContext";
import { saveBookCheckoutSession } from "@/lib/book-checkout-session";
import { urlFor } from "@/lib/sanity";
import { Button } from "@/app/[locale]/components/ui/button";

type BookPresaleButtonProps = {
  bookId: string;
  locale: string;
  title: string;
  author: string;
  coverImage?: unknown;
  presalePriceARS?: number | null;
  presalePriceUSD?: number | null;
  presaleButtonLabel?: string | null;
};

const BOOK_IMG_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160"><rect fill="%23e7e5e4" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23787169" font-size="12" font-family="sans-serif">Libro</text></svg>'
  );

export default function BookPresaleButton({
  bookId,
  locale,
  title,
  author,
  coverImage,
  presalePriceARS,
  presalePriceUSD,
  presaleButtonLabel,
}: BookPresaleButtonProps) {
  const router = useRouter();
  const { region, loading: regionLoading } = useRegion();

  const coverUrl =
    coverImage && typeof coverImage === "object"
      ? urlFor(coverImage as any).width(400).height(560).fit("crop").url()
      : "";

  const priceARS = useMemo(() => {
    if (presalePriceARS != null && presalePriceARS > 0) return presalePriceARS;
    return null;
  }, [presalePriceARS]);

  const goToCheckout = useCallback(() => {
    if (priceARS == null || priceARS <= 0) return;
    if (!region?.country || region.country !== "AR") return;

    saveBookCheckoutSession({
      bookId,
      title,
      subtitle: author,
      image: coverUrl || BOOK_IMG_FALLBACK,
      unitPriceLocal: priceARS,
      quantity: 1,
    });

    router.push(`/${locale}/checkout/book`);
  }, [author, bookId, coverUrl, locale, priceARS, region?.country, router, title]);

  // Solo mostramos el botón si hay precio configurado directamente en ARS
  if (priceARS == null || priceARS <= 0) {
    return null;
  }

  const defaultLabel = locale === "en" ? "Pre-sale" : "Preventa";
  const label = (presaleButtonLabel && presaleButtonLabel.trim()) || defaultLabel;

  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(priceARS);

  const disabled =
    regionLoading ||
    !region?.country ||
    region.country !== "AR";

  return (
    <div className="mt-6">
      <Button
        type="button"
        onClick={goToCheckout}
        disabled={disabled}
        className="w-full sm:w-auto min-w-[220px] bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 text-base font-medium disabled:opacity-50"
      >
        {`${label} — ${formatted}`}
      </Button>
      {!regionLoading && region?.country && region.country !== "AR" && (
        <p className="text-sm text-amber-800 mt-2">
          {locale === "en"
            ? "Payments for the book are available in Argentina (ARS)."
            : "Los pagos del libro están disponibles en Argentina (ARS)."}
        </p>
      )}
    </div>
  );
}
