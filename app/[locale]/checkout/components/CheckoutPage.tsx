"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useRegion } from '@/hooks/useRegion';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { PaymentResultModal } from '@/components/payment/PaymentResultModal';
import { Button } from '@/app/[locale]/components/ui/button';
import { Card } from '@/app/[locale]/components/ui/card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { getProductPrice } from '@/lib/payment/config';

interface CheckoutPageProps {
  locale: string;
}

export default function CheckoutPage({ locale }: CheckoutPageProps) {
  const router = useRouter();
  const { items: cart, getTotalItems, isEmpty, getTotals } = useCart();
  const { region, loading: regionLoading } = useRegion();
  
  // Calcular totales
  const totals = getTotals();
  const total = totals?.total || 0;
  
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
      router.push(`/${locale}/shop`);
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
        es: "Volver a la Tienda",
        en: "Back to Shop"
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
            onClick={() => router.push(`/${locale}/shop`)}
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
            onClick={() => router.push(`/${locale}/shop`)}
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

  // Pedir información del cliente antes de mostrar formulario
  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
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
          onClick={() => router.push(`/${locale}/shop`)}
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
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getText("reviewOrder")}
            </h2>
            <div className="space-y-4">
              {cart.map((item) => {
                const itemPrice = region ? getProductPrice(item.productType, region.currency, item.pricing) : 0;
                return (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.subtitle}</p>
                      <p className="text-sm">
                        Cantidad: {item.quantity} × {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: region?.currency || 'ARS',
                        }).format(itemPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="border-t pt-4">
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
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Continuar al Pago
                </Button>
              </form>
            ) : (
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                customerInfo={customerInfo}
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
        onContinueShopping={() => router.push(`/${locale}/shop`)}
      />
    </div>
  );
}
