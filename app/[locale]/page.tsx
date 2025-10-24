import { client } from "@/lib/sanity";
import { settingsQuery } from "@/lib/queries";
import SlideshowClient from "@/app/[locale]/components/page-specific/SlideshowClient";

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
