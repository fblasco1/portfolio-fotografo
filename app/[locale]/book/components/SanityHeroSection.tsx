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
    <div className="relative min-h-[50vh] flex flex-col lg:flex-1 lg:min-h-0 lg:shrink bg-gradient-to-b from-stone-50 via-stone-50 to-white">
      <div className="container mx-auto px-4 h-full pt-28 pb-6 md:pt-32 lg:pt-24 lg:pb-3 flex flex-col justify-start lg:justify-center relative z-10 lg:min-h-0 lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-8 lg:gap-10 xl:gap-14 items-start lg:items-center w-full min-h-0">
          <div className="order-2 lg:order-1 max-w-2xl min-w-0">
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
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end lg:pr-2 min-h-0">
              <figure
                className="relative w-[min(240px,72vw)] sm:w-[280px] lg:w-auto lg:h-[min(420px,calc(100dvh-14rem))] xl:h-[min(460px,calc(100dvh-13rem))] aspect-[3/4] bg-stone-200 shrink-0"
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
                  sizes="(max-width: 1024px) 280px, 320px"
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
