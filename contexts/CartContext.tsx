"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRegion } from './RegionContext';
import { getProductPrice } from '@/lib/payment/config';
import { useCurrentLocale } from '@/locales/client';

export type ProductSize = '15x21' | '20x30' | '30x45' | 'custom';

interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  productType: 'photos' | 'postcards';
  quantity: number;
  size: ProductSize;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const { region } = useRegion();
  const currentLocale = useCurrentLocale();

  // Cargar carrito desde localStorage/sessionStorage al inicializar
  useEffect(() => {
    const loadCartFromStorage = (context = 'INIT') => {
      try {
        // Intentar cargar desde localStorage primero
        let savedCart = localStorage.getItem('cart');
        let source = 'localStorage';
        
        // Si no hay nada en localStorage, intentar sessionStorage
        if (!savedCart) {
          savedCart = sessionStorage.getItem('cart');
          source = 'sessionStorage';
        }
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Validar que el carrito tenga la estructura correcta
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setItems(parsedCart);
            setIsInitialized(true);
          } else if (Array.isArray(parsedCart)) {
            // Carrito vacío válido
            setItems([]);
            setIsInitialized(true);
          } else {
            setItems([]);
            setIsInitialized(true);
            localStorage.removeItem('cart');
            sessionStorage.removeItem('cart');
          }
        } else {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error(`🛒 [${context}] Error loading cart from storage:`, error);
        setItems([]);
        setIsInitialized(true);
        // Limpiar storage corrupto
        localStorage.removeItem('cart');
        sessionStorage.removeItem('cart');
      }
    };

    // Cargar inmediatamente
    loadCartFromStorage('INIT_IMMEDIATE');
    
    // También cargar después de un pequeño delay para asegurar que se ejecute después de la navegación
    const timeoutId = setTimeout(() => loadCartFromStorage('INIT_DELAYED'), 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Recargar carrito cuando cambie el idioma (para asegurar persistencia)
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        // Intentar cargar desde localStorage primero
        let savedCart = localStorage.getItem('cart');
        let source = 'localStorage';
        
        // Si no hay nada en localStorage, intentar sessionStorage
        if (!savedCart) {
          savedCart = sessionStorage.getItem('cart');
          source = 'sessionStorage';
        }
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setItems(parsedCart);
          }
        }
      } catch (error) {
        // Error silencioso en producción
      }
    };

    // Recargar carrito cuando cambie el idioma
    loadCartFromStorage();
  }, [currentLocale]);

  // Listener para detectar cuando la página se carga (útil para cambios de idioma)
  useEffect(() => {
    const handlePageLoad = () => {
      try {
        // Intentar cargar desde localStorage primero
        let savedCart = localStorage.getItem('cart');
        let source = 'localStorage';
        
        // Si no hay nada en localStorage, intentar sessionStorage
        if (!savedCart) {
          savedCart = sessionStorage.getItem('cart');
          source = 'sessionStorage';
        }
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setItems(parsedCart);
          }
        }
      } catch (error) {
        // Error silencioso en producción
      }
    };

    // Ejecutar inmediatamente si ya estamos en el cliente
    if (typeof window !== 'undefined') {
      handlePageLoad();
    }

    // También escuchar el evento de carga de la página
    window.addEventListener('load', handlePageLoad);
    
    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, []);

  // Guardar carrito en localStorage y sessionStorage cuando cambie (solo después de inicialización)
  useEffect(() => {
    // Solo guardar si ya se inicializó el carrito
    if (!isInitialized) {
      return;
    }

    try {
      const cartData = JSON.stringify(items);
      localStorage.setItem('cart', cartData);
      sessionStorage.setItem('cart', cartData); // Respaldo en sessionStorage
    } catch (error) {
      // Error silencioso en producción
    }
  }, [items, isInitialized]);

  // Generar ID único para item del carrito (productId + size)
  const generateCartItemId = (productId: string, size: ProductSize): string => {
    return `${productId}_${size}`;
  };

  // Agregar item al carrito
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const itemId = generateCartItemId(item.id, item.size);
      const existingItem = currentItems.find(i => generateCartItemId(i.id, i.size) === itemId);
      
      if (existingItem) {
        return currentItems.map(i =>
          generateCartItemId(i.id, i.size) === itemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...currentItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Remover item del carrito (itemId es el ID generado: productId_size)
  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => 
      generateCartItemId(item.id, item.size) !== itemId
    ));
  };

  // Actualizar cantidad de un item (itemId es el ID generado: productId_size)
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        generateCartItemId(item.id, item.size) === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
    sessionStorage.removeItem('cart');
  };

  // Limpiar carrito después de compra exitosa
  const clearCartAfterPurchase = () => {
    clearCart();
  };

  // Calcular totales (sin envío ni IVA - se acordará con el vendedor)
  const getTotals = (): CartTotals | null => {
    if (!region || !region.isSupported) {
      return null;
    }

    // Calcular subtotal de forma asíncrona (pero retornamos sincrónicamente por ahora)
    // En el componente que use getTotals, necesitará obtener el precio convertido
    const subtotal = items.reduce((total, item) => {
      // El precio se calculará en el componente que muestra el total
      // Aquí solo retornamos 0 como placeholder, el cálculo real se hace en el componente
      return total;
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

  // Obtener item por ID (itemId es el ID generado: productId_size)
  const getItem = (itemId: string) => {
    return items.find(item => generateCartItemId(item.id, item.size) === itemId);
  };

  // Verificar si un item está en el carrito (por productId y size)
  const hasItem = (productId: string, size: ProductSize) => {
    const itemId = generateCartItemId(productId, size);
    return items.some(item => generateCartItemId(item.id, item.size) === itemId);
  };

  // Obtener cantidad de un item específico (por productId y size)
  const getItemQuantity = (productId: string, size: ProductSize) => {
    const itemId = generateCartItemId(productId, size);
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

