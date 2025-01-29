"use client";

import { useState } from "react";
import type { StoreItem } from "@/types/store";
import ProductCard from "./ProductCard";
import Cart from "./Cart";

interface PhotoStoreProps {
  items: StoreItem[];
}

export default function PhotoStore({ items }: PhotoStoreProps) {
  const [cartItems, setCartItems] = useState<StoreItem[]>([]);

  const addToCart = (item: StoreItem) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    // Implement checkout logic here
    console.log("Proceeding to checkout with items:", cartItems);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {cartItems.length > 0 && (
        <Cart
          items={cartItems}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}
