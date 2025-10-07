import { getProducts, isSanityConfigured } from "@/lib/sanity";
import type { SanityProduct } from "@/app/types/store";
import EnhancedSanityPhotoStore from "./components/EnhancedSanityPhotoStore";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
}

export default async function StorePage({ params }: ShopPageProps) {
  const { locale } = await params;
  
  try {
    // Obtener productos de manera segura
    const products = await getProducts() as SanityProduct[];
    
    // Separar productos por tipo
    const photos = products.filter(product => product.category === 'photo');
    const postcards = products.filter(product => product.category === 'postcard');

    // Mostrar mensaje si Sanity no está configurado
    if (!isSanityConfigured()) {
      return (
        <div className="min-h-screen pt-32">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Tienda</h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  Modo Demo
                </h2>
                <p className="text-yellow-700 mb-4">
                  Sanity no está configurado. Mostrando productos de ejemplo.
                </p>
                <p className="text-sm text-yellow-600">
                  Para configurar Sanity, agrega las variables de entorno:
                  <br />
                  <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                    NEXT_PUBLIC_SANITY_PROJECT_ID
                  </code>
                  <br />
                  <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                    NEXT_PUBLIC_SANITY_DATASET
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
        <EnhancedSanityPhotoStore 
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
