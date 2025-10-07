"use client";

import { useState, useEffect } from 'react';
import { useRegion } from './useRegion';
import { getProductPrice } from '@/lib/payment/config';

// Crear un singleton del carrito para evitar múltiples instancias
let globalCartState: CartItem[] = [];
let globalListeners: Array<(items: CartItem[]) => void> = [];

const notifyListeners = () => {
  globalListeners.forEach(listener => listener(globalCartState));
};

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

export function useCart() {
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
            globalCartState = parsedCart;
            setItems(parsedCart);
            console.log('🛒 Carrito cargado desde localStorage:', parsedCart.length, 'items');
          } else {
            console.warn('Formato de carrito inválido, iniciando carrito vacío');
            globalCartState = [];
            setItems([]);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        globalCartState = [];
        setItems([]);
        // Limpiar localStorage corrupto
        localStorage.removeItem('cart');
      }
    };

    loadCartFromStorage();
  }, []);

  // Sincronizar con el estado global
  useEffect(() => {
    const interval = setInterval(() => {
      if (JSON.stringify(globalCartState) !== JSON.stringify(items)) {
        setItems([...globalCartState]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [items]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      console.log('🛒 Carrito guardado en localStorage:', items.length, 'items');
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  // Agregar item al carrito
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    const existingItem = globalCartState.find(i => i.id === item.id);
    
    if (existingItem) {
      globalCartState = globalCartState.map(i =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    } else {
      globalCartState = [...globalCartState, { ...item, quantity: 1 }];
    }
    
    setItems([...globalCartState]);
  };

  // Remover item del carrito
  const removeItem = (itemId: string) => {
    globalCartState = globalCartState.filter(item => item.id !== itemId);
    setItems([...globalCartState]);
  };

  // Actualizar cantidad de un item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    globalCartState = globalCartState.map(item =>
      item.id === itemId
        ? { ...item, quantity }
        : item
    );
    setItems([...globalCartState]);
  };

  // Limpiar carrito
  const clearCart = () => {
    globalCartState = [];
    setItems([]);
    localStorage.removeItem('cart');
    console.log('🛒 Carrito limpiado completamente');
  };

  // Limpiar carrito después de compra exitosa
  const clearCartAfterPurchase = () => {
    clearCart();
    // Opcional: mostrar mensaje de confirmación
    console.log('✅ Carrito limpiado después de compra exitosa');
  };

  // Calcular totales
  const getTotals = (): CartTotals | null => {
    if (!region || !region.isSupported) {
      return null;
    }

    const subtotal = globalCartState.reduce((total, item) => {
      const price = getProductPrice(item.productType, region.currency, item.pricing);
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
    return globalCartState.reduce((total, item) => total + item.quantity, 0);
  };

  // Verificar si el carrito está vacío
  const isEmpty = globalCartState.length === 0;

  // Obtener item por ID
  const getItem = (itemId: string) => {
    return globalCartState.find(item => item.id === itemId);
  };

  // Verificar si un item está en el carrito
  const hasItem = (itemId: string) => {
    return globalCartState.some(item => item.id === itemId);
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
    clearCartAfterPurchase,
    getTotals,
    getTotalItems,
    isEmpty,
    getItem,
    hasItem,
    getItemQuantity
  };
}
