/**
 * POST /api/orders/expire-pending-transfers
 *
 * Marca como EXPIRED las órdenes PENDING_TRANSFER sin comprobante
 * con más de 48h (TRANSFER_EXPIRY_HOURS).
 *
 * Pensado para Vercel Cron (vercel.json) o invocación manual protegida.
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";

import { expirePendingTransferOrders } from "@/lib/orders/supabase-orders";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // En desarrollo permitir sin secret; en prod exigir CRON_SECRET
    return process.env.NODE_ENV !== "production";
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  // Vercel Cron usa GET por defecto
  return runExpire(request);
}

export async function POST(request: NextRequest) {
  return runExpire(request);
}

async function runExpire(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await expirePendingTransferOrders();
    return NextResponse.json({
      success: true,
      expiredCount: result.expiredCount,
      orderIds: result.orderIds,
      cutoff: result.cutoffIso,
    });
  } catch (err) {
    console.error("❌ expire-pending-transfers:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Error al expirar órdenes",
      },
      { status: 500 }
    );
  }
}
