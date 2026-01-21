"use client";

import { useState } from "react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { RegionInfo } from "@/lib/payment/region-detector";
import type { ProductSize } from "@/contexts/CartContext";

interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  productType: 'photos' | 'postcards';
  quantity: number;
  size: ProductSize;
}

interface CartItemListProps {
  items: CartItem[];
  region: RegionInfo | null;
  locale: string;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  generateItemId: (productId: string, size: ProductSize) => string;
  getSizeLabel: (size: ProductSize) => string;
}

export default function CartItemList({
  items,
  region,
  locale,
  onUpdateQuantity,
  onRemoveItem,
  generateItemId,
  getSizeLabel
}: CartItemListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        // Generar ID único para la key: usar itemId si tiene tamaño, sino usar índice para evitar duplicados
        const itemId = item.size ? generateItemId(item.id, item.size) : `${item.id}_${index}`;

        return (
          <li
            key={itemId}
            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {item.title}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {item.subtitle}
              </div>
              <div className="text-sm text-gray-500">
                {getSizeLabel(item.size)}
              </div>
            </div>
            
            {/* Controles de cantidad */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(itemId, -1)}
                className="w-8 h-8 p-0"
              >
                <Minus size={14} />
              </Button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(itemId, 1)}
                className="w-8 h-8 p-0"
              >
                <Plus size={14} />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
