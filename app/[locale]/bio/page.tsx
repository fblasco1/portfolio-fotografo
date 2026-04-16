import type { Metadata } from "next";
import Image from "next/image";
import { client, urlFor } from "@/lib/sanity";
import { bioQuery } from "@/lib/queries";
import { getSiteUrl, localePath } from "@/lib/site-url";
import { sitePersonId, siteWebsiteId } from "@/lib/aeo-site-entity";

interface BioPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BioPageProps): Promise<Metadata> {
  const { locale } = await params;
  const bio = await client.fetch(bioQuery);
  const content = bio?.content?.[locale as keyof typeof bio.content] || bio?.content?.es;
  const title = content?.title || "Acerca de Cristian Pirovano";
  const base = getSiteUrl();
  const canonical = `${base}${localePath(locale, "/bio")}`;
  const first = content?.paragraphs?.[0];
  const description =
    (typeof first === "string" && first.slice(0, 155)) ||
    (locale === "es"
      ? "Biografía y trayectoria de Cristian Pirovano, fotoperiodista."
      : "Biography and work of Cristian Pirovano, photojournalist.");

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${base}${localePath("en", "/bio")}`,
        es: `${base}${localePath("es", "/bio")}`,
        "x-default": `${base}${localePath("en", "/bio")}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: locale === "es" ? "es_AR" : "en_US",
      type: "website",
    },
  };
}

export default async function Bio({ params }: BioPageProps) {
  const { locale } = await params;

  const bio = await client.fetch(bioQuery);

  const content = bio?.content?.[locale as keyof typeof bio.content] || bio?.content?.es;

  const title = content?.title || "Acerca de Cristian Pirovano";
  const paragraphs = content?.paragraphs || [];

  const baseUrl = getSiteUrl();
  const canonical = `${baseUrl}${localePath(locale, "/bio")}`;
  let primaryImage: string | undefined;
  if (bio?.profileImage) {
    try {
      primaryImage = urlFor(bio.profileImage).width(1200).height(630).fit("crop").url();
    } catch {
      primaryImage = undefined;
    }
  }

  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    inLanguage: locale === "es" ? "es-AR" : "en-US",
    isPartOf: { "@id": siteWebsiteId(baseUrl) },
    about: { "@id": sitePersonId(baseUrl) },
    ...(primaryImage ? { primaryImageOfPage: { "@type": "ImageObject", url: primaryImage } } : {}),
  };

  const displayName = "Cristian Pirovano";
  const imageAlt =
    locale === "es"
      ? `Retrato de ${displayName}, fotoperiodista`
      : `Portrait of ${displayName}, photojournalist`;

  return (
    <div className="relative z-20 flex-1 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <article className="px-4 sm:px-6 lg:px-8 pt-28 pb-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">
            {title}
          </h1>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex justify-center">
              <Image
                src={urlFor(bio.profileImage).url()}
                alt={imageAlt}
                width={400}
                height={150}
                className="rounded-lg shadow-md h-auto object-cover"
              />
            </div>
            <div className="space-y-4 text-gray-700 text-sm sm:text-base">
              {paragraphs.map((paragraph: string, index: number) => (
                <p key={index} className={index === paragraphs.length - 1 ? "mt-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
