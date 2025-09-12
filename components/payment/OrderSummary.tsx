"use client";

import { useRegion } from '@/hooks/useRegion';
import { calculateTotalPrice, getProductPrice } from '@/lib/payment/config';
import { formatPrice } from '@/lib/payment/region-detector';

interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  productType: 'photos' | 'postcards';
  quantity: number;
}

interface OrderSummaryProps {
  items: CartItem[];
  locale: string;
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  checkoutLoading?: boolean;
}

export default function OrderSummary({ 
  items, 
  locale, 
  showCheckoutButton = false, 
  onCheckout,
  checkoutLoading = false 
}: OrderSummaryProps) {
  const { region, loading } = useRegion();

  if (loading) {
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

  // Calcular totales
  const subtotal = items.reduce((total, item) => {
    const price = getProductPrice(item.productType, region.currency);
    return total + (price * item.quantity);
  }, 0);

  const totals = calculateTotalPrice(subtotal, region.currency);

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {locale === 'es' ? 'Resumen del Pedido' : 'Order Summary'}
      </h3>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const price = getProductPrice(item.productType, region.currency);
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
                  {locale === 'es' ? 'Cantidad' : 'Quantity'}: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(price * item.quantity, region.currency, region.symbol)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPrice(price, region.currency, region.symbol)} c/u
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totales */}
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

      {/* Información de región */}
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
