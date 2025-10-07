"use client";

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useRegion } from '@/hooks/useRegion';

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    productType: 'photos' | 'postcards';
    pricing?: any; // Precios por región desde Sanity
  };
  locale: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function AddToCartButton({ 
  product, 
  locale, 
  className = '',
  variant = 'default',
  size = 'md'
}: AddToCartButtonProps) {
  const { addItem, hasItem, getItemQuantity } = useCart();
  const { region, loading } = useRegion();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isInCart = hasItem(product.id);
  const quantity = getItemQuantity(product.id);
  const isDisabled = loading || !region || !region.isSupported;

  const handleAddToCart = async () => {
    if (isDisabled) {
      if (!region || !region.isSupported) {
        alert(locale === 'es' 
          ? 'Región no soportada. Por favor selecciona un país de Latinoamérica.'
          : 'Unsupported region. Please select a Latin American country.'
        );
      }
      return;
    }

    setIsAdding(true);
    
    try {
      // Simular delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addItem(product);
      setShowSuccess(true);
      
      // Ocultar mensaje de éxito después de 2 segundos
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-stone-600 text-stone-600 hover:bg-stone-50';
      case 'ghost':
        return 'text-stone-600 hover:bg-stone-100';
      default:
        return 'bg-stone-600 text-white hover:bg-stone-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleAddToCart}
        disabled={isDisabled || isAdding}
        className={`
          relative inline-flex items-center justify-center space-x-2 rounded-md font-medium transition-all duration-200
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        {isAdding ? (
          <>
            <div className={`animate-spin rounded-full border-b-2 border-current ${getIconSize()}`}></div>
            <span>{locale === 'es' ? 'Agregando...' : 'Adding...'}</span>
          </>
        ) : showSuccess ? (
          <>
            <svg className={`text-green-600 ${getIconSize()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600">
              {locale === 'es' ? '¡Agregado!' : 'Added!'}
            </span>
          </>
        ) : isInCart ? (
          <>
            <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span>
              {locale === 'es' ? 'En Carrito' : 'In Cart'} ({quantity})
            </span>
          </>
        ) : (
          <>
            <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>
              {locale === 'es' ? 'Agregar al Carrito' : 'Add to Cart'}
            </span>
          </>
        )}
      </button>

      {/* Tooltip para región no soportada */}
      {isDisabled && !loading && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          {locale === 'es' 
            ? 'Solo disponible en Latinoamérica'
            : 'Only available in Latin America'
          }
        </div>
      )}
    </div>
  );
}
