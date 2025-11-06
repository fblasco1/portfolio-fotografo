"use client";

import { useState, useEffect } from "react";
import type { SanityProduct } from "@/lib/sanity-products";
import { isTestProduct } from "@/lib/sanity-products";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { ProductCard } from "../../components/common";
import Cart from "./Cart";
import { useRegion } from "@/contexts/RegionContext";
import { RegionSelector } from "../../../../components/payment";
import { getSizePricing } from "@/lib/sanity-pricing";
import { getAvailableSizes } from "@/lib/sanity-products";

interface PhotoStoreProps {
  photos: SanityProduct[];
  postcards: SanityProduct[];
  locale: string;
}

export default function PhotoStore({ 
  photos, 
  postcards, 
  locale 
}: PhotoStoreProps) {
  const { region, loading: regionLoading } = useRegion();
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [productsReady, setProductsReady] = useState(false);

  // Filtrar productos por región y configuración completa
  // Nota: Ahora solo filtramos por características básicas del producto
  // La disponibilidad de tamaños se verifica en tiempo real en cada ProductCard
  const filterProductsForRegion = (products: SanityProduct[]) => {
    if (!region || !region.currency) {
      return [];
    }
    
    const filtered = products.filter(product => {
      // EXCLUIR productos de testing de la tienda
      if (isTestProduct(product)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Producto TEST excluido: ${product.content?.[locale as 'es' | 'en']?.title || product._id}`);
        }
        return false;
      }
      
      // Verificar que tenga configuración completa (título e imagen obligatorios)
      const hasTitle = !!product.content?.[locale as 'es' | 'en']?.title;
      
      if (!hasTitle) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Producto sin título: ${product._id}`);
        }
        return false;
      }
      
      // Validar imagen - verificar múltiples formas de acceso
      // 1. Imagen expandida con URL directa (desde query con asset->)
      // 2. Referencia de imagen (se puede resolver con urlFor)
      // 3. Imagen con asset como referencia (_ref)
      const hasImage = !!(
        product.image?.asset?.url || // URL directa expandida
        product.image?.asset?._ref || // Referencia de asset
        product.image?._type === 'image' || // Objeto de imagen de Sanity
        (product.image && typeof product.image === 'object') // Cualquier objeto de imagen
      );
      
      if (!hasImage) {
        if (process.env.NODE_ENV === 'development') {
          const productTitle = product.content?.[locale as 'es' | 'en']?.title || product._id;
          console.log(`🔍 Producto sin imagen: ${productTitle}`, {
            hasImageObject: !!product.image,
            imageType: typeof product.image,
            hasAsset: !!product.image?.asset,
            hasAssetUrl: !!product.image?.asset?.url,
            hasAssetRef: !!product.image?.asset?._ref,
            imageStructure: product.image ? Object.keys(product.image) : 'no image',
            assetStructure: product.image?.asset ? Object.keys(product.image.asset) : 'no asset',
            fullImageObject: product.image
          });
        }
        return false;
      }
      
      // Verificar que el producto esté marcado como disponible
      if (!product.isAvailable) {
        return false;
      }
      
      return true;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Productos filtrados: ${filtered.length} de ${products.length} totales`);
    }
    return filtered;
  };

  // Cargar precios globales y verificar que todos los productos tengan tamaños disponibles
  useEffect(() => {
    const loadPricingAndPrepareProducts = async () => {
      try {
        // 1. Cargar precios globales (esto puede ser lento, pero ahora está cacheado)
        const globalPricing = await getSizePricing();
        setPricing(globalPricing);
        setPricingLoaded(true);

        // 2. Si hay precios, los tamaños ya se pueden calcular sincrónicamente
        // No necesitamos hacer llamadas adicionales porque getAvailableSizes usa los precios globales
        if (globalPricing) {
          // Los tamaños se calculan directamente desde el pricing, no necesitan carga async adicional
          setProductsReady(true);
        } else {
          // Si no hay precios, marcar como listo igualmente
          setProductsReady(true);
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
        setPricingLoaded(true);
        setProductsReady(true); // Continuar aunque falle
      }
    };

    loadPricingAndPrepareProducts();
  }, [photos, postcards]);

  // Productos filtrados por región
  const availablePhotos = filterProductsForRegion(photos);
  const availablePostcards = filterProductsForRegion(postcards);

  // Mostrar loading hasta que la región, los precios y los productos estén listos
  const isLoading = regionLoading || !pricingLoaded || !productsReady;


  // Textos internacionalizados
  const getTabText = (key: string): string => {
    const texts: Record<string, { es: string; en: string }> = {
      photos: {
        es: "Fotos",
        en: "Photos"
      },
      postcards: {
        es: "Postales",
        en: "Postcards"
      },
      shopTitle: {
        es: "Tienda",
        en: "Shop"
      },
      shopSubtitle: {
        es: "Productos disponibles en tu región",
        en: "Products available in your region"
      },
      regionDetected: {
        es: "Ubicación detectada",
        en: "Location detected"
      },
      regionNotSupported: {
        es: "Región no soportada",
        en: "Unsupported Region"
      },
      regionMessage: {
        es: "Actualmente solo soportamos pagos en Latinoamérica. Por favor selecciona un país de la región para continuar.",
        en: "We currently only support payments in Latin America. Please select a country from the region to continue."
      }
    };
    return texts[key]?.[locale as 'es' | 'en'] || texts[key]?.es || '';
  };

  // Mostrar loading mientras se cargan los precios y la región
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTabText("shopTitle")}
          </h1>
          <p className="text-gray-600">
            {getTabText("shopSubtitle")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mb-4"></div>
          <p className="text-gray-600">
            {locale === 'es' ? 'Cargando productos y precios...' : 'Loading products and prices...'}
          </p>
        </div>
      </div>
    );
  }

  if (!region || !region.isSupported) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="text-center py-12">
          <div className="text-orange-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {getTabText("regionNotSupported")}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {getTabText("regionMessage")}
          </p>
          <div className="max-w-sm mx-auto">
            <RegionSelector />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      {/* Header con información de región */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getTabText("shopTitle")}
        </h1>
        <p className="text-gray-600 mt-2">
          {getTabText("shopSubtitle")}
        </p>
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
          <span>
            📷 {availablePhotos.length} {locale === 'es' ? 'fotos' : 'photos'}
          </span>
          <span>
            📮 {availablePostcards.length} {locale === 'es' ? 'postales' : 'postcards'}
          </span>
        </div>
      </div>

      {/* Información de región */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-center space-x-3">
          <span className="text-blue-600 text-2xl">🌍</span>
          <div>
            <p className="text-sm font-medium text-blue-800">
              {getTabText("regionDetected")}
            </p>
            <p className="text-sm text-blue-600">
              {region.country} • {region.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de productos */}
      <Tabs defaultValue="photos">
        <TabsList className="flex justify-center mb-4 border-b">
          <TabsTrigger
            value="photos"
            className="px-4 pb-2 border-b-2 data-[state=active]:border-black"
          >
            {getTabText("photos")}
          </TabsTrigger>
          <TabsTrigger
            value="postcards"
            className="px-4 pb-2 border-b-2 data-[state=active]:border-black"
          >
            {getTabText("postcards")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          {availablePhotos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {availablePhotos.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  locale={locale}
                  variant="enhanced"
                  pricing={pricing}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📷</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {locale === 'es' ? 'No hay fotos disponibles' : 'No photos available'}
              </h3>
              <p className="text-gray-500">
                {locale === 'es' 
                  ? 'No hay fotos disponibles para tu región en este momento.' 
                  : 'No photos are available for your region at this time.'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="postcards">
          {availablePostcards.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {availablePostcards.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  locale={locale}
                  variant="enhanced"
                  pricing={pricing}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📮</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {locale === 'es' ? 'No hay postales disponibles' : 'No postcards available'}
              </h3>
              <p className="text-gray-500">
                {locale === 'es' 
                  ? 'No hay postales disponibles para tu región en este momento.' 
                  : 'No postcards are available for your region at this time.'
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Carrito */}
      <Cart locale={locale} variant="floating" />
    </div>
  );
}
