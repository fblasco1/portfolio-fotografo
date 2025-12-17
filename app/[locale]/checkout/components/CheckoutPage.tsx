"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useRegion } from '@/contexts/RegionContext';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { PaymentResultModal } from '@/components/payment/PaymentResultModal';
import { Button } from '@/app/[locale]/components/ui/button';
import { Card } from '@/app/[locale]/components/ui/card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { getSizePricing, getPriceUSDForSize, getAvailableSizes, type SizePricing } from '@/lib/sanity-pricing';
import { convertUSDToLocal } from '@/lib/currency-converter';
import type { ProductSize } from '@/contexts/CartContext';

interface CheckoutPageProps {
  locale: string;
}

export default function CheckoutPage({ locale }: CheckoutPageProps) {
  const router = useRouter();
  const { items: cart, getTotalItems, isEmpty, getTotals, updateItemTypeAndSize } = useCart();
  const { region, loading: regionLoading } = useRegion();
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [total, setTotal] = useState(0);
  const [pricing, setPricing] = useState<SizePricing | null>(null);
  const [selectedTypesAndSizes, setSelectedTypesAndSizes] = useState<Record<string, { productType: 'photos' | 'postcards', size: ProductSize }>>({});
  
  // Estado para el modal de resultado
  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'approved' | 'pending' | 'rejected' | 'in_process' | 'cancelled' | null>(null);
  const [paymentId, setPaymentId] = useState<number | undefined>();
  
  // Estado para datos del cliente
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Cargar precios globales
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const globalPricing = await getSizePricing();
        setPricing(globalPricing);
      } catch (error) {
        console.error('Error loading pricing:', error);
      }
    };
    loadPricing();
  }, []);

  // Inicializar selecciones de tipo y tamaño para items que no los tienen
  useEffect(() => {
    const initialSelections: Record<string, { productType: 'photos' | 'postcards', size: ProductSize }> = {};
    cart.forEach(item => {
      if (!item.productType || !item.size) {
        // Si no tiene tipo ni tamaño, inicializar con valores por defecto solo si no existe ya
        if (!selectedTypesAndSizes[item.id]) {
          initialSelections[item.id] = {
            productType: 'photos', // Por defecto foto
            size: '15x21' // Por defecto tamaño pequeño
          };
        }
      }
    });
    if (Object.keys(initialSelections).length > 0) {
      setSelectedTypesAndSizes(prev => {
        const newState = { ...prev };
        Object.keys(initialSelections).forEach(key => {
          newState[key] = initialSelections[key];
        });
        return newState;
      });
    }
  }, [cart, selectedTypesAndSizes]);

  // Cargar precios convertidos
  useEffect(() => {
    const loadPrices = async () => {
      if (!region || !region.isSupported || cart.length === 0 || !pricing) {
        setLoadingPrices(false);
        return;
      }

      setLoadingPrices(true);
      const priceMap: Record<string, number> = {};

      try {
        for (const item of cart) {
          // Usar tipo y tamaño seleccionados o los del item
          const productType = item.productType || selectedTypesAndSizes[item.id]?.productType || 'photos';
          const size = item.size || selectedTypesAndSizes[item.id]?.size || '15x21';
          
          if (size === 'custom') {
            priceMap[`${item.id}_${size}`] = 0;
            continue;
          }

          try {
            const sanityProductType = productType === 'postcards' ? 'postcard' : 'photo';
            const priceUSD = getPriceUSDForSize(pricing, size, { productType: sanityProductType });
            if (priceUSD > 0) {
              const converted = await convertUSDToLocal(
                priceUSD,
                region.currency,
                region.country
              );
              priceMap[`${item.id}_${size}`] = converted;
            } else {
              priceMap[`${item.id}_${size}`] = 0;
            }
          } catch (error) {
            console.error(`Error converting price for item ${item.id}:`, error);
            priceMap[`${item.id}_${size}`] = 0;
          }
        }

        // Calcular total usando los valores seleccionados actuales
        const subtotal = cart.reduce((sum, item) => {
          // Usar tipo y tamaño seleccionados o los del item
          const productType = selectedTypesAndSizes[item.id]?.productType || item.productType || 'photos';
          const size = selectedTypesAndSizes[item.id]?.size || item.size || '15x21';
          const price = priceMap[`${item.id}_${size}`] || 0;
          return sum + (price * item.quantity);
        }, 0);
        setTotal(subtotal);
      } catch (error) {
        console.error('Error loading pricing:', error);
      }

      setItemPrices(priceMap);
      setLoadingPrices(false);
    };

    loadPrices();
  }, [cart, region, pricing, selectedTypesAndSizes]);

  const getSizeLabel = (size: ProductSize): string => {
    const labels: Record<string, { es: string; en: string }> = {
      '15x21': { es: '15x21 cm', en: '15x21 cm' },
      '20x30': { es: '20x30 cm', en: '20x30 cm' },
      '30x45': { es: '30x45 cm', en: '30x45 cm' },
      'custom': { es: 'Personalizado', en: 'Custom' }
    };
    return labels[size]?.[locale as 'es' | 'en'] || size;
  };

  // Cargar datos del cliente desde localStorage si están disponibles
  useEffect(() => {
    const savedCustomerData = localStorage.getItem('customerData');
    if (savedCustomerData) {
      try {
        const data = JSON.parse(savedCustomerData);
        setCustomerInfo({
          email: data.email || '',
          firstName: data.name ? data.name.split(' ')[0] : '',
          lastName: data.name ? data.name.split(' ').slice(1).join(' ') : '',
        });
        // Limpiar los datos del localStorage después de usarlos
        localStorage.removeItem('customerData');
      } catch (error) {
        console.warn('Error parsing customer data from localStorage:', error);
      }
    }
  }, []);

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (!regionLoading && isEmpty) {
      router.push(`/${locale}/gallery`);
    }
  }, [isEmpty, regionLoading, router, locale]);

  // Textos internacionalizados
  const getText = (key: string): string => {
    const texts: Record<string, { es: string; en: string }> = {
      title: {
        es: "Finalizar Compra",
        en: "Checkout"
      },
      backToShop: {
        es: "Volver a la Galería",
        en: "Back to Gallery"
      },
      reviewOrder: {
        es: "Revisar Pedido",
        en: "Review Order"
      },
      proceedToPayment: {
        es: "Proceder al Pago",
        en: "Proceed to Payment"
      },
      emptyCart: {
        es: "Tu carrito está vacío",
        en: "Your cart is empty"
      },
      emptyCartMessage: {
        es: "Agrega algunos productos antes de proceder al checkout.",
        en: "Add some products before proceeding to checkout."
      },
      regionNotSupported: {
        es: "Región no soportada",
        en: "Unsupported Region"
      },
      regionMessage: {
        es: "Actualmente solo soportamos pagos en Latinoamérica. Por favor selecciona un país de la región para continuar.",
        en: "We currently only support payments in Latin America. Please select a country from the region to continue."
      }
    };
    return texts[key]?.[locale as 'es' | 'en'] || texts[key]?.es || '';
  };

  // Si está cargando la región
  if (regionLoading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600"></div>
        </div>
      </div>
    );
  }

  // Si la región no está soportada
  if (!region || !region.isSupported) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="text-center py-12">
          <div className="text-orange-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {getText("regionNotSupported")}
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {getText("regionMessage")}
          </p>
          <Button
            onClick={() => router.push(`/${locale}/gallery`)}
            variant="outline"
            className="mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            {getText("backToShop")}
          </Button>
        </div>
      </div>
    );
  }

  // Si el carrito está vacío
  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <ShoppingCart size={64} className="mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {getText("emptyCart")}
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {getText("emptyCartMessage")}
          </p>
          <Button
            onClick={() => router.push(`/${locale}/gallery`)}
            className="bg-stone-600 hover:bg-stone-700 text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            {getText("backToShop")}
          </Button>
        </div>
      </div>
    );
  }

  // Handlers para el flujo de pago
  const handlePaymentSuccess = (id: number, status: string) => {
    setPaymentId(id);
    setPaymentStatus(status as any);
    setShowResultModal(true);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    // Auto-ocultar después de 5 segundos
    setTimeout(() => setPaymentError(null), 5000);
  };

  // Actualizar tipo y tamaño de un item
  const handleTypeAndSizeChange = (itemId: string, productType: 'photos' | 'postcards', size: ProductSize) => {
    // Si cambiamos el tipo, verificar que el tamaño sea válido para el nuevo tipo
    let validSize = size;
    if (pricing) {
      const availableSizes = getAvailableSizes(pricing, { 
        productType: productType === 'postcards' ? 'postcard' : 'photo' 
      });
      // Si el tamaño actual no está disponible para el nuevo tipo, usar el primero disponible
      if (!availableSizes.includes(size) && availableSizes.length > 0) {
        validSize = availableSizes[0];
      }
    }
    
    // Actualizar el estado local - crear un nuevo objeto para asegurar que React detecte el cambio
    setSelectedTypesAndSizes(prev => {
      // Crear un nuevo objeto completamente nuevo para forzar re-render
      const newState: Record<string, { productType: 'photos' | 'postcards', size: ProductSize }> = {};
      // Copiar todos los valores existentes (crear nuevos objetos también)
      Object.keys(prev).forEach(key => {
        if (key !== itemId) {
          newState[key] = { ...prev[key] };
        }
      });
      // Agregar el nuevo valor
      newState[itemId] = { productType, size: validSize };
      return newState;
    });
    
    // Actualizar el item en el carrito
    const itemIndex = cart.findIndex(i => i.id === itemId);
    if (itemIndex !== -1) {
      const item = cart[itemIndex];
      // Si el item no tiene tamaño, usar el ID con índice para actualizarlo
      if (!item.size) {
        const tempItemId = `${item.id}_${itemIndex}`;
        updateItemTypeAndSize(tempItemId, productType, validSize);
      } else {
        // Si ya tiene tamaño, usar el método normal
        const currentItemId = `${item.id}_${item.size}`;
        updateItemTypeAndSize(currentItemId, productType, validSize);
      }
    }
  };

  // Verificar si todos los items tienen tipo y tamaño seleccionados
  const allItemsConfigured = cart.every(item => {
    if (item.productType && item.size) return true;
    const selection = selectedTypesAndSizes[item.id];
    return selection && selection.productType && selection.size;
  });

  // Pedir información del cliente antes de mostrar formulario
  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar que todos los items tengan tipo y tamaño
    if (!allItemsConfigured) {
      setPaymentError(locale === 'es' 
        ? 'Por favor, selecciona el tipo y tamaño para todos los productos' 
        : 'Please select type and size for all products');
      return;
    }
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setCustomerInfo({
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    });
    
    setShowPaymentForm(true);
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.push(`/${locale}/gallery`)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          {getText("backToShop")}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {getText("title")}
        </h1>
      </div>

      {paymentError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {paymentError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resumen del pedido */}
        <div className="order-2 lg:order-1">
          <Card className="p-6 flex flex-col h-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("reviewOrder")}
            </h2>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
              <div className="space-y-4">
                {loadingPrices ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  cart.map((item, index) => {
                  // Usar el estado seleccionado si existe, sino usar los valores del item o defaults
                  // IMPORTANTE: Siempre priorizar selectedTypesAndSizes sobre item.productType/item.size
                  // Leer directamente del estado para asegurar que se actualice cuando cambie
                  const selection = selectedTypesAndSizes[item.id];
                  // Usar nullish coalescing para asegurar que se use el estado si existe
                  const currentSize: ProductSize = selection?.size ?? item.size ?? '15x21';
                  const currentType: 'photos' | 'postcards' = selection?.productType ?? item.productType ?? 'photos';
                  const itemPrice = itemPrices[`${item.id}_${currentSize}`] || 0;
                  const needsConfiguration = !item.productType || !item.size;
                  
                  // Generar key única para evitar problemas de re-render
                  // Usar el índice para items sin tamaño para mantener la key estable
                  const itemKey = item.size ? `${item.id}_${item.size}` : `${item.id}_${index}`;
                  
                  return (
                    <div key={itemKey} className="flex gap-4 border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.subtitle}</p>
                        
                        {/* Selector de tipo y tamaño - siempre visible para permitir edición */}
                        {pricing && (
                          <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {locale === 'es' ? 'Tipo de producto:' : 'Product type:'}
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const availableSizes = getAvailableSizes(pricing, { productType: 'photo' });
                                    const newSize = availableSizes.length > 0 && availableSizes.includes(currentSize) 
                                      ? currentSize 
                                      : availableSizes.length > 0 
                                        ? availableSizes[0] 
                                        : currentSize;
                                    handleTypeAndSizeChange(item.id, 'photos', newSize);
                                  }}
                                  className={`px-4 py-2 rounded border-2 transition-colors cursor-pointer ${
                                    currentType === 'photos'
                                      ? 'border-stone-600 bg-stone-50 font-medium'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'
                                  }`}
                                  aria-pressed={currentType === 'photos'}
                                >
                                  {locale === 'es' ? 'Foto' : 'Photo'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const availableSizes = getAvailableSizes(pricing, { productType: 'postcard' });
                                    const newSize = availableSizes.length > 0 && availableSizes.includes(currentSize) 
                                      ? currentSize 
                                      : availableSizes.length > 0 
                                        ? availableSizes[0] 
                                        : currentSize;
                                    handleTypeAndSizeChange(item.id, 'postcards', newSize);
                                  }}
                                  className={`px-4 py-2 rounded border-2 transition-colors cursor-pointer ${
                                    currentType === 'postcards'
                                      ? 'border-stone-600 bg-stone-50 font-medium'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'
                                  }`}
                                  aria-pressed={currentType === 'postcards'}
                                >
                                  {locale === 'es' ? 'Postal' : 'Postcard'}
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {locale === 'es' ? 'Tamaño:' : 'Size:'}
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {getAvailableSizes(pricing, { productType: currentType === 'postcards' ? 'postcard' : 'photo' }).map((size) => {
                                  const isSelected = currentSize === size;
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleTypeAndSizeChange(item.id, currentType, size);
                                      }}
                                      className={`px-3 py-2 text-sm rounded border-2 transition-colors cursor-pointer ${
                                        isSelected
                                          ? 'border-stone-600 bg-stone-50 font-medium'
                                          : 'border-gray-200 hover:border-gray-300 bg-white'
                                      }`}
                                      aria-pressed={isSelected}
                                    >
                                      {getSizeLabel(size)}
                                    </button>
                                  );
                                })}
                              </div>
                              {getAvailableSizes(pricing, { productType: currentType === 'postcards' ? 'postcard' : 'photo' }).length === 0 && (
                                <p className="text-sm text-gray-500 italic">
                                  {locale === 'es' ? 'No hay tamaños disponibles para este tipo' : 'No sizes available for this type'}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-sm mt-2">
                          {locale === 'es' ? 'Cantidad' : 'Quantity'}: {item.quantity}
                          {itemPrice > 0 && (
                            <> × {new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: region?.currency || 'ARS',
                            }).format(itemPrice)}</>
                          )}
                        </p>
                        {currentSize === 'custom' && (
                          <p className="text-xs text-gray-500 italic">
                            {locale === 'es' ? 'Precio a cotizar' : 'Price to be quoted'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </div>
            <div className="border-t pt-4 mt-4 flex-shrink-0">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: region?.currency || 'ARS',
                  }).format(total)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                * Envío e IVA se acordarán con el vendedor después del pago
              </p>
            </div>
          </Card>
        </div>

        {/* Formulario de pago */}
        <div className="order-1 lg:order-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {showPaymentForm ? 'Datos de Pago' : 'Información de Contacto'}
            </h2>
            
            {!showPaymentForm ? (
              <form onSubmit={handleContinueToPayment} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                {!allItemsConfigured && (
                  <p className="text-sm text-orange-600 mb-2">
                    {locale === 'es' 
                      ? '⚠️ Por favor, selecciona el tipo y tamaño para todos los productos' 
                      : '⚠️ Please select type and size for all products'}
                  </p>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!allItemsConfigured}
                >
                  {locale === 'es' ? 'Continuar al Pago' : 'Continue to Payment'}
                </Button>
              </form>
            ) : (
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                customerInfo={customerInfo}
                total={total}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Modal de resultado */}
      <PaymentResultModal
        isOpen={showResultModal}
        status={paymentStatus}
        paymentId={paymentId}
        onClose={() => setShowResultModal(false)}
        onGoHome={() => router.push(`/${locale}`)}
        onContinueShopping={() => router.push(`/${locale}/gallery`)}
      />
    </div>
  );
}
