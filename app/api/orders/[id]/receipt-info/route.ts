/**
 * GET /api/orders/[id]/receipt-info?token=...
 * Datos públicos mínimos para recuperar una orden PENDING_TRANSFER y subir el comprobante.
 */

import { NextRequest, NextResponse } from "next/server";

import { getMerchantBankDetails } from "@/lib/orders/bank-details";
import { expireTransferOrderIfStale } from "@/lib/orders/supabase-orders";
import {
  canUploadTransferReceipt,
  getTransferExpiryHours,
} from "@/lib/orders/transfer-rules";
import { supabaseAdmin } from "@/lib/supabase/client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.nextUrl.searchParams.get("token")?.trim() || "";

    if (!id || !token) {
      return NextResponse.json(
        { success: false, error: "Faltan order id o token." },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, status, total_amount, currency, customer_email, customer_name, created_at, metadata, payment_method"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("❌ receipt-info:", error);
      return NextResponse.json(
        { success: false, error: "No se pudo cargar la orden." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada." },
        { status: 404 }
      );
    }

    const storedToken =
      typeof (order.metadata as Record<string, unknown> | null)?.receipt_token ===
      "string"
        ? String((order.metadata as Record<string, unknown>).receipt_token)
        : "";

    if (!storedToken || storedToken !== token) {
      return NextResponse.json(
        { success: false, error: "Token inválido." },
        { status: 403 }
      );
    }

    if (order.status === "PENDING_TRANSFER") {
      const expiredNow = await expireTransferOrderIfStale(order.id, order.created_at);
      if (expiredNow) {
        return NextResponse.json(
          {
            success: false,
            error: "La orden expiró: no se recibió comprobante a tiempo.",
            status: "EXPIRED",
          },
          { status: 410 }
        );
      }
    }

    if (!canUploadTransferReceipt(order.status)) {
      return NextResponse.json(
        {
          success: false,
          error:
            order.status === "AWAITING_VERIFICATION"
              ? "Ya recibimos un comprobante. Está en verificación."
              : `No se puede subir comprobante (estado: ${order.status}).`,
          status: order.status,
        },
        { status: 409 }
      );
    }

    const bank = getMerchantBankDetails();
    if (!bank) {
      return NextResponse.json(
        { success: false, error: "Datos bancarios no configurados." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
      totalAmount: order.total_amount,
      currency: order.currency || "ARS",
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      createdAt: order.created_at,
      expiryHours: getTransferExpiryHours(),
      bank,
    });
  } catch (err) {
    console.error("❌ /api/orders/[id]/receipt-info:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Error interno",
      },
      { status: 500 }
    );
  }
}
