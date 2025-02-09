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
import { useScopedI18n } from "@/locales/client";
import type { StoreItem } from "@/app/types/store";
import OrderForm from "./OrderForm";

export interface CartItem extends StoreItem {
  quantity: number;
}

interface CartDrawerProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

export default function Cart({ cart, setCart }: CartDrawerProps) {
  const t = useScopedI18n("shop");
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
          <DrawerTitle>{t("cart.title")}</DrawerTitle>
          <Button variant="ghost" onClick={() => setIsDrawerOpen(false)}>
            <X size={24} />
          </Button>
        </div>

        {cart.length === 0 ? (
          <p className="text-center text-gray-500">{t("cart.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {cart.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b py-2"
              >
                <span>
                  {t(item.titleKey)} (x{item.quantity})
                </span>
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
            ))}
          </ul>
        )}

        {cart.length > 0 && (
          <Button
            className="w-full mt-4 bg-green-600 hover:bg-green-400 text-white"
            onClick={() => setShowForm(true)}
          >
            {t("cart.checkout")}
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
