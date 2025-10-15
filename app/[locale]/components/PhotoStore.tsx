"use client";

import type { StoreItem } from "@/app/types/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/[locale]/components/ui/tabs";
import { useScopedI18n } from "@/locales/client";
import ProductCard from "./ProductCard";
import Cart from "@/app/[locale]/shop/components/Cart";
import { AddToCartButton } from "@/components/payment";

interface Products {
  photos: StoreItem[];
  postcards: StoreItem[];
}

export default function PhotoStore({ items }: { items: Products }) {
  const t = useScopedI18n("shop");

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
                locale="es"
                productType="photos"
                variant="basic"
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
                locale="es"
                productType="postcards"
                variant="basic"
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Carrito */}
      <Cart locale="es" variant="floating" />
    </div>
  );
}
