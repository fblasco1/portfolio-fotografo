"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface SanityBookData {
  coverImage?: any;
  content: {
    es: {
      title: string;
      author: string;
      description: string;
    };
    en: {
      title: string;
      author: string;
      description: string;
    };
  };
}

interface SanityHeroSectionProps {
  bookData: SanityBookData;
  locale: string;
}

export default function SanityHeroSection({ bookData, locale }: SanityHeroSectionProps) {
  const content = bookData.content[locale as keyof typeof bookData.content] || bookData.content.es;

  const coverImageUrl = bookData.coverImage
    ? urlFor(bookData.coverImage).width(720).height(1000).fit("crop").url()
    : null;

  return (
    <div className="relative flex flex-col lg:flex-1 lg:min-h-0 lg:shrink bg-gradient-to-b from-stone-50 via-stone-50 to-white">
      {/* pt >= header fijo (h-16) + aire; sin centrado vertical para que la tapa no suba bajo el header */}
      <div className="container mx-auto px-4 pt-24 pb-8 md:pt-28 lg:pt-28 lg:pb-4 flex flex-col justify-start relative z-10 lg:min-h-0 lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_auto] gap-8 lg:gap-12 xl:gap-16 items-start w-full">
          <div className="order-2 lg:order-1 max-w-2xl min-w-0 pt-1">
            <h1 className="text-2xl md:text-4xl lg:text-3xl font-bold text-stone-900 tracking-tight">
              {content.title}
            </h1>
            <h2 className="text-md md:text-lg lg:text-base mt-1 mb-4 lg:mb-3 text-stone-600">
              {content.author}
            </h2>
            <p className="text-base md:text-lg lg:text-sm text-stone-800 leading-relaxed lg:line-clamp-6">
              {content.description}
            </p>
          </div>

          {coverImageUrl && (
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <figure
                className="relative w-[min(240px,72vw)] sm:w-[260px] lg:w-[240px] xl:w-[260px] aspect-[3/4] max-h-[min(360px,calc(100dvh-16rem))] bg-stone-200"
                style={{
                  boxShadow:
                    "0 2px 4px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.18), 0 28px 56px -12px rgba(0,0,0,0.28), 8px 12px 24px -8px rgba(0,0,0,0.2)",
                }}
              >
                <Image
                  src={coverImageUrl}
                  alt={`Tapa: ${content.title}`}
                  fill
                  className="object-cover"
                  sizes="260px"
                  priority
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 w-[3px] bg-gradient-to-l from-black/25 to-transparent"
                />
              </figure>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
