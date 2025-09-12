"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import type { SanityProduct } from "@/app/types/store";
import { CheckoutForm, OrderSummary } from "../../../../components/payment";
import { useRegion } from "@/hooks/useRegion";
import { formatPrice } from "@/lib/payment/region-detector";
import { getProductPrice } from "@/lib/payment/config";

interface CartItem extends SanityProduct {
  quantity: number;
}

interface EnhancedSanityCartProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  locale: string;
}

export default function EnhancedSanityCart({ cart, setCart, locale }: EnhancedSanityCartProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { region, loading: regionLoading } = useRegion();

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;

    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1); // Eliminar si la cantidad es 0
    }

    setCart(newCart);
  };

  // Textos internacionalizados
  const getText = (key: string) => {
    const texts = {
      cartTitle: {
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
    return texts[key as keyof typeof texts]?.[locale as keyof typeof texts[key]] || texts[key as keyof typeof texts]?.es;
  };

  // Convertir items del carrito al formato esperado por CheckoutForm
  const convertCartItems = () => {
    return cart.map(item => {
      const content = item.content[locale as keyof typeof item.content] || item.content.es;
      return {
        id: item._id,
        title: content.title,
        subtitle: content.subtitle,
        image: item.image ? item.image.asset?.url || "/placeholder.svg" : "/placeholder.svg",
        productType: item.category as 'photos' | 'postcards',
        quantity: item.quantity
      };
    });
  };

  const handleCheckout = () => {
    if (!region || !region.isSupported) {
      alert(getText("regionMessage"));
      return;
    }
    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-white hover:bg-stone shadow-lg flex items-center justify-center"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </Button>
        </DrawerTrigger>
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
                  const content = item.content[locale as keyof typeof item.content] || item.content.es;
                  const price = getProductPrice(item.category as 'photos' | 'postcards', region.currency);
                  
                  return (
                    <li
                      key={index}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <img
                        src={item.image?.asset?.url || "/placeholder.svg"}
                        alt={content.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {content.title}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {content.subtitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPrice(price, region.currency, region.symbol)} x {item.quantity}
                        </div>
                      </div>
                      
                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(index, -1)}
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
                          onClick={() => updateQuantity(index, 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Resumen de pedido */}
              <OrderSummary
                items={convertCartItems()}
                locale={locale}
                showCheckoutButton={true}
                onCheckout={handleCheckout}
              />
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Formulario de checkout */}
      {showCheckout && (
        <CheckoutForm
          items={convertCartItems()}
          onClose={handleCloseCheckout}
          locale={locale}
        />
      )}
    </>
  );
}
