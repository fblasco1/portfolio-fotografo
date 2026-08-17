/**
 * POST /api/orders/receipt
 *
 * Flujo serverless (Vercel):
 * 1) Recibe FormData con `order_id` + archivo `receipt`
 * 2) Valida tamaño ≤ 3 MB (margen bajo el límite ~4.5 MB del body en Vercel)
 * 3) Lee el archivo en memoria (Buffer) — NO se guarda en Storage ni DB
 * 4) Envía el comprobante como adjunto al admin vía Resend
 * 5) Si el email OK → actualiza la orden a AWAITING_VERIFICATION
 *
 * --- Frontend (importante) ---
 * - Usar <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" />
 * - Validar `file.size <= 3 * 1024 * 1024` ANTES de enviar (mejor UX).
 * - Si el usuario elige una foto de celular > 3 MB, comprimir en el cliente
 *   (p. ej. browser-image-compression / canvas) a JPEG ~0.8 calidad / maxWidth 1600
 *   antes del FormData.append("receipt", blob, filename).
 * - PDFs: no comprimir en browser; pedir al usuario un archivo más liviano.
 * - Enviar con fetch(..., { method: "POST", body: formData }) SIN Content-Type manual
 *   (el browser setea el boundary multipart).
 */

import { NextRequest, NextResponse } from "next/server";

import { sendTransferReceiptEmail } from "@/lib/email/transfer-receipt.service";
import {
  expireTransferOrderIfStale,
  markOrderAwaitingVerification,
} from "@/lib/orders/supabase-orders";
import {
  canUploadTransferReceipt,
  validateReceiptFile,
} from "@/lib/orders/transfer-rules";
import { supabaseAdmin } from "@/lib/supabase/client";

export const runtime = "nodejs";

type OrderRow = {
  id: string;
  status: string;
  total_amount: number | null;
  currency: string | null;
  customer_email: string | null;
  customer_name: string | null;
  created_at: string;
};

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const orderIdRaw = formData.get("order_id");
    const orderId =
      typeof orderIdRaw === "string" ? orderIdRaw.trim() : "";

    // Campo esperado: "receipt". Alias "file" / "comprobante" por compatibilidad.
    const receiptEntry =
      formData.get("receipt") ?? formData.get("file") ?? formData.get("comprobante");

    const fileForValidation =
      receiptEntry instanceof File
        ? { size: receiptEntry.size, type: receiptEntry.type, name: receiptEntry.name }
        : null;

    const validation = validateReceiptFile({ orderId, file: fileForValidation });
    if (!validation.ok) {
      return jsonError(validation.error, validation.status, validation.extra);
    }

    const mimeType = validation.mimeType;
    const receiptFile = receiptEntry as File;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, status, total_amount, currency, customer_email, customer_name, created_at")
      .eq("id", orderId)
      .maybeSingle<OrderRow>();

    if (orderError) {
      console.error("❌ Error leyendo orden:", orderError);
      return jsonError("No se pudo verificar la orden.", 500);
    }

    if (!order) {
      return jsonError(`Orden ${orderId} no encontrada.`, 404);
    }

    if (order.status === "EXPIRED") {
      return jsonError(
        "La orden expiró: no se recibió comprobante dentro de las 48 horas.",
        410
      );
    }

    if (!canUploadTransferReceipt(order.status)) {
      return jsonError(
        `No se puede subir comprobante: la orden está en estado '${order.status}'.`,
        409
      );
    }

    // Defensa en profundidad: si el cron aún no corrió, expirar al momento
    if (order.status === "PENDING_TRANSFER") {
      const expiredNow = await expireTransferOrderIfStale(order.id, order.created_at);
      if (expiredNow) {
        return jsonError(
          "La orden expiró: no se recibió comprobante dentro de las 48 horas.",
          410
        );
      }
    }

    // Procesamiento en memoria (sin escribir a disco ni Storage)
    const arrayBuffer = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename =
      receiptFile.name?.trim() ||
      `comprobante-${orderId}.${mimeType === "application/pdf" ? "pdf" : "jpg"}`;

    const emailResult = await sendTransferReceiptEmail({
      orderId: order.id,
      totalAmount: order.total_amount,
      currency: order.currency,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      attachment: {
        filename,
        content: buffer,
        mimeType,
      },
    });

    if (!emailResult.ok) {
      return jsonError(
        `No se pudo enviar el comprobante por email: ${emailResult.error}`,
        502
      );
    }

    // Solo después de un envío exitoso actualizamos el estado
    const updateResult = await markOrderAwaitingVerification(order.id);
    if (!updateResult.ok) {
      console.error(
        "⚠️ Email enviado pero falló update de orden:",
        updateResult.error,
        "emailId=",
        emailResult.emailId
      );
      return jsonError(
        "El comprobante se envió por email, pero no se pudo actualizar el estado de la orden. Contactá al administrador.",
        500,
        { emailId: emailResult.emailId }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: "AWAITING_VERIFICATION",
      emailId: emailResult.emailId,
      message:
        "Comprobante enviado al administrador. La orden quedó en verificación manual.",
    });
  } catch (err) {
    console.error("❌ Error en /api/orders/receipt:", err);
    return jsonError(
      err instanceof Error ? err.message : "Error interno al procesar el comprobante.",
      500
    );
  }
}
