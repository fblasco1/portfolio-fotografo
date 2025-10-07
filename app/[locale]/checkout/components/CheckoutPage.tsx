"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useRegion } from '@/hooks/useRegion';
import { OrderSummary, CheckoutForm } from '../../../../components/payment';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface CheckoutPageProps {
  locale: string;
}

export default function CheckoutPage({ locale }: CheckoutPageProps) {
  const router = useRouter();
  const { items: cart, getTotalItems, isEmpty } = useCart();
  const { region, loading: regionLoading } = useRegion();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

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

  // Convertir items del carrito al formato esperado por OrderSummary
  const convertCartItems = () => {
    return cart.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      image: item.image,
      productType: item.productType,
      quantity: item.quantity,
      pricing: item.pricing // Incluir precios por región desde Sanity
    }));
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resumen del pedido */}
        <div className="order-2 lg:order-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {getText("reviewOrder")}
          </h2>
          <OrderSummary
            items={convertCartItems()}
            region={region}
            locale={locale}
            showCheckoutButton={false}
          />
        </div>

        {/* Formulario de checkout */}
        <div className="order-1 lg:order-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {getText("proceedToPayment")}
          </h2>
          <CheckoutForm
            items={convertCartItems()}
            onClose={() => router.push(`/${locale}/shop`)}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
