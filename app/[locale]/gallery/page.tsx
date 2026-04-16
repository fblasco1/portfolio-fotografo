import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { galleriesQuery } from "@/lib/queries";
import type { SanityGallery } from "../../types/gallery";
import SanityPhotoGallery from "./components/SanityPhotoGallery";
import { getSiteUrl, localePath } from "@/lib/site-url";

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const base = getSiteUrl();
  const canonical = `${base}${localePath(locale, "/gallery")}`;
  const isEs = locale === "es";
  const title = isEs ? "Galería" : "Gallery";
  const description = isEs
    ? "Galerías fotográficas y reportajes visuales de Cristian Pirovano, fotoperiodista. Argentina y Latinoamérica."
    : "Photo galleries and visual reportage by Cristian Pirovano, photojournalist. Argentina and Latin America.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${base}${localePath("en", "/gallery")}`,
        es: `${base}${localePath("es", "/gallery")}`,
        "x-default": `${base}${localePath("en", "/gallery")}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: isEs ? "es_AR" : "en_US",
      type: "website",
    },
  };
}

export default async function Gallery({ params }: GalleryPageProps) {
  const { locale } = await params;
  
  try {
    // Obtener galerías desde Sanity
    const galleries = await client.fetch(galleriesQuery) as SanityGallery[];
    
    
    // Ordenar galerías (ya vienen filtradas por isActive desde la consulta)
    const sortedGalleries = galleries.sort((a, b) => a.order - b.order);


    // Si no hay galerías, mostrar mensaje
    if (!sortedGalleries || sortedGalleries.length === 0) {
      return (
        <div className="min-h-screen pt-32">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Galería</h1>
              <p className="text-gray-600">
                No hay galerías disponibles en este momento.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Las galerías se pueden configurar desde el panel de administración.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <SanityPhotoGallery galleries={sortedGalleries} locale={locale} />
      </div>
    );
  } catch (error) {
    console.error('❌ Error obteniendo galerías:', error);
    
    return (
      <div className="min-h-screen pt-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Galería</h1>
            <p className="text-red-600">
              Error al cargar las galerías. Por favor, intenta de nuevo.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Si el problema persiste, verifica la configuración de Sanity.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
