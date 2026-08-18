import { ReceiptUploadForm } from "@/components/payment/ReceiptUploadForm";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function OrderReceiptPage({ params, searchParams }: PageProps) {
  const { locale, id } = await params;
  const { token } = await searchParams;
  const es = locale === "es";

  if (!token?.trim()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 px-4 pt-32 pb-16">
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h1 className="text-xl font-semibold mb-2">
            {es ? "Enlace incompleto" : "Incomplete link"}
          </h1>
          <p className="text-sm">
            {es
              ? "Falta el token del email. Abrí el enlace completo que te enviamos al crear la orden."
              : "Missing token. Open the full link from the email we sent when you created the order."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 px-4 pt-32 pb-16">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {es ? "Subir comprobante de pago" : "Upload payment receipt"}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {es
              ? "Recuperaste tu orden pendiente. Transferí el monto exacto y subí el comprobante cuando puedas."
              : "You recovered your pending order. Transfer the exact amount and upload the receipt when ready."}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <ReceiptUploadForm locale={locale} orderId={id} token={token.trim()} />
        </div>
      </div>
    </div>
  );
}
