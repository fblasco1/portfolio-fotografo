"use client";

import { useState, useEffect } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import type { ProductSize } from '@/contexts/CartContext';
import type { SanityProduct } from '@/app/types/store';
import { getSizePricing, getAvailableSizes, getPriceUSDForSize, type SizePricing } from '@/lib/sanity-pricing';
import { convertUSDToLocal } from '@/lib/currency-converter';
import { formatPrice } from '@/lib/payment/region-detector';

interface SizeSelectorProps {
  product: SanityProduct;
  selectedSize: ProductSize | null;
  onSizeChange: (size: ProductSize) => void;
  locale: 'es' | 'en';
  onCustomSizeContact?: () => void;
  pricing?: SizePricing | null; // Precios ya cargados desde el padre (opcional)
}

export default function SizeSelector({
  product,
  selectedSize,
  onSizeChange,
  locale,
  onCustomSizeContact,
  pricing: propPricing
}: SizeSelectorProps) {
  const { region } = useRegion();
  const [convertedPrices, setConvertedPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);
  const [pricing, setPricing] = useState<SizePricing | null>(propPricing || null);
  const [loadingSizes, setLoadingSizes] = useState(!propPricing); // Si ya tenemos pricing, no mostrar loading

  // Si recibimos pricing desde props, usarlo directamente
  useEffect(() => {
    if (propPricing !== undefined) {
      setPricing(propPricing);
      if (propPricing) {
        // Calcular tamaños sincrónicamente (rápido)
        const sizes = getAvailableSizes(propPricing, { productType: product.category });
        setAvailableSizes(sizes);
        setLoadingSizes(false);
      } else {
        setAvailableSizes(product.category === 'photo' ? ['custom'] : []);
        setLoadingSizes(false);
      }
    }
  }, [propPricing, product.category]);

  // Solo cargar precios si no se pasaron desde props
  useEffect(() => {
    if (propPricing === undefined) {
      const loadPricing = async () => {
        setLoadingSizes(true);
        try {
          const sizePricing = await getSizePricing();
          setPricing(sizePricing);
          if (sizePricing) {
            // getAvailableSizes es síncrono y rápido
            const sizes = getAvailableSizes(sizePricing, { productType: product.category });
            setAvailableSizes(sizes);
          } else {
            // Si no hay precios, mostrar solo opción custom
            setAvailableSizes(product.category === 'photo' ? ['custom'] : []);
          }
        } catch (error) {
          console.error('Error loading pricing:', error);
          // En caso de error, mostrar solo custom
          setAvailableSizes(product.category === 'photo' ? ['custom'] : []);
        } finally {
          setLoadingSizes(false);
        }
      };
      loadPricing();
    }
  }, [propPricing, product.category]);

  // Cargar precios convertidos para cada tamaño
  useEffect(() => {
    const loadPrices = async () => {
      if (!pricing) {
        setLoadingPrices(false);
        return;
      }

      setLoadingPrices(true);
      const prices: Record<string, number> = {};

      for (const size of availableSizes) {
        if (size === 'custom') continue;

        const priceUSD = getPriceUSDForSize(pricing, size, { productType: product.category });
        if (priceUSD > 0) {
          // Si hay región y está soportada, convertir a moneda local
          if (region && region.isSupported) {
            try {
              const converted = await convertUSDToLocal(
                priceUSD,
                region.currency,
                region.country
              );
              prices[size] = converted;
            } catch (error) {
              console.error(`Error converting price for size ${size}:`, error);
              prices[size] = priceUSD; // Fallback a USD
            }
          } else {
            // Si no hay región, mostrar precio en USD
            prices[size] = priceUSD;
          }
        }
      }

      setConvertedPrices(prices);
      setLoadingPrices(false);
    };

    loadPrices();
  }, [pricing, region, availableSizes]);

  const handleSizeSelect = (size: ProductSize) => {
    if (size === 'custom') {
      if (product.category !== 'photo') {
        return;
      }
      if (onCustomSizeContact) {
        onCustomSizeContact();
      }
      return;
    }
    onSizeChange(size);
  };

  const getSizeLabel = (size: ProductSize): string => {
    const labels: Record<string, { es: string; en: string }> = {
      '15x21': { es: '15x21 cm', en: '15x21 cm' },
      '20x30': { es: '20x30 cm', en: '20x30 cm' },
      '30x45': { es: '30x45 cm', en: '30x45 cm' },
      'custom': {
        es: 'Tamaño personalizado',
        en: 'Custom size'
      }
    };

    return labels[size]?.[locale] || size;
  };

  const getPriceDisplay = (size: ProductSize): string => {
    if (size === 'custom') {
      return locale === 'es' ? 'Cotizar' : 'Quote';
    }

    if (!pricing) return '';

    const priceUSD = getPriceUSDForSize(pricing, size, { productType: product.category });
    if (priceUSD === 0) return '';

    if (loadingPrices) {
      return locale === 'es' ? 'Cargando...' : 'Loading...';
    }

    // Si hay precio convertido y región soportada, mostrar precio local
    const converted = convertedPrices[size];
    if (converted && region && region.isSupported) {
      return formatPrice(converted, region.currency, region.symbol);
    }

    // Fallback a USD si no hay región o no está soportada
    return `$${priceUSD.toFixed(2)} USD`;
  };

  // Mostrar loading mientras se cargan los tamaños
  if (loadingSizes) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'es' ? 'Selecciona el tamaño:' : 'Select size:'}
        </label>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-600"></div>
          <span className="ml-2 text-sm text-gray-500">
            {locale === 'es' ? 'Cargando tamaños...' : 'Loading sizes...'}
          </span>
        </div>
      </div>
    );
  }

  // Solo mostrar mensaje de "no hay tamaños" si ya terminó de cargar y realmente no hay
  if (availableSizes.length === 0 && !loadingSizes) {
    return (
      <div className="text-sm text-gray-500">
        {locale === 'es' ? 'No hay tamaños disponibles' : 'No sizes available'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {locale === 'es' ? 'Selecciona el tamaño:' : 'Select size:'}
      </label>
      <div className="space-y-2">
        {availableSizes.map((size) => {
          const isSelected = selectedSize === size;
          const priceDisplay = getPriceDisplay(size);
          const isCustom = size === 'custom';

          return (
            <button
              key={size}
              type="button"
              onClick={() => handleSizeSelect(size)}
              className={`
                w-full text-left px-4 py-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-stone-600 bg-stone-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${isCustom ? 'border-dashed' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${isSelected
                        ? 'border-stone-600'
                        : 'border-gray-300'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-stone-600" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {getSizeLabel(size)}
                  </span>
                </div>
                {priceDisplay && (
                  <span className="text-sm font-semibold text-stone-600">
                    {priceDisplay}
                  </span>
                )}
              </div>
              {isCustom && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {locale === 'es'
                    ? 'Contáctanos para cotizar un tamaño especial'
                    : 'Contact us to quote a custom size'}
                </p>
              )}
            </button>
          );
        })}
      </div>
      {loadingPrices && (
        <p className="text-xs text-gray-500 text-center">
          {locale === 'es' ? 'Cargando precios...' : 'Loading prices...'}
        </p>
      )}
    </div>
  );
}
