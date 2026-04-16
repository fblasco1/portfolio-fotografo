"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegion } from "@/contexts/RegionContext";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { PaymentResultModal } from "@/components/payment/PaymentResultModal";
import { Button } from "@/app/[locale]/components/ui/button";
import { Card } from "@/app/[locale]/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  readBookCheckoutSession,
  clearBookCheckoutSession,
  type BookCheckoutSession,
} from "@/lib/book-checkout-session";

interface BookCheckoutPageProps {
  locale: string;
}

export default function BookCheckoutPage({ locale }: BookCheckoutPageProps) {
  const router = useRouter();
  const { region, loading: regionLoading } = useRegion();
  const [session, setSession] = useState<BookCheckoutSession | null | undefined>(undefined);
  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "approved" | "pending" | "rejected" | "in_process" | "cancelled" | null
  >(null);
  const [paymentId, setPaymentId] = useState<number | string | undefined>();
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: {
      street_name: "",
      street_number: "",
      city: "",
      zip_code: "",
      federal_unit: "",
    },
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const data = readBookCheckoutSession();
    if (!data) {
      router.replace(`/${locale}/book`);
      return;
    }
    setSession(data);
  }, [locale, router]);

  const getText = (key: string): string => {
    const texts: Record<string, { es: string; en: string }> = {
      title: { es: "Preventa del libro", en: "Book pre-sale" },
      back: { es: "Volver al libro", en: "Back to book" },
      review: { es: "Tu pedido", en: "Your order" },
      regionNotSupported: { es: "Región no soportada", en: "Unsupported region" },
      regionMessage: {
        es: "Solo admitimos pagos en Latinoamérica. Elige un país de la región para continuar.",
        en: "We only support payments in Latin America. Pick a country from the region to continue.",
      },
    };
    return texts[key]?.[locale as "es" | "en"] || texts[key]?.es || "";
  };

  if (session === undefined || regionLoading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600" />
        </div>
      </div>
    );
  }

  if (!region || !region.isSupported) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{getText("regionNotSupported")}</h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{getText("regionMessage")}</p>
          <Button variant="outline" onClick={() => router.push(`/${locale}/book`)}>
            <ArrowLeft size={16} className="mr-2" />
            {getText("back")}
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const qty = session.quantity;
  const total = session.unitPriceLocal * qty;

  const paymentLineItems = [
    {
      id: session.bookId,
      title: session.title,
      quantity: qty,
      productType: "book" as const,
    },
  ];

  const handlePaymentSuccess = (id: number | string, status: string) => {
    if (status === "approved") {
      clearBookCheckoutSession();
    }
    setPaymentId(id);
    setPaymentStatus(
      status as "approved" | "pending" | "rejected" | "in_process" | "cancelled"
    );
    setShowResultModal(true);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setTimeout(() => setPaymentError(null), 5000);
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    setCustomerInfo({
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      address: {
        street_name: formData.get("street_name") as string,
        street_number: formData.get("street_number") as string,
        city: formData.get("city") as string,
        zip_code: formData.get("zip_code") as string,
        federal_unit: formData.get("federal_unit") as string,
      },
    });
    setShowPaymentForm(true);
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/${locale}/book`)}>
          <ArrowLeft size={16} className="mr-2" />
          {getText("back")}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{getText("title")}</h1>
      </div>

      {paymentError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{paymentError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="order-2 lg:order-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{getText("review")}</h2>
            <div className="flex gap-4 border-b pb-4">
              <img
                src={session.image}
                alt={session.title}
                className="w-24 h-32 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium text-lg">{session.title}</h3>
                <p className="text-sm text-gray-600">{session.subtitle}</p>
                <p className="text-sm font-medium text-stone-700 mt-2">
                  {locale === "es" ? "Preventa" : "Pre-sale"}
                </p>
                <p className="text-sm mt-1">
                  {locale === "es" ? "Cantidad" : "Quantity"}: {qty}
                </p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4 flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR", {
                  style: "currency",
                  currency: region.currency,
                }).format(total)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {locale === "es"
                ? "* Envío e IVA se acordarán con el vendedor después del pago"
                : "* Shipping and taxes will be arranged with the seller after payment"}
            </p>
          </Card>
        </div>

        <div className="order-1 lg:order-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {showPaymentForm
                ? locale === "es"
                  ? "Datos de pago"
                  : "Payment details"
                : locale === "es"
                  ? "Datos de contacto"
                  : "Contact details"}
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
                    onChange={(e) => setCustomerInfo((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    {locale === "es" ? "Nombre" : "First name"}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    {locale === "es" ? "Apellido" : "Last name"}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    {locale === "es" ? "Teléfono" : "Phone"}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="street_name" className="block text-sm font-medium mb-2">
                      {locale === "es" ? "Calle" : "Street"}
                    </label>
                    <input
                      type="text"
                      id="street_name"
                      name="street_name"
                      required
                      value={customerInfo.address.street_name}
                      onChange={(e) =>
                        setCustomerInfo((p) => ({
                          ...p,
                          address: { ...p.address, street_name: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="street_number" className="block text-sm font-medium mb-2">
                      {locale === "es" ? "Número" : "Number"}
                    </label>
                    <input
                      type="text"
                      id="street_number"
                      name="street_number"
                      required
                      value={customerInfo.address.street_number}
                      onChange={(e) =>
                        setCustomerInfo((p) => ({
                          ...p,
                          address: { ...p.address, street_number: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-2">
                      {locale === "es" ? "Ciudad" : "City"}
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={customerInfo.address.city}
                      onChange={(e) =>
                        setCustomerInfo((p) => ({
                          ...p,
                          address: { ...p.address, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="zip_code" className="block text-sm font-medium mb-2">
                      {locale === "es" ? "Código postal" : "Zip code"}
                    </label>
                    <input
                      type="text"
                      id="zip_code"
                      name="zip_code"
                      required
                      value={customerInfo.address.zip_code}
                      onChange={(e) =>
                        setCustomerInfo((p) => ({
                          ...p,
                          address: { ...p.address, zip_code: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="federal_unit" className="block text-sm font-medium mb-2">
                    {locale === "es" ? "Provincia / estado" : "State / province"}
                  </label>
                  <input
                    type="text"
                    id="federal_unit"
                    name="federal_unit"
                    required
                    value={customerInfo.address.federal_unit}
                    onChange={(e) =>
                      setCustomerInfo((p) => ({
                        ...p,
                        address: { ...p.address, federal_unit: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  {locale === "es" ? "Continuar al pago" : "Continue to payment"}
                </Button>
              </form>
            ) : (
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                customerInfo={customerInfo}
                total={total}
                paymentLineItems={paymentLineItems}
              />
            )}
          </Card>
        </div>
      </div>

      <PaymentResultModal
        isOpen={showResultModal}
        status={paymentStatus}
        paymentId={paymentId}
        onClose={() => setShowResultModal(false)}
        onGoHome={() => router.push(`/${locale}`)}
        onContinueShopping={() => router.push(`/${locale}/book`)}
      />
    </div>
  );
}
