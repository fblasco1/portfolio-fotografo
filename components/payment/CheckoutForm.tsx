"use client";

import { useState, useEffect } from 'react';
import { useRegion } from '@/hooks/useRegion';
import { usePayment } from '@/hooks/usePayment';
import RegionSelector from './RegionSelector';
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

interface CheckoutFormProps {
  items: CartItem[];
  onClose: () => void;
  locale: string;
}

export default function CheckoutForm({ items, onClose, locale }: CheckoutFormProps) {
  const { region, loading: regionLoading } = useRegion();
  const { createPaymentIntent, loading: paymentLoading } = usePayment();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular totales
  const subtotal = items.reduce((total, item) => {
    const price = getProductPrice(item.productType, region?.currency || 'ARS');
    return total + (price * item.quantity);
  }, 0);

  const totals = region ? calculateTotalPrice(subtotal, region.currency) : null;

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!customerInfo.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!customerInfo.postalCode.trim()) {
      newErrors.postalCode = 'El código postal es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pago
  const handlePayment = async () => {
    if (!region || !region.isSupported) {
      alert('Región no soportada. Por favor selecciona un país de Latinoamérica.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const paymentItems = items.map(item => ({
        id: item.id,
        title: item.title,
        price: getProductPrice(item.productType, region.currency),
        quantity: item.quantity
      }));

      const paymentIntent = await createPaymentIntent(paymentItems);

      if (paymentIntent) {
        // Redirigir a Mercado Pago
        window.location.href = paymentIntent.paymentUrl;
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      alert('Error procesando el pago. Por favor intenta nuevamente.');
    }
  };

  if (regionLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-600"></div>
            <span>Detectando ubicación...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!region || !region.isSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-orange-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Región no soportada
            </h3>
            <p className="text-gray-600 mb-4">
              Actualmente solo soportamos pagos en Latinoamérica. Por favor selecciona un país de la región.
            </p>
            <RegionSelector />
            <button
              onClick={onClose}
              className="mt-4 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'es' ? 'Finalizar Compra' : 'Checkout'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario de información del cliente */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {locale === 'es' ? 'Información de Envío' : 'Shipping Information'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'es' ? 'Nombre completo' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={locale === 'es' ? 'Tu nombre completo' : 'Your full name'}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'es' ? 'Teléfono' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={locale === 'es' ? '+54 9 11 1234-5678' : '+1 234 567 8900'}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'es' ? 'Dirección' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={locale === 'es' ? 'Calle 123, Barrio' : '123 Main St, Neighborhood'}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'es' ? 'Ciudad' : 'City'}
                    </label>
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={locale === 'es' ? 'Buenos Aires' : 'New York'}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'es' ? 'Código Postal' : 'Postal Code'}
                    </label>
                    <input
                      type="text"
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={locale === 'es' ? '1234' : '12345'}
                    />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'es' ? 'Ubicación' : 'Location'}
                  </label>
                  <RegionSelector showLabel={false} />
                </div>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {locale === 'es' ? 'Resumen del Pedido' : 'Order Summary'}
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {/* Items */}
                {items.map((item) => {
                  const price = getProductPrice(item.productType, region.currency);
                  return (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.subtitle}</p>
                        <p className="text-sm text-gray-500">
                          {locale === 'es' ? 'Cantidad' : 'Quantity'}: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(price * item.quantity, region.currency, region.symbol)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(price, region.currency, region.symbol)} c/u
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Totales */}
                {totals && (
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
                )}

                {/* Botón de pago */}
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full bg-stone-600 text-white py-3 px-4 rounded-md hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{locale === 'es' ? 'Procesando...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{locale === 'es' ? 'Pagar con Mercado Pago' : 'Pay with Mercado Pago'}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  {locale === 'es' 
                    ? 'Serás redirigido a Mercado Pago para completar el pago de forma segura'
                    : 'You will be redirected to Mercado Pago to complete your payment securely'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
