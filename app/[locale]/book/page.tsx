import { client } from "@/lib/sanity";
import { bookQuery } from "@/lib/queries";
import SanityHeroSection from "./components/SanityHeroSection";
import SanityNewsletterSection from "./components/SanityNewsletterSection";

interface BookPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BookLanding({ params }: BookPageProps) {
  const { locale } = await params;

  try {
    // Obtener datos del libro desde Sanity
    const bookData = await client.fetch(bookQuery);


    if (!bookData) {
      return (
        <div className="flex-1 flex flex-col pt-32">
          <div className="container mx-auto px-4 flex-1">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Libro</h1>
              <p className="text-gray-600">
                No hay información del libro disponible en este momento.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                La información del libro se puede configurar desde el panel de administración.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <main className="flex-1 flex flex-col">
        <SanityHeroSection bookData={bookData} locale={locale} />
        <SanityNewsletterSection bookData={bookData} locale={locale} />
      </main>
    );
  } catch (error) {
    console.error('❌ Error obteniendo datos del libro:', error);

    return (
      <div className="flex-1 flex flex-col pt-32">
        <div className="container mx-auto px-4 flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Libro</h1>
            <p className="text-red-600">
              Error al cargar la información del libro. Por favor, intenta de nuevo.
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
