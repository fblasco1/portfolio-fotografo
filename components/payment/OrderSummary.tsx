"use client";

import { useState, useEffect } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { calculateTotalPrice } from '@/lib/payment/config';
import { formatPrice } from '@/lib/payment/region-detector';
import { getSizePricing, getPriceUSDForSize } from '@/lib/sanity-pricing';
import { convertUSDToLocal } from '@/lib/currency-converter';
import type { ProductSize } from '@/contexts/CartContext';

interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  productType: 'photos' | 'postcards';
  quantity: number;
  size: ProductSize;
}

interface OrderSummaryProps {
  items: CartItem[];
  locale: string;
  region?: any; // Añadido para compatibilidad con CheckoutPage
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  checkoutLoading?: boolean;
}

export default function OrderSummary({ 
  items, 
  locale, 
  region: propRegion,
  showCheckoutButton = false, 
  onCheckout,
  checkoutLoading = false 
}: OrderSummaryProps) {
  const { region: hookRegion, loading } = useRegion();
  const region = propRegion || hookRegion;
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Cargar precios convertidos
  useEffect(() => {
    const loadPrices = async () => {
      if (!region || !region.isSupported) {
        setLoadingPrices(false);
        return;
      }

      setLoadingPrices(true);
      const priceMap: Record<string, number> = {};

      try {
        const pricing = await getSizePricing();
        
        if (pricing) {
          const { convertUSDToLocal } = await import('@/lib/currency-converter');
          
          for (const item of items) {
            if (item.size === 'custom') {
              priceMap[item.id] = 0;
              continue;
            }

            try {
              const priceUSD = getPriceUSDForSize(pricing, item.size);
              if (priceUSD > 0) {
                const converted = await convertUSDToLocal(
                  priceUSD,
                  region.currency,
                  region.country
                );
                priceMap[item.id] = converted;
              } else {
                priceMap[item.id] = 0;
              }
            } catch (error) {
              console.error(`Error converting price for item ${item.id}:`, error);
              priceMap[item.id] = 0;
            }
          }
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
      }

      setPrices(priceMap);
      setLoadingPrices(false);
    };

    loadPrices();
  }, [items, region]);

  if ((loading || loadingPrices) && !propRegion) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!region || !region.isSupported) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-orange-600">⚠️</span>
          <div>
            <p className="text-sm font-medium text-orange-800">
              {locale === 'es' ? 'Región no soportada' : 'Unsupported Region'}
            </p>
            <p className="text-xs text-orange-600">
              {locale === 'es' 
                ? 'Solo soportamos pagos en Latinoamérica'
                : 'We only support payments in Latin America'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getSizeLabel = (size: ProductSize): string => {
    const labels: Record<string, { es: string; en: string }> = {
      '15x21': { es: '15x21 cm', en: '15x21 cm' },
      '20x30': { es: '20x30 cm', en: '20x30 cm' },
      '30x45': { es: '30x45 cm', en: '30x45 cm' },
      'custom': { es: 'Personalizado', en: 'Custom' }
    };
    return labels[size]?.[locale as 'es' | 'en'] || size;
  };

  // Calcular totales
  const subtotal = items.reduce((total, item) => {
    const price = prices[item.id] || 0;
    return total + (price * item.quantity);
  }, 0);

  const totals = region ? calculateTotalPrice(subtotal, region.currency) : null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {locale === 'es' ? 'Resumen del Pedido' : 'Order Summary'}
      </h3>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const price = prices[item.id] || 0;
          return (
            <div key={item.id} className="flex items-center space-x-3">
              <img
                src={item.image}
                alt={item.title}
                className="w-12 h-12 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {item.subtitle}
                </p>
                <p className="text-xs text-gray-500">
                  {getSizeLabel(item.size)} • {locale === 'es' ? 'Cantidad' : 'Quantity'}: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {price > 0 ? (
                    formatPrice(price * item.quantity, region.currency, region.symbol)
                  ) : item.size === 'custom' ? (
                    <span className="text-gray-500">{locale === 'es' ? 'Cotizar' : 'Quote'}</span>
                  ) : (
                    '-'
                  )}
                </p>
                {price > 0 && (
                  <p className="text-xs text-gray-500">
                    {formatPrice(price, region.currency, region.symbol)} c/u
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totales */}
      {totals && region ? (
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {locale === 'es' ? 'Subtotal' : 'Subtotal'}:
            </span>
            <span>{formatPrice(totals.subtotal, region.currency, region.symbol)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {locale === 'es' ? 'Envío' : 'Shipping'}:
            </span>
            <span>{formatPrice(totals.shipping, region.currency, region.symbol)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {locale === 'es' ? 'Impuestos' : 'Taxes'}:
            </span>
            <span>{formatPrice(totals.tax, region.currency, region.symbol)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span className="text-gray-900">
              {locale === 'es' ? 'Total' : 'Total'}:
            </span>
            <span className="text-stone-600">
              {formatPrice(totals.total, region.currency, region.symbol)}
            </span>
          </div>
        </div>
      ) : (
        <div className="border-t pt-4 text-center text-gray-500">
          {locale === 'es' ? 'Cargando precios...' : 'Loading prices...'}
        </div>
      )}

      {/* Información de región */}
      {region && (
        <div className="text-xs text-gray-500 border-t pt-2">
          <div className="flex items-center justify-between">
            <span>
              {locale === 'es' ? 'Ubicación' : 'Location'}: {region.country}
            </span>
            <span>
              {locale === 'es' ? 'Moneda' : 'Currency'}: {region.currency}
            </span>
          </div>
          <div className="text-center mt-1">
            <span>
              {locale === 'es' ? 'Proveedor' : 'Provider'}: Mercado Pago
            </span>
          </div>
        </div>
      )}

      {/* Botón de checkout */}
      {showCheckoutButton && onCheckout && (
        <button
          onClick={onCheckout}
          disabled={checkoutLoading || items.length === 0}
          className="w-full bg-stone-600 text-white py-3 px-4 rounded-md hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {checkoutLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>{locale === 'es' ? 'Procesando...' : 'Processing...'}</span>
            </>
          ) : (
            <>
              <span>
                {locale === 'es' ? 'Finalizar Compra' : 'Checkout'}
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
