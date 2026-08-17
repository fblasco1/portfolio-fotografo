/**
 * Reglas puras del flujo de transferencia manual (testeables sin Supabase/Resend).
 */

/** 3 MB — margen bajo el body limit ~4.5 MB de Vercel. */
export const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;

export const ALLOWED_RECEIPT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const UPLOADABLE_TRANSFER_STATUSES = new Set([
  "PENDING_TRANSFER",
  "pending",
]);

export function getTransferExpiryHours(): number {
  const raw = Number(process.env.TRANSFER_EXPIRY_HOURS || 48);
  return Number.isFinite(raw) && raw > 0 ? raw : 48;
}

export function isTransferOrderStale(
  createdAt: string,
  nowMs: number = Date.now(),
  expiryHours: number = getTransferExpiryHours()
): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return nowMs - created > expiryHours * 60 * 60 * 1000;
}

export function canUploadTransferReceipt(status: string): boolean {
  return UPLOADABLE_TRANSFER_STATUSES.has(status);
}

export function isTransferPaymentMethod(paymentMethod: string | null | undefined): boolean {
  return !paymentMethod || paymentMethod === "TRANSFER";
}

export function isManualTransferOrder(input: {
  status?: string | null;
  payment_method?: string | null;
  payment_method_id?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const method = String(input.payment_method || input.payment_method_id || "").toUpperCase();
  if (method === "TRANSFER") return true;
  if (input.status === "PENDING_TRANSFER" || input.status === "AWAITING_VERIFICATION") {
    return true;
  }
  return input.metadata?.payment_flow === "manual_transfer";
}

/** PAID solo después de que el cliente envió el comprobante. */
export function canAdminMarkOrderPaid(input: {
  status?: string | null;
  payment_method?: string | null;
  payment_method_id?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  return input.status === "AWAITING_VERIFICATION" && isManualTransferOrder(input);
}

/** Rechazar o reenviar mail de comprobante: orden de transferencia aún sin comprobante. */
export function canAdminActOnPendingTransfer(input: {
  status?: string | null;
  payment_method?: string | null;
  payment_method_id?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  if (!isManualTransferOrder(input)) return false;
  return input.status === "PENDING_TRANSFER" || input.status === "pending";
}

export type ReceiptValidationOk = { ok: true; mimeType: string };
export type ReceiptValidationErr = {
  ok: false;
  status: number;
  error: string;
  extra?: Record<string, unknown>;
};

export function validateReceiptFile(input: {
  orderId: string;
  file: { size: number; type: string; name?: string } | null;
}): ReceiptValidationOk | ReceiptValidationErr {
  if (!input.orderId.trim()) {
    return { ok: false, status: 400, error: "Falta order_id en el FormData." };
  }

  if (!input.file) {
    return {
      ok: false,
      status: 400,
      error: "Falta el archivo del comprobante (campo 'receipt').",
    };
  }

  if (!input.file.size) {
    return { ok: false, status: 400, error: "El archivo del comprobante está vacío." };
  }

  if (input.file.size > MAX_RECEIPT_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `El comprobante supera el límite de 3 MB (recibido: ${(
        input.file.size /
        (1024 * 1024)
      ).toFixed(2)} MB).`,
      extra: {
        maxBytes: MAX_RECEIPT_BYTES,
        hint: "Comprimí la imagen en el cliente (max ~1600px / JPEG 0.8) o subí un PDF más liviano.",
      },
    };
  }

  const mimeType = input.file.type || "application/octet-stream";
  if (!ALLOWED_RECEIPT_MIME_TYPES.has(mimeType)) {
    return {
      ok: false,
      status: 415,
      error: "Formato no permitido. Usá PDF, JPG, PNG o WEBP.",
      extra: { mimeType },
    };
  }

  return { ok: true, mimeType };
}
