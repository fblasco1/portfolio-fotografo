"use client";

import { useState } from "react";
import type { SanityProduct } from "@/app/types/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SanityPhotoStore from "./SanityPhotoStore";
import EnhancedSanityPhotoStore from "./EnhancedSanityPhotoStore";
import CartMigration from "./CartMigration";

interface CartItem extends SanityProduct {
  quantity: number;
}

interface HybridSanityPhotoStoreProps {
  photos: SanityProduct[];
  postcards: SanityProduct[];
  locale: string;
}

export default function HybridSanityPhotoStore({ 
  photos, 
  postcards, 
  locale 
}: HybridSanityPhotoStoreProps) {
  const [useEnhancedCart, setUseEnhancedCart] = useState(true);

  const handleToggleCart = (useEnhanced: boolean) => {
    setUseEnhancedCart(useEnhanced);
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      {/* Componente de migración */}
      <CartMigration
        locale={locale}
        onToggle={handleToggleCart}
        useEnhanced={useEnhancedCart}
      />

      {/* Renderizar el sistema de carrito seleccionado */}
      {useEnhancedCart ? (
        <EnhancedSanityPhotoStore
          photos={photos}
          postcards={postcards}
          locale={locale}
        />
      ) : (
        <SanityPhotoStore
          photos={photos}
          postcards={postcards}
          locale={locale}
        />
      )}
    </div>
  );
}
