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
    <section className="bg-white pt-24 pb-10 md:pt-28 md:pb-12 lg:pt-28 lg:pb-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:gap-10 xl:gap-12">
          <div className="order-2 w-full max-w-xl lg:order-1 lg:flex-1 lg:pt-2">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-4xl lg:text-3xl">
              {content.title}
            </h1>
            <h2 className="mt-1 mb-4 text-md text-stone-600 md:text-lg lg:mb-3 lg:text-base">
              {content.author}
            </h2>
            <p className="text-base leading-relaxed text-stone-800 md:text-lg lg:text-base">
              {content.description}
            </p>
          </div>

          {coverImageUrl && (
            <div className="order-1 shrink-0 lg:order-2">
              <figure
                className="relative aspect-[3/4] w-[min(260px,72vw)] sm:w-[280px] lg:w-[280px] xl:w-[300px] bg-stone-100"
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
                  sizes="300px"
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
    </section>
  );
}
