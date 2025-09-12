"use client";

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useRegion } from '@/hooks/useRegion';
import OrderSummary from './OrderSummary';
import CheckoutForm from './CheckoutForm';
import { formatPrice } from '@/lib/payment/region-detector';

interface EnhancedCartProps {
  locale: string;
}

export default function EnhancedCart({ locale }: EnhancedCartProps) {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotalItems,
    isEmpty 
  } = useCart();
  
  const { region, loading } = useRegion();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    if (!region || !region.isSupported) {
      alert(locale === 'es' 
        ? 'Región no soportada. Por favor selecciona un país de Latinoamérica.'
        : 'Unsupported region. Please select a Latin American country.'
      );
      return;
    }
    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {locale === 'es' ? 'Carrito de Compras' : 'Shopping Cart'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600"></div>
            </div>
          ) : !region || !region.isSupported ? (
            <div className="text-center py-8">
              <div className="text-orange-600 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'es' ? 'Región no soportada' : 'Unsupported Region'}
              </h3>
              <p className="text-gray-600 mb-4">
                {locale === 'es' 
                  ? 'Solo soportamos pagos en Latinoamérica. Por favor selecciona un país de la región.'
                  : 'We only support payments in Latin America. Please select a country from the region.'
                }
              </p>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'es' ? 'Carrito vacío' : 'Empty Cart'}
              </h3>
              <p className="text-gray-600">
                {locale === 'es' 
                  ? 'Agrega algunos productos para comenzar'
                  : 'Add some products to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items */}
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {item.subtitle}
                    </p>
                    <p className="text-sm text-gray-500">
                      {locale === 'es' ? 'Tipo' : 'Type'}: {item.productType}
                    </p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Clear Cart Button */}
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full text-red-600 hover:text-red-700 py-2 px-4 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  {locale === 'es' ? 'Limpiar Carrito' : 'Clear Cart'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && region && region.isSupported && (
          <div className="border-t p-4">
            <OrderSummary
              items={items}
              locale={locale}
              showCheckoutButton={true}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </div>

      {/* Checkout Form Modal */}
      {showCheckout && (
        <CheckoutForm
          items={items}
          onClose={handleCloseCheckout}
          locale={locale}
        />
      )}
    </>
  );
}
