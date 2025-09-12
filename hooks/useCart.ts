"use client";

import { useState, useEffect } from 'react';
import { useRegion } from './useRegion';
import { getProductPrice } from '@/lib/payment/config';

interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  productType: 'photos' | 'postcards';
  quantity: number;
}

interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { region } = useRegion();

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setItems([]);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Agregar item al carrito
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Remover item del carrito
  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Actualizar cantidad de un item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
  };

  // Calcular totales
  const getTotals = (): CartTotals | null => {
    if (!region || !region.isSupported) {
      return null;
    }

    const subtotal = items.reduce((total, item) => {
      const price = getProductPrice(item.productType, region.currency);
      return total + (price * item.quantity);
    }, 0);

    // Calcular impuestos y envío
    const taxRate = 0.21; // 21% IVA por defecto (Argentina)
    const shippingCost = 10000; // Costo de envío por defecto (Argentina)
    
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost;

    return {
      subtotal,
      tax,
      shipping: shippingCost,
      total
    };
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

  return {
    items,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotals,
    getTotalItems,
    isEmpty,
    getItem,
    hasItem,
    getItemQuantity
  };
}
