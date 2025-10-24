import Image from "next/image";
import { client, urlFor } from "@/lib/sanity";
import { documentariesQuery } from "@/lib/queries";
import VideoModal from "../components/VideoModal";
import { getI18n } from "@/locales/server";

interface Documentary {
  _id: string;
  title: {
    es: string;
    en: string;
  };
  year: number;
  synopsis: {
    es: string;
    en: string;
  };
  trailerUrl?: string;
  poster?: any;
  order: number;
}

interface DocumentariesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function Documentaries({ params }: DocumentariesPageProps) {
  const { locale } = await params;
  const t = await getI18n();
  
  try {
    // Obtener documentales desde Sanity
    const documentaries = await client.fetch(documentariesQuery) as Documentary[];
    
    console.log('🔍 Debug - Documentales obtenidos:', documentaries);
    console.log('🔍 Debug - Locale:', locale);
    
    // Si no hay documentales, mostrar mensaje
    if (!documentaries || documentaries.length === 0) {
      return (
        <div className="min-h-screen pt-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('documentaries.title')}</h1>
            <p className="text-gray-600">
              {t('documentaries.empty')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Los documentales se pueden configurar desde el panel de administración.
            </p>
          </div>
        </div>
        </div>
      );
    }

    return (
      <div className="relative z-20 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 pt-28 pb-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">
              {t('documentaries.title')}
            </h1>

            <div className="space-y-8">
              {documentaries.map((documentary) => {
                const title = documentary.title[locale as keyof typeof documentary.title] || documentary.title.es;
                const synopsis = documentary.synopsis[locale as keyof typeof documentary.synopsis] || documentary.synopsis.es;
                
                return (
                  <div key={documentary._id} className="border-b border-gray-200 pb-8 last:border-b-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Poster */}
                      {documentary.poster && (
                        <div className="lg:col-span-1">
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                            <Image
                              src={urlFor(documentary.poster).width(400).height(600).url()}
                              alt={title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Contenido */}
                      <div className={`${documentary.poster ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        <div className="space-y-4">
                          {/* Título y Año */}
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                              {title}
                            </h2>
                            <p className="text-lg text-gray-600 font-medium">
                              {documentary.year}
                            </p>
                          </div>
                          
                          {/* Sinopsis */}
                          <div>
                            <p className="text-gray-700 leading-relaxed">
                              {synopsis}
                            </p>
                          </div>
                          
                          {/* Trailer */}
                          <div className="pt-2">
                            {documentary.trailerUrl ? (
                              <VideoModal
                                videoUrl={documentary.trailerUrl}
                                title={title}
                              >
                                {t('documentaries.watchTrailer')}
                              </VideoModal>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                {t('documentaries.noTrailer')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Error obteniendo documentales:', error);

    return (
      <div className="min-h-screen pt-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('documentaries.title')}</h1>
            <p className="text-red-600">
              {t('documentaries.error')}
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
