"use client";

import SanityNewsletterForm from "./SanityNewsletterForm";

interface SanityBookData {
  content: {
    es: {
      comingSoon: string;
      availability: string;
      emailPlaceholder: string;
      subscribe: string;
    };
    en: {
      comingSoon: string;
      availability: string;
      emailPlaceholder: string;
      subscribe: string;
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
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-stone-100 rounded-lg text-center p-6">
            <h3 className="text-2xl font-semibold mb-4">{content.comingSoon}</h3>
            <p className="text-lg text-gray-700">{content.availability}</p>
          </div>
          <div className="mt-8 text-center">
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
