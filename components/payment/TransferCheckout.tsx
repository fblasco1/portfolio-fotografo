"use client";

import { useState } from "react";
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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [bank, setBank] = useState<BankDetails | null>(null);
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
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo crear la orden");
      }
      setOrderId(data.orderId);
      setBank(data.bank);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al crear la orden");
    } finally {
      setCreating(false);
    }
  };

  const handleUpload = async () => {
    if (!orderId || !file) {
      onError(es ? "Seleccioná un comprobante." : "Please select a receipt file.");
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      onError(
        es
          ? "El archivo supera 3 MB. Comprimí la imagen o usá un PDF más liviano."
          : "File exceeds 3 MB. Compress the image or use a smaller PDF."
      );
      return;
    }
    if (file.type && !ALLOWED_RECEIPT_MIME_TYPES.has(file.type)) {
      onError(es ? "Formato no permitido (PDF, JPG, PNG o WEBP)." : "Invalid file type.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("order_id", orderId);
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
    <div className="space-y-4">
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2 text-sm">
        <p className="font-semibold text-stone-900">
          {es ? "Transferí el monto exacto" : "Transfer the exact amount"}
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
      </div>

      <div>
        <label htmlFor="receipt" className="block text-sm font-medium mb-2">
          {es ? "Comprobante (PDF o imagen, máx. 3 MB)" : "Receipt (PDF or image, max 3 MB)"}
        </label>
        <input
          id="receipt"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="w-full text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <Button
        type="button"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={uploading || !file}
        onClick={handleUpload}
      >
        {uploading
          ? es
            ? "Enviando…"
            : "Sending…"
          : es
            ? "Enviar comprobante"
            : "Send receipt"}
      </Button>
    </div>
  );
}
