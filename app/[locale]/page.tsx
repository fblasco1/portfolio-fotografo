import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { settingsQuery } from "@/lib/queries";
import SlideshowClient from "@/app/[locale]/components/page-specific/SlideshowClient";
import { getSiteUrl, localePath } from "@/lib/site-url";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const settings = await client.fetch(settingsQuery);
  const localized =
    settings?.content?.[locale as keyof typeof settings.content] || settings?.content?.es;
  const siteTitle = localized?.siteTitle || "Cristian Pirovano";
  const siteDescription =
    localized?.siteDescription || "Portfolio de Cristian Pirovano, fotoperiodista.";
  const base = getSiteUrl();
  const canonical = `${base}${localePath(locale, "/")}`;

  return {
    title: siteTitle,
    description: siteDescription,
    alternates: {
      canonical,
      languages: {
        en: `${base}${localePath("en", "/")}`,
        es: `${base}${localePath("es", "/")}`,
        "x-default": `${base}${localePath("en", "/")}`,
      },
    },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: canonical,
      locale: locale === "es" ? "es_AR" : "en_US",
      type: "website",
    },
  };
}

export default async function Home() {
  try {
    // Obtener datos desde Sanity de manera segura
    const settings = await client.fetch(settingsQuery);
    const slideshowImages = settings?.homeSlideshow || [];

    return (
      <div className="relative min-h-screen">
        <SlideshowClient images={slideshowImages} />
      </div>
    );
  } catch (error) {
    console.error('❌ Error cargando página principal:', error);
    
    // Fallback en caso de error
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Bienvenido</h1>
            <p className="text-lg">Portfolio de Cristian Pirovano</p>
            <p className="text-sm mt-2">Fotoperiodista</p>
          </div>
        </div>
      </div>
    );
  }
}
