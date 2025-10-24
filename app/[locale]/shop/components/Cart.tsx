"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "../../components/ui/drawer";
import { Button } from "../../components/ui/button";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { useRegion } from "@/contexts/RegionContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/payment/region-detector";
import { getProductPrice } from "@/lib/payment/config";

interface CartProps {
  locale: string;
  className?: string;
  variant?: 'button' | 'floating';
}

export default function Cart({ 
  locale, 
  className = '',
  variant = 'floating'
}: CartProps) {
  const { region, loading: regionLoading } = useRegion();
  const { 
    items: cart, 
    isOpen: isDrawerOpen, 
    setIsOpen: setIsDrawerOpen,
    removeItem,
    updateQuantity,
    getTotalItems
  } = useCart();

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const item = cart.find(item => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        removeItem(itemId);
      } else {
        updateQuantity(itemId, newQuantity);
      }
    }
  };

  // Textos internacionalizados
  const getText = (key: string) => {
    const texts: Record<string, { es: string; en: string }> = {
      cartTitle: {
        es: "Carrito",
        en: "Cart"
      },
      cart: {
        es: "Carrito",
        en: "Cart"
      },
      empty: {
        es: "El carrito está vacío",
        en: "Cart is empty"
      },
      checkout: {
        es: "Finalizar Compra",
        en: "Checkout"
      },
      regionNotSupported: {
        es: "Región no soportada",
        en: "Unsupported Region"
      },
      regionMessage: {
        es: "Solo soportamos pagos en Latinoamérica",
        en: "We only support payments in Latin America"
      }
    };
    return texts[key]?.[locale as 'es' | 'en'] || texts[key]?.es;
  };

  const totalItems = getTotalItems();
  const isDisabled = regionLoading || !region || !region.isSupported;

  // Renderizar botón de carrito
  const renderCartButton = () => {
    if (variant === 'button') {
      return (
        <Button
          onClick={() => setIsDrawerOpen(true)}
          disabled={isDisabled}
          className={`relative inline-flex items-center space-x-2 px-4 py-2 bg-stone-600 text-white rounded-md hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        >
          <ShoppingCart size={20} />
          <span className="hidden sm:inline">
            {getText("cart")}
          </span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </Button>
      );
    }

    // Variante flotante (por defecto)
    return (
      <Button
        variant="outline"
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full bg-white hover:bg-stone-50 shadow-lg flex items-center justify-center ${className}`}
        onClick={() => setIsDrawerOpen(true)}
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Button>
    );
  };

  return (
    <>
      {renderCartButton()}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <DrawerTitle>{getText("cartTitle")}</DrawerTitle>
            <Button variant="ghost" onClick={() => setIsDrawerOpen(false)}>
              <X size={24} />
            </Button>
          </div>

          {regionLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600"></div>
            </div>
          ) : !region || !region.isSupported ? (
            <div className="text-center py-8">
              <div className="text-orange-600 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getText("regionNotSupported")}
              </h3>
              <p className="text-gray-600 mb-4">
                {getText("regionMessage")}
              </p>
            </div>
          ) : cart.length === 0 ? (
            <p className="text-center text-gray-500">{getText("empty")}</p>
          ) : (
            <div className="space-y-4">
              {/* Items del carrito */}
              <ul className="space-y-3">
                {cart.map((item, index) => {
                  const price = region && region.currency && item.productType 
                    ? getProductPrice(item.productType, region.currency, item.pricing) 
                    : 0;
                  
                  return (
                    <li
                      key={index}
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
                          {region ? formatPrice(price, region.currency, region.symbol) : `$${price}`} x {item.quantity}
                        </div>
                      </div>
                      
                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
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
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Botón de finalizar compra */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    console.log('Navegando a checkout...');
                    // Navegar a página de checkout
                    window.location.href = `/${locale}/checkout`;
                  }}
                  className="w-full bg-stone-600 hover:bg-stone-700 text-white"
                  size="lg"
                >
                  {locale === 'es' ? 'Finalizar Compra' : 'Checkout'}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
