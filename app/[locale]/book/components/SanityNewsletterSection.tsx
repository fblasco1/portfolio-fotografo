"use client";

import SanityNewsletterForm from "./SanityNewsletterForm";
import BookPresaleButton from "./BookPresaleButton";

interface SanityBookData {
  _id: string;
  presalePriceUSD?: number | null;
  coverImage?: unknown;
  content: {
    es: {
      comingSoon: string;
      availability: string;
      emailPlaceholder: string;
      subscribe: string;
      title: string;
      author: string;
      presaleButton?: string | null;
    };
    en: {
      comingSoon: string;
      availability: string;
      emailPlaceholder: string;
      subscribe: string;
      title: string;
      author: string;
      presaleButton?: string | null;
    };
  };
}

interface SanityNewsletterSectionProps {
  bookData: SanityBookData;
  locale: string;
}

export default function SanityNewsletterSection({ bookData, locale }: SanityNewsletterSectionProps) {
  // Obtener contenido según el idioma
  const content = bookData.content[locale as keyof typeof bookData.content] || bookData.content.es;

  return (
    <section className="py-6 lg:py-4 lg:shrink-0">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-stone-100 rounded-lg text-center p-4 lg:p-4">
            <h3 className="text-xl lg:text-lg font-semibold mb-2 lg:mb-1">{content.comingSoon}</h3>
            <p className="text-base lg:text-sm text-gray-700">{content.availability}</p>
            <BookPresaleButton
              bookId={bookData._id}
              locale={locale}
              title={content.title}
              author={content.author}
              coverImage={bookData.coverImage}
              presalePriceUSD={bookData.presalePriceUSD}
              presaleButtonLabel={content.presaleButton}
            />
          </div>
          <div className="mt-6 lg:mt-4 text-center">
            <SanityNewsletterForm
              placeholder={content.emailPlaceholder}
              buttonText={content.subscribe}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
