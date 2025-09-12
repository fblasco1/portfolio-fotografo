"use client";

import { useCart } from '@/hooks/useCart';
import { useRegion } from '@/hooks/useRegion';
import { CartButton, EnhancedCart, AddToCartButton } from './index';

interface Product {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  productType: 'photos' | 'postcards';
}

interface ShopIntegrationProps {
  products: Product[];
  locale: string;
}

export default function ShopIntegration({ products, locale }: ShopIntegrationProps) {
  const { region, loading } = useRegion();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600"></div>
      </div>
    );
  }

  if (!region || !region.isSupported) {
    return (
      <div className="text-center py-12">
        <div className="text-orange-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {locale === 'es' ? 'Región no soportada' : 'Unsupported Region'}
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {locale === 'es' 
            ? 'Actualmente solo soportamos pagos en Latinoamérica. Por favor selecciona un país de la región para continuar.'
            : 'We currently only support payments in Latin America. Please select a country from the region to continue.'
          }
        </p>
        <div className="max-w-sm mx-auto">
          <RegionSelector />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de carrito */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'es' ? 'Tienda' : 'Shop'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'es' 
              ? 'Productos disponibles en tu región'
              : 'Products available in your region'
            }
          </p>
        </div>
        <CartButton locale={locale} />
      </div>

      {/* Información de región */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <span className="text-blue-600 text-2xl">🌍</span>
          <div>
            <p className="text-sm font-medium text-blue-800">
              {locale === 'es' ? 'Ubicación detectada' : 'Location detected'}
            </p>
            <p className="text-sm text-blue-600">
              {region.country} • {region.currency} • Mercado Pago
            </p>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {product.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {product.subtitle}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 capitalize">
                  {product.productType}
                </span>
                <AddToCartButton
                  product={product}
                  locale={locale}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carrito mejorado */}
      <EnhancedCart locale={locale} />
    </div>
  );
}
