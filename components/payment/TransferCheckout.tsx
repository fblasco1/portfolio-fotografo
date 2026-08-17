"use client";

import { useId, useState } from "react";
import { Check, FileUp, Upload } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { MAX_RECEIPT_BYTES, ALLOWED_RECEIPT_MIME_TYPES } from "@/lib/orders/transfer-rules";

export type TransferCustomerInfo = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street_name?: string;
    street_number?: string;
    city?: string;
    zip_code?: string;
    federal_unit?: string;
  };
};

export type TransferLineItem = {
  title: string;
  quantity: number;
  price: number;
};

type BankDetails = {
  cbu: string;
  alias: string;
  holder: string;
};

type Props = {
  locale: string;
  customerInfo: TransferCustomerInfo;
  items: TransferLineItem[];
  total: number;
  currency?: string;
  source: "photos" | "book";
  onError: (message: string) => void;
  onReceiptSent: (orderId: string) => void;
};

function copy(text: string) {
  return navigator.clipboard.writeText(text);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function TransferCheckout({
  locale,
  customerInfo,
  items,
  total,
  currency = "ARS",
  source,
  onError,
  onReceiptSent,
}: Props) {
  const es = locale === "es";
  const inputId = useId();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [receiptToken, setReceiptToken] = useState<string | null>(null);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(es ? "es-AR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const handleCreateOrder = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/checkout/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerInfo,
          items,
          totalAmount: total,
          currency,
          source,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo crear la orden");
      }
      setOrderId(data.orderId);
      setReceiptToken(typeof data.receiptToken === "string" ? data.receiptToken : null);
      setBank(data.bank);
      setEmailSent(Boolean(data.customerEmailSent));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al crear la orden");
    } finally {
      setCreating(false);
    }
  };

  const assignFile = (next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > MAX_RECEIPT_BYTES) {
      onError(
        es
          ? "El archivo supera 3 MB. Comprimí la imagen o usá un PDF más liviano."
          : "File exceeds 3 MB. Compress the image or use a smaller PDF."
      );
      return;
    }
    if (next.type && !ALLOWED_RECEIPT_MIME_TYPES.has(next.type)) {
      onError(es ? "Formato no permitido (PDF, JPG, PNG o WEBP)." : "Invalid file type.");
      return;
    }
    setFile(next);
  };

  const handleUpload = async () => {
    if (!orderId || !file) {
      onError(es ? "Primero elegí el archivo del comprobante." : "Please select a receipt file first.");
      return;
    }
    if (!receiptToken) {
      onError(
        es
          ? "Falta el token de la orden. Revisá el email con el link para subir el comprobante."
          : "Missing order token. Check the email with the upload link."
      );
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("order_id", orderId);
      form.append("token", receiptToken);
      form.append("receipt", file);
      const res = await fetch("/api/orders/receipt", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo enviar el comprobante");
      }
      onReceiptSent(orderId);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al subir el comprobante");
    } finally {
      setUploading(false);
    }
  };

  if (!orderId || !bank) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          {es
            ? "Vas a pagar por transferencia bancaria. Te mostramos CBU/alias y después subís el comprobante (máx. 3 MB)."
            : "You will pay by bank transfer. We will show CBU/alias, then upload your receipt (max 3 MB)."}
        </p>
        <p className="text-lg font-semibold">{formatMoney(total)}</p>
        <Button
          type="button"
          className="w-full bg-stone-800 hover:bg-stone-900 text-white"
          disabled={creating}
          onClick={handleCreateOrder}
        >
          {creating
            ? es
              ? "Generando orden…"
              : "Creating order…"
            : es
              ? "Generar orden y ver datos bancarios"
              : "Create order and show bank details"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ol className="space-y-1 text-sm text-stone-600">
        <li>
          <span className="font-semibold text-stone-900">1.</span>{" "}
          {es ? "Transferí el monto exacto." : "Transfer the exact amount."}
        </li>
        <li>
          <span className="font-semibold text-stone-900">2.</span>{" "}
          {es ? "Hacé clic en el recuadro para elegir el comprobante." : "Click the box to choose your receipt."}
        </li>
        <li>
          <span className="font-semibold text-stone-900">3.</span>{" "}
          {es ? "Enviá el archivo con el botón verde." : "Send the file with the green button."}
        </li>
      </ol>

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2 text-sm">
        <p className="font-semibold text-stone-900">
          {es ? "Datos para transferir" : "Transfer details"}
        </p>
        <p>
          <span className="text-stone-500">CBU</span>{" "}
          <button type="button" className="font-mono underline" onClick={() => copy(bank.cbu)}>
            {bank.cbu}
          </button>
        </p>
        <p>
          <span className="text-stone-500">Alias</span>{" "}
          <button type="button" className="font-mono underline" onClick={() => copy(bank.alias)}>
            {bank.alias}
          </button>
        </p>
        <p>
          <span className="text-stone-500">{es ? "Titular" : "Holder"}</span> {bank.holder}
        </p>
        <p className="text-lg font-bold pt-1">{formatMoney(total)}</p>
        <p className="text-xs text-stone-500">
          {es
            ? `Orden ${orderId}. Tenés 48 h para subir el comprobante.`
            : `Order ${orderId}. You have 48h to upload the receipt.`}
        </p>
        {emailSent && (
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-1.5 mt-2">
            {es
              ? "Te enviamos un email con estos datos y un link para subir el comprobante más tarde."
              : "We emailed you these details and a link to upload the receipt later."}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-stone-900">
          {es ? "2. Elegí el comprobante" : "2. Choose the receipt"}
        </p>
        <input
          id={inputId}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => assignFile(e.target.files?.[0] ?? null)}
        />
        <label
          htmlFor={inputId}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            file
              ? "border-green-600 bg-green-50"
              : "border-stone-400 bg-white hover:border-stone-800 hover:bg-stone-50"
          }`}
        >
          {file ? (
            <>
              <Check className="h-8 w-8 text-green-700" aria-hidden />
              <span className="font-medium text-stone-900">{file.name}</span>
              <span className="text-sm text-stone-600">{formatFileSize(file.size)}</span>
              <span className="text-sm font-medium text-stone-800 underline">
                {es ? "Hacé clic para cambiar el archivo" : "Click to change the file"}
              </span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-stone-700" aria-hidden />
              <span className="text-base font-semibold text-stone-900">
                {es ? "Hacé clic acá para elegir el archivo" : "Click here to choose the file"}
              </span>
              <span className="text-sm text-stone-600">
                {es
                  ? "PDF, JPG, PNG o WEBP · máximo 3 MB"
                  : "PDF, JPG, PNG or WEBP · max 3 MB"}
              </span>
            </>
          )}
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-stone-900">
          {es ? "3. Enviá el comprobante" : "3. Send the receipt"}
        </p>
        <Button
          type="button"
          className="w-full h-12 text-base bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          disabled={uploading || !file}
          onClick={handleUpload}
        >
          <FileUp className="mr-2 h-5 w-5" aria-hidden />
          {uploading
            ? es
              ? "Enviando comprobante…"
              : "Sending receipt…"
            : file
              ? es
                ? "Enviar comprobante ahora"
                : "Send receipt now"
              : es
                ? "Primero elegí un archivo"
                : "Choose a file first"}
        </Button>
      </div>
    </div>
  );
}
