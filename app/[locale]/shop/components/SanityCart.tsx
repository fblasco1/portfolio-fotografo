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
import OrderForm from "../../components/OrderForm";

interface CartItem extends SanityProduct {
  quantity: number;
}

interface SanityCartDrawerProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  locale: string;
}

export default function SanityCart({ cart, setCart, locale }: SanityCartDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      }
    };
    return texts[key as keyof typeof texts]?.[locale as keyof typeof texts[key]] || texts[key as keyof typeof texts]?.es;
  };

  return (
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

        {cart.length === 0 ? (
          <p className="text-center text-gray-500">{getText("empty")}</p>
        ) : (
          <ul className="space-y-2">
            {cart.map((item, index) => {
              // Obtener contenido según el idioma
              const content = item.content[locale as keyof typeof item.content] || item.content.es;
              
              return (
                <li
                  key={index}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div className="flex-1">
                    <div className="font-medium">{content.title}</div>
                    <div className="text-sm text-gray-500">${item.price} x {item.quantity}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(index, -1)}
                    >
                      <Minus size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(index, 1)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {cart.length > 0 && (
          <Button
            className="w-full mt-4 bg-green-600 hover:bg-green-400 text-white"
            onClick={() => setShowForm(true)}
          >
            {getText("checkout")}
          </Button>
        )}

        {showForm && (
          <OrderForm
            cart={cart}
            onClose={() => setShowForm(false)}
            setCart={setCart}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
