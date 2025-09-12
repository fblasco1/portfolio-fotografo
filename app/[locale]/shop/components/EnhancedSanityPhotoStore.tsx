"use client";

import { useState } from "react";
import type { SanityProduct } from "@/app/types/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EnhancedSanityProductCard from "./EnhancedSanityProductCard";
import EnhancedSanityCart from "./EnhancedSanityCart";
import { useRegion } from "@/hooks/useRegion";
import { CartButton } from "../../../../components/payment";

interface CartItem extends SanityProduct {
  quantity: number;
}

interface EnhancedSanityPhotoStoreProps {
  photos: SanityProduct[];
  postcards: SanityProduct[];
  locale: string;
}

export default function EnhancedSanityPhotoStore({ 
  photos, 
  postcards, 
  locale 
}: EnhancedSanityPhotoStoreProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { region, loading: regionLoading } = useRegion();

  const addToCart = (product: SanityProduct) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item._id === product._id
      );

      if (existingIndex !== -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Textos internacionalizados
  const getTabText = (key: string) => {
    const texts = {
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
    return texts[key as keyof typeof texts]?.[locale as keyof typeof texts[key]] || texts[key as keyof typeof texts]?.es;
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
      {/* Header con información de región y botón de carrito */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getTabText("shopTitle")}
          </h1>
          <p className="text-gray-600 mt-2">
            {getTabText("shopSubtitle")}
          </p>
        </div>
        <CartButton locale={locale} />
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
              <EnhancedSanityProductCard
                key={product._id}
                product={product}
                locale={locale}
                addToCart={addToCart}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="postcards">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {postcards.map((product) => (
              <EnhancedSanityProductCard
                key={product._id}
                product={product}
                locale={locale}
                addToCart={addToCart}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Carrito mejorado */}
      <EnhancedSanityCart cart={cart} setCart={setCart} locale={locale} />
    </div>
  );
}
