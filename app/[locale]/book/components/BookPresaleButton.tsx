"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegion } from "@/contexts/RegionContext";
import { convertUSDToLocal } from "@/lib/currency-converter";
import { saveBookCheckoutSession } from "@/lib/book-checkout-session";
import { urlFor } from "@/lib/sanity";
import { Button } from "@/app/[locale]/components/ui/button";

type BookPresaleButtonProps = {
  bookId: string;
  locale: string;
  title: string;
  author: string;
  coverImage?: unknown;
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
  presalePriceUSD,
  presaleButtonLabel,
}: BookPresaleButtonProps) {
  const router = useRouter();
  const { region, loading: regionLoading } = useRegion();
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);

  const coverUrl =
    coverImage && typeof coverImage === "object"
      ? urlFor(coverImage as any).width(400).height(560).fit("crop").url()
      : "";

  useEffect(() => {
    if (
      presalePriceUSD == null ||
      presalePriceUSD <= 0 ||
      !region?.isSupported ||
      !region.currency
    ) {
      setConvertedPrice(null);
      return;
    }

    let cancelled = false;
    setConverting(true);
    convertUSDToLocal(presalePriceUSD, region.currency, region.country)
      .then((v) => {
        if (!cancelled) setConvertedPrice(v);
      })
      .catch(() => {
        if (!cancelled) setConvertedPrice(null);
      })
      .finally(() => {
        if (!cancelled) setConverting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [presalePriceUSD, region?.currency, region?.country, region?.isSupported]);

  const goToCheckout = useCallback(() => {
    if (convertedPrice == null || convertedPrice <= 0) return;

    saveBookCheckoutSession({
      bookId,
      title,
      subtitle: author,
      image: coverUrl || BOOK_IMG_FALLBACK,
      unitPriceLocal: convertedPrice,
      quantity: 1,
    });

    router.push(`/${locale}/checkout/book`);
  }, [author, bookId, convertedPrice, coverUrl, locale, router, title]);

  if (presalePriceUSD == null || presalePriceUSD <= 0) {
    return null;
  }

  const defaultLabel = locale === "en" ? "Pre-sale" : "Preventa";
  const label = (presaleButtonLabel && presaleButtonLabel.trim()) || defaultLabel;

  const formatted =
    convertedPrice != null && region?.currency
      ? new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR", {
          style: "currency",
          currency: region.currency,
        }).format(convertedPrice)
      : null;

  const disabled =
    regionLoading ||
    !region?.isSupported ||
    converting ||
    convertedPrice == null ||
    convertedPrice <= 0;

  return (
    <div className="mt-6">
      <Button
        type="button"
        onClick={goToCheckout}
        disabled={disabled}
        className="w-full sm:w-auto min-w-[220px] bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 text-base font-medium disabled:opacity-50"
      >
        {converting || convertedPrice == null
          ? locale === "en"
            ? "Loading price…"
            : "Cargando precio…"
          : `${label} — ${formatted}`}
      </Button>
      {!region?.isSupported && !regionLoading && (
        <p className="text-sm text-amber-800 mt-2">
          {locale === "en"
            ? "Select a supported country in Latin America to see the price and pay."
            : "Selecciona un país de Latinoamérica soportado para ver el precio y pagar."}
        </p>
      )}
    </div>
  );
}
