"use client";

import { useEffect, useId, useState } from "react";
import { Check, FileUp, Upload } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { MAX_RECEIPT_BYTES, ALLOWED_RECEIPT_MIME_TYPES } from "@/lib/orders/transfer-rules";

type BankDetails = {
  cbu: string;
  alias: string;
  holder: string;
};

type Props = {
  locale: string;
  orderId: string;
  token: string;
};

function copy(text: string) {
  return navigator.clipboard.writeText(text);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ReceiptUploadForm({ locale, orderId, token }: Props) {
  const es = locale === "es";
  const inputId = useId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currency, setCurrency] = useState("ARS");
  const [expiryHours, setExpiryHours] = useState(48);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderId)}/receipt-info?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "No se pudo cargar la orden");
        }
        if (cancelled) return;
        setBank(data.bank);
        setTotalAmount(Number(data.totalAmount) || 0);
        setCurrency(data.currency || "ARS");
        setExpiryHours(Number(data.expiryHours) || 48);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar la orden");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, token]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(es ? "es-AR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const assignFile = (next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > MAX_RECEIPT_BYTES) {
      setError(
        es
          ? "El archivo supera 3 MB. Comprimí la imagen o usá un PDF más liviano."
          : "File exceeds 3 MB. Compress the image or use a smaller PDF."
      );
      return;
    }
    if (next.type && !ALLOWED_RECEIPT_MIME_TYPES.has(next.type)) {
      setError(es ? "Formato no permitido (PDF, JPG, PNG o WEBP)." : "Invalid file type.");
      return;
    }
    setError(null);
    setFile(next);
  };

  const handleUpload = async () => {
    if (!file) {
      setError(es ? "Primero elegí el archivo del comprobante." : "Please select a receipt file first.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("order_id", orderId);
      form.append("token", token);
      form.append("receipt", file);
      const res = await fetch("/api/orders/receipt", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo enviar el comprobante");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir el comprobante");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center space-y-2">
        <Check className="mx-auto h-10 w-10 text-green-700" />
        <h2 className="text-xl font-semibold text-stone-900">
          {es ? "Comprobante enviado" : "Receipt sent"}
        </h2>
        <p className="text-sm text-stone-700">
          {es
            ? "Recibimos tu archivo. Vamos a verificar el pago y te contactamos."
            : "We received your file. We will verify the payment and contact you."}
        </p>
      </div>
    );
  }

  if (error && !bank) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!bank) return null;

  return (
    <div className="space-y-5">
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
        <p className="text-lg font-bold pt-1">{formatMoney(totalAmount)}</p>
        <p className="text-xs text-stone-500 break-all">
          {es
            ? `Orden ${orderId}. Tenés ${expiryHours} h para subir el comprobante.`
            : `Order ${orderId}. You have ${expiryHours}h to upload the receipt.`}
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-semibold text-stone-900">
          {es ? "Elegí el comprobante" : "Choose the receipt"}
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
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-stone-700" aria-hidden />
              <span className="text-base font-semibold text-stone-900">
                {es ? "Hacé clic acá para elegir el archivo" : "Click here to choose the file"}
              </span>
              <span className="text-sm text-stone-600">
                {es ? "PDF, JPG, PNG o WEBP · máximo 3 MB" : "PDF, JPG, PNG or WEBP · max 3 MB"}
              </span>
            </>
          )}
        </label>
      </div>

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
  );
}
