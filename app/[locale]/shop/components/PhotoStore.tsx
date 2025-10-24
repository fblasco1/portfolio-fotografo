"use client";

import type { SanityProduct } from "@/lib/sanity-products";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import ProductCard from "../../components/common/ProductCard";
import Cart from "./Cart";
import { useRegion } from "@/contexts/RegionContext";
import { RegionSelector } from "../../../../components/payment";

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

  if (regionLoading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600"></div>
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
              {region.country} • {region.currency} • Mercado Pago
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {photos.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                locale={locale}
                variant="enhanced"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="postcards">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {postcards.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                locale={locale}
                variant="enhanced"
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Carrito */}
      <Cart locale={locale} variant="floating" />
    </div>
  );
}
