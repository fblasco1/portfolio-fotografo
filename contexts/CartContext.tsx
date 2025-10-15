"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRegion } from './RegionContext';
import { getProductPrice } from '@/lib/payment/config';

interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  productType: 'photos' | 'postcards';
  quantity: number;
  pricing?: any; // Precios por región desde Sanity
}

interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearCartAfterPurchase: () => void;
  getTotals: () => CartTotals | null;
  getTotalItems: () => number;
  isEmpty: boolean;
  getItem: (itemId: string) => CartItem | undefined;
  hasItem: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { region } = useRegion();

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Validar que el carrito tenga la estructura correcta
          if (Array.isArray(parsedCart)) {
            setItems(parsedCart);
            console.log('🛒 Carrito cargado desde localStorage:', parsedCart.length, 'items');
          } else {
            console.warn('Formato de carrito inválido, iniciando carrito vacío');
            setItems([]);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setItems([]);
        // Limpiar localStorage corrupto
        localStorage.removeItem('cart');
      }
    };

    loadCartFromStorage();
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (items.length > 0 || localStorage.getItem('cart')) {
      try {
        localStorage.setItem('cart', JSON.stringify(items));
        console.log('🛒 Carrito guardado en localStorage:', items.length, 'items');
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items]);

  // Agregar item al carrito
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      
      if (existingItem) {
        return currentItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...currentItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Remover item del carrito
  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  // Actualizar cantidad de un item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
    console.log('🛒 Carrito limpiado completamente');
  };

  // Limpiar carrito después de compra exitosa
  const clearCartAfterPurchase = () => {
    clearCart();
    console.log('✅ Carrito limpiado después de compra exitosa');
  };

  // Calcular totales (sin envío ni IVA - se acordará con el vendedor)
  const getTotals = (): CartTotals | null => {
    if (!region || !region.isSupported) {
      return null;
    }

    const subtotal = items.reduce((total, item) => {
      const price = getProductPrice(item.productType, region.currency, item.pricing);
      return total + (price * item.quantity);
    }, 0);

    // Solo subtotal - envío e IVA se acordarán con el vendedor
    return {
      subtotal,
      tax: 0,
      shipping: 0,
      total: subtotal
    };
  };

  // Obtener tasa de impuestos según la moneda
  const getTaxRate = (currency: string): number => {
    const taxRates: Record<string, number> = {
      ARS: 0.21, // 21% IVA en Argentina
      BRL: 0.17, // 17% ICMS en Brasil
      CLP: 0.19, // 19% IVA en Chile
      COP: 0.19, // 19% IVA en Colombia
      MXN: 0.16, // 16% IVA en México
      PEN: 0.18, // 18% IGV en Perú
      UYU: 0.22  // 22% IVA en Uruguay
    };
    return taxRates[currency] || 0;
  };

  // Obtener costo de envío según la moneda
  const getShippingCost = (currency: string): number => {
    const shippingCosts: Record<string, number> = {
      ARS: 10000,
      BRL: 50,
      CLP: 9500,
      COP: 40000,
      MXN: 180,
      PEN: 37,
      UYU: 400
    };
    return shippingCosts[currency] || 0;
  };

  // Obtener cantidad total de items
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Verificar si el carrito está vacío
  const isEmpty = items.length === 0;

  // Obtener item por ID
  const getItem = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  // Verificar si un item está en el carrito
  const hasItem = (itemId: string) => {
    return items.some(item => item.id === itemId);
  };

  // Obtener cantidad de un item específico
  const getItemQuantity = (itemId: string) => {
    const item = getItem(itemId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearCartAfterPurchase,
        getTotals,
        getTotalItems,
        isEmpty,
        getItem,
        hasItem,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}

