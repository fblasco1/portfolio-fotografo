"use client";

import { ReactNode } from 'react';
import { RegionProvider } from './RegionContext';
import { CartProvider } from './CartContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Proveedor central de la aplicación que envuelve todos los contextos
 * RegionProvider debe estar antes de CartProvider porque Cart depende de Region
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <RegionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </RegionProvider>
  );
}

