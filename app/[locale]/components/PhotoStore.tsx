"use client";

import { useState } from "react";
import type { StoreItem } from "@/app/types/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useScopedI18n } from "@/locales/client";
import ProductCard from "./ProductCard";
import Cart from "./Cart";

interface CartItem extends StoreItem {
  quantity: number;
}

interface Products {
  photos: StoreItem[];
  postcards: StoreItem[];
}

export default function PhotoStore({ items }: { items: Products }) {
  const t = useScopedI18n("shop");
  const [cart, setCart] = useState<StoreItem[]>([]);

  const addToCart = (product: StoreItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id
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

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <Tabs defaultValue="photos">
        <TabsList className="flex justify-center mb-4 border-b">
          <TabsTrigger
            value="photos"
            className="px-4 pb-2 border-b-2 data-[state=active]:border-black"
          >
            {t("tabs.photos")}
          </TabsTrigger>
          <TabsTrigger
            value="postcards"
            className="px-4 pb-2 border-b-2 data-[state=active]:border-black"
          >
            {t("tabs.postcards")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {items.photos.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                t={t}
                addToCart={addToCart}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="postcards">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {items.postcards.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                t={t}
                addToCart={addToCart}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Carrito */}
      <Cart cart={cart} setCart={setCart} />
    </div>
  );
}
