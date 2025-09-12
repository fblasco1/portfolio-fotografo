"use client";

import { useCart } from '@/hooks/useCart';
import { useRegion } from '@/hooks/useRegion';

interface CartButtonProps {
  locale: string;
  className?: string;
}

export default function CartButton({ locale, className = '' }: CartButtonProps) {
  const { getTotalItems, setIsOpen } = useCart();
  const { region, loading } = useRegion();
  
  const totalItems = getTotalItems();
  const isDisabled = loading || !region || !region.isSupported;

  const handleClick = () => {
    if (isDisabled) {
      if (!region || !region.isSupported) {
        alert(locale === 'es' 
          ? 'Región no soportada. Por favor selecciona un país de Latinoamérica.'
          : 'Unsupported region. Please select a Latin American country.'
        );
      }
      return;
    }
    setIsOpen(true);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`relative inline-flex items-center space-x-2 px-4 py-2 bg-stone-600 text-white rounded-md hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
      
      <span className="hidden sm:inline">
        {locale === 'es' ? 'Carrito' : 'Cart'}
      </span>
      
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
      
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-md flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </button>
  );
}
