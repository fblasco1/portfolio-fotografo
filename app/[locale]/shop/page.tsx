import { client } from "@/lib/sanity";
import { productsQuery } from "@/lib/queries";
import type { SanityProduct } from "@/app/types/store";
import HybridSanityPhotoStore from "./components/HybridSanityPhotoStore";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
}

export default async function StorePage({ params }: ShopPageProps) {
  const { locale } = await params;
  
  try {
    // Obtener productos desde Sanity
    const products = await client.fetch(productsQuery) as SanityProduct[];
    
    console.log('🔍 Debug - Productos obtenidos:', products);
    console.log('🔍 Debug - Locale:', locale);
    
    // Separar productos por tipo
    const photos = products.filter(product => product.category === 'photo');
    const postcards = products.filter(product => product.category === 'postcard');

    console.log('🔍 Debug - Fotos:', photos.length);
    console.log('🔍 Debug - Postales:', postcards.length);

    // Si no hay productos, mostrar mensaje
    if (products.length === 0) {
      return (
        <div className="min-h-screen pt-32">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Tienda</h1>
              <p className="text-gray-600">
                No hay productos disponibles en este momento.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Los productos se pueden configurar desde el panel de administración.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <HybridSanityPhotoStore 
          photos={photos} 
          postcards={postcards} 
          locale={locale} 
        />
      </div>
    );
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    
    return (
      <div className="min-h-screen pt-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tienda</h1>
            <p className="text-red-600">
              Error al cargar los productos. Por favor, intenta de nuevo.
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
