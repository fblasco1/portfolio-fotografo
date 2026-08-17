/**
 * POST /api/checkout/transfer
 * Crea una orden PENDING_TRANSFER, envía email al cliente con link de comprobante,
 * y devuelve CBU/alias + order_id.
 */

import { NextRequest, NextResponse } from "next/server";

import { sendCustomerTransferInstructionsEmail } from "@/lib/email/transfer-receipt.service";
import {
  getMerchantBankDetails,
  validateTransferCheckoutInput,
} from "@/lib/orders/bank-details";
import { createTransferOrder } from "@/lib/orders/supabase-orders";
import { buildReceiptUploadUrl } from "@/lib/orders/receipt-link";
import { getTransferExpiryHours } from "@/lib/orders/transfer-rules";

export const runtime = "nodejs";

type Address = {
  street_name?: string;
  street_number?: string;
  city?: string;
  zip_code?: string;
  federal_unit?: string;
};

type Body = {
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: Address;
  };
  items?: Array<{ title?: string; quantity?: number; price?: number }>;
  totalAmount?: number;
  currency?: string;
  source?: "photos" | "book";
  locale?: string;
};

export async function POST(request: NextRequest) {
  try {
    const bank = getMerchantBankDetails();
    if (!bank) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan datos bancarios (MERCHANT_CBU, MERCHANT_ALIAS, MERCHANT_BANK_HOLDER).",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as Body;
    const locale = body.locale === "en" ? "en" : "es";
    const items = (body.items || [])
      .filter((i) => i.title && Number(i.quantity) > 0)
      .map((i) => ({
        title: String(i.title),
        quantity: Number(i.quantity) || 1,
        price: Number(i.price) || 0,
      }));

    const email = body.customer?.email?.trim() || "";
    const totalAmount = Number(body.totalAmount);
    const validation = validateTransferCheckoutInput({
      email,
      firstName: body.customer?.firstName,
      lastName: body.customer?.lastName,
      totalAmount,
      items,
    });

    if (!validation.ok) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const customerName = [body.customer?.firstName, body.customer?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const created = await createTransferOrder({
      customerEmail: email,
      customerName: customerName || null,
      customerPhone: body.customer?.phone || null,
      totalAmount,
      currency: body.currency || "ARS",
      items,
      shippingAddress: body.customer?.address
        ? {
            street_name: body.customer.address.street_name || "",
            street_number: body.customer.address.street_number || "",
            city: body.customer.address.city || "",
            zip_code: body.customer.address.zip_code || "",
            federal_unit: body.customer.address.federal_unit || "",
          }
        : null,
      payer: {
        email,
        first_name: body.customer?.firstName || "",
        last_name: body.customer?.lastName || "",
        name: customerName,
        phone: body.customer?.phone || "",
        address: body.customer?.address || {},
      },
      source: body.source === "book" ? "book" : "photos",
    });

    if (!created.ok) {
      return NextResponse.json({ success: false, error: created.error }, { status: 500 });
    }

    const expiryHours = getTransferExpiryHours();
    const receiptUrl = buildReceiptUploadUrl(created.orderId, created.receiptToken, locale);

    const emailResult = await sendCustomerTransferInstructionsEmail({
      toEmail: email,
      customerName: customerName || null,
      orderId: created.orderId,
      totalAmount,
      currency: body.currency || "ARS",
      bank,
      receiptUrl,
      expiryHours,
      locale,
    });

    if (!emailResult.ok) {
      console.error(
        "⚠️ Orden creada pero falló email al cliente:",
        emailResult.error,
        "orderId=",
        created.orderId
      );
    }

    return NextResponse.json({
      success: true,
      orderId: created.orderId,
      receiptToken: created.receiptToken,
      status: "PENDING_TRANSFER",
      totalAmount,
      currency: body.currency || "ARS",
      bank,
      expiryHours,
      customerEmailSent: emailResult.ok,
      instructions:
        "Transferí el monto exacto y subí el comprobante. Tenés 48 horas. También te enviamos un email con el link para subir el comprobante más tarde.",
    });
  } catch (err) {
    console.error("❌ /api/checkout/transfer:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Error al crear la orden de transferencia",
      },
      { status: 500 }
    );
  }
}
