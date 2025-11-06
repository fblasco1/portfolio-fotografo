"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/[locale]/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { formatPrice } from "@/lib/payment/region-detector";
import { getSizePricing, getPriceUSDForSize } from "@/lib/sanity-pricing";
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
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Cargar precios convertidos para cada item
  useEffect(() => {
    const loadPrices = async () => {
      if (!region || !region.isSupported) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const priceMap: Record<string, number> = {};

      try {
        // Cargar configuración de precios una sola vez
        const pricing = await getSizePricing();
        
        if (!pricing) {
          // Si no hay precios, marcar todos como 0
          items.forEach(item => {
            priceMap[generateItemId(item.id, item.size)] = 0;
          });
        } else {
          // Convertir precios para cada item
          const { convertUSDToLocal } = await import('@/lib/currency-converter');
          
          for (const item of items) {
            if (item.size === 'custom') {
              priceMap[generateItemId(item.id, item.size)] = 0;
              continue;
            }

            try {
              const priceUSD = getPriceUSDForSize(pricing, item.size);
              if (priceUSD > 0) {
                // Convertir a moneda local
                const converted = await convertUSDToLocal(
                  priceUSD,
                  region.currency,
                  region.country
                );
                priceMap[generateItemId(item.id, item.size)] = converted;
              } else {
                priceMap[generateItemId(item.id, item.size)] = 0;
              }
            } catch (error) {
              console.error(`Error converting price for item ${item.id}:`, error);
              priceMap[generateItemId(item.id, item.size)] = 0;
            }
          }
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
        // En caso de error, marcar todos como 0
        items.forEach(item => {
          priceMap[generateItemId(item.id, item.size)] = 0;
        });
      }

      setPrices(priceMap);
      setLoading(false);
    };

    loadPrices();
  }, [items, region, generateItemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600"></div>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const itemId = generateItemId(item.id, item.size);
        const price = prices[itemId] || 0;
        const total = price * item.quantity;

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
              <div className="text-sm font-semibold text-gray-700 mt-1">
                {region && price > 0 ? (
                  <>
                    {formatPrice(price, region.currency, region.symbol)} x {item.quantity} = {formatPrice(total, region.currency, region.symbol)}
                  </>
                ) : item.size === 'custom' ? (
                  <span className="text-gray-500">
                    {locale === 'es' ? 'Cotizar' : 'Quote'}
                  </span>
                ) : (
                  `$${price} x ${item.quantity}`
                )}
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
