"use client";

import { useState } from "react";
import type { SanityProduct } from "@/app/types/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SanityProductCard from "./SanityProductCard";
import SanityCart from "./SanityCart";

interface CartItem extends SanityProduct {
  quantity: number;
}

interface SanityPhotoStoreProps {
  photos: SanityProduct[];
  postcards: SanityProduct[];
  locale: string;
}

export default function SanityPhotoStore({ photos, postcards, locale }: SanityPhotoStoreProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

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
      }
    };
    return texts[key as keyof typeof texts]?.[locale as keyof typeof texts[key]] || texts[key as keyof typeof texts]?.es;
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
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
              <SanityProductCard
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
              <SanityProductCard
                key={product._id}
                product={product}
                locale={locale}
                addToCart={addToCart}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Carrito */}
      <SanityCart cart={cart} setCart={setCart} locale={locale} />
    </div>
  );
}
