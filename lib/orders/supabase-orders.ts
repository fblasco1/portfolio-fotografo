/**
 * Persistencia de órdenes en Supabase
 * Se guarda al crear la orden (info del cliente/payer que no se puede obtener de la API de MP)
 * Los webhooks actualizan el estado
 */

import { randomBytes } from 'crypto';

import { sendCustomerTransferInstructionsEmail } from '@/lib/email/transfer-receipt.service';
import { getMerchantBankDetails } from '@/lib/orders/bank-details';
import { buildReceiptUploadUrl } from '@/lib/orders/receipt-link';
import {
  canAdminActOnPendingTransfer,
  canAdminMarkOrderPaid,
  getTransferExpiryHours,
  isTransferOrderStale,
  isTransferPaymentMethod,
} from '@/lib/orders/transfer-rules';
import { supabaseAdmin } from '@/lib/supabase/client';

function mapMPStatusToOrderStatus(status: string): string {
  if (status === 'processed') return 'approved';
  if (status === 'refunded') return 'refunded';
  if (status === 'canceled' || status === 'cancelled') return 'cancelled';
  if (status === 'failed' || status === 'expired') return 'rejected';
  return 'pending';
}

export interface SaveOrderAtCreationParams {
  order: {
    id: string;
    status: string;
    total_amount?: string | number;
    currency_id?: string;
    currency?: string;
    date_created?: string;
    last_updated_date?: string;
    external_reference?: string;
    transactions?: { payments?: Array<{
      id?: string | number;
      status?: string;
      status_detail?: string;
      amount?: string | number;
      transaction_amount?: number;
      date_approved?: string;
      payment_method?: { id?: string; installments?: number };
    }> };
  };
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: { area_code?: string; number?: string };
    identification?: { type?: string; number?: string };
    address?: Record<string, string>;
  };
  items: Array<{ title: string; quantity: number; price: number; unit_price?: number }>;
}

/**
 * Persiste la orden en Supabase al momento de crearla.
 * Guarda la información del pagador que no se puede obtener después de la API de MP.
 */
export async function saveOrderAtCreation(params: SaveOrderAtCreationParams): Promise<void> {
  try {
    const { order, payer, items } = params;
    const payment = order.transactions?.payments?.[0];

    const payerObj = payer ? {
      email: payer.email,
      first_name: payer.first_name ?? '',
      last_name: payer.last_name ?? '',
      name: [payer.first_name, payer.last_name].filter(Boolean).join(' ') || null,
      phone: payer.phone,
      identification: payer.identification,
      address: payer.address,
    } : null;

    const orderData = {
      mercadopago_order_id: order.id,
      payment_id: payment?.id?.toString() || null,
      status: mapMPStatusToOrderStatus(order.status || 'pending'),
      status_detail: payment?.status_detail || null,
      total_amount: parseFloat(String(order.total_amount || 0)) || 0,
      currency: order.currency_id || order.currency || 'ARS',
      payment_method_id: payment?.payment_method?.id || null,
      installments: payment?.payment_method?.installments ?? 1,
      customer_email: payer?.email || '',
      customer_name: payerObj?.name || '',
      customer_phone: payer?.phone?.number
        ? `${payer.phone.area_code || ''}${payer.phone.number}`.trim() || null
        : null,
      shipping_address: payer?.address || null,
      payer: payerObj || {},
      payment_info: payment ? {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount ?? payment.amount ?? order.total_amount,
        amount: payment.amount ?? payment.transaction_amount ?? order.total_amount,
        date_approved: payment.date_approved,
        payment_method: payment.payment_method,
      } : {},
      items: items.map((item) => {
        const rawPrice = item.price ?? (item.unit_price ? item.unit_price * item.quantity : 0);
        return {
          title: item.title,
          quantity: item.quantity,
          price: parseFloat(Number(rawPrice).toFixed(2)),
        };
      }),
      metadata: {
        external_reference: order.external_reference || `order_${order.id}`,
        mercadopago_order_id: order.id,
        mercadopago_payment_id: payment?.id,
        date_created: order.date_created,
        date_last_updated: order.last_updated_date,
      },
    };

    const { data: insertedOrder, error } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error guardando orden al crear:', error);
      return;
    }

    const orderStatus = mapMPStatusToOrderStatus(order.status || 'pending');
    if (insertedOrder?.id) {
      const { error: historyError } = await supabaseAdmin
        .from('order_status_history')
        .insert({
          order_id: insertedOrder.id,
          status: orderStatus,
          status_detail: payment?.status_detail || null,
          notes: 'Estado inicial al crear la orden',
        });
      if (historyError) {
        console.error('❌ Error guardando historial inicial:', historyError);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Orden persistida en Supabase al crear:', order.id);
    }
  } catch (err) {
    console.error('❌ Error persistiendo orden:', err);
  }
}

export type CreateTransferOrderParams = {
  customerEmail: string;
  customerName?: string | null;
  customerPhone?: string | null;
  totalAmount: number;
  currency?: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  shippingAddress?: Record<string, string> | null;
  payer?: Record<string, unknown> | null;
  source?: 'photos' | 'book';
};

export type CreateTransferOrderResult =
  | { ok: true; orderId: string; receiptToken: string }
  | { ok: false; error: string };

export async function createTransferOrder(
  params: CreateTransferOrderParams
): Promise<CreateTransferOrderResult> {
  const now = new Date().toISOString();
  const receiptToken = randomBytes(32).toString('hex');
  const orderData = {
    customer_email: params.customerEmail,
    customer_name: params.customerName || null,
    customer_phone: params.customerPhone || null,
    status: 'PENDING_TRANSFER',
    payment_method: 'TRANSFER',
    payment_method_id: 'TRANSFER',
    status_detail: 'awaiting_bank_transfer',
    total_amount: params.totalAmount,
    currency: params.currency || 'ARS',
    items: params.items,
    shipping_address: params.shippingAddress || null,
    payer: params.payer || {},
    metadata: {
      source: params.source || 'photos',
      payment_flow: 'manual_transfer',
      receipt_token: receiptToken,
    },
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert(orderData)
    .select('id')
    .single();

  if (error || !data?.id) {
    console.error('❌ Error creando orden de transferencia:', error);
    return { ok: false, error: error?.message || 'No se pudo crear la orden' };
  }

  const { error: historyError } = await supabaseAdmin.from('order_status_history').insert({
    order_id: data.id,
    status: 'PENDING_TRANSFER',
    status_detail: 'awaiting_bank_transfer',
    notes: 'Orden creada: transferencia bancaria manual',
  });

  if (historyError) {
    console.error('⚠️ Error guardando historial inicial de transferencia:', historyError);
  }

  return { ok: true, orderId: data.id, receiptToken };
}

export type MarkOrderAwaitingVerificationResult =
  | { ok: true }
  | { ok: false; error: string; notFound?: boolean; conflict?: boolean };

/**
 * Marca una orden de transferencia como AWAITING_VERIFICATION
 * después de enviar el comprobante por email.
 */
export async function markOrderAwaitingVerification(
  orderId: string
): Promise<MarkOrderAwaitingVerificationResult> {
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();

  if (fetchError) {
    console.error('❌ Error buscando orden:', fetchError);
    return { ok: false, error: fetchError.message };
  }

  if (!order) {
    return { ok: false, error: 'Orden no encontrada', notFound: true };
  }

  const allowed = new Set(['PENDING_TRANSFER', 'pending']);
  if (!allowed.has(order.status)) {
    return {
      ok: false,
      error: `Estado inválido para comprobante: ${order.status}`,
      conflict: true,
    };
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'AWAITING_VERIFICATION',
      payment_method: 'TRANSFER',
      status_detail: 'receipt_emailed_to_admin',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('❌ Error actualizando orden a AWAITING_VERIFICATION:', updateError);
    return { ok: false, error: updateError.message };
  }

  const { error: historyError } = await supabaseAdmin
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: 'AWAITING_VERIFICATION',
      status_detail: 'receipt_emailed_to_admin',
      notes: 'Comprobante enviado por email al administrador (sin almacenamiento)',
    });

  if (historyError) {
    // No bloqueamos el flujo si falla el historial
    console.error('⚠️ Error guardando historial de estado:', historyError);
  }

  return { ok: true };
}

export type ExpirePendingTransfersResult = {
  expiredCount: number;
  orderIds: string[];
  cutoffIso: string;
};

/**
 * Expira órdenes de transferencia PENDING_TRANSFER sin comprobante
 * cuya created_at sea anterior al umbral (default 48h).
 * No toca órdenes de Mercado Pago (`pending` / sin payment_method TRANSFER).
 */
export async function expirePendingTransferOrders(): Promise<ExpirePendingTransfersResult> {
  const expiryHours = getTransferExpiryHours();
  const cutoff = new Date(Date.now() - expiryHours * 60 * 60 * 1000);
  const cutoffIso = cutoff.toISOString();

  const { data: candidates, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status, payment_method, created_at')
    .eq('status', 'PENDING_TRANSFER')
    .lt('created_at', cutoffIso);

  if (fetchError) {
    console.error('❌ Error buscando órdenes a expirar:', fetchError);
    throw new Error(fetchError.message);
  }

  const toExpire = (candidates || []).filter((row) =>
    isTransferPaymentMethod(row.payment_method)
  );

  if (toExpire.length === 0) {
    return { expiredCount: 0, orderIds: [], cutoffIso };
  }

  const orderIds = toExpire.map((o) => o.id);
  const nowIso = new Date().toISOString();

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'EXPIRED',
      status_detail: 'transfer_timeout_48h',
      updated_at: nowIso,
    })
    .in('id', orderIds)
    .eq('status', 'PENDING_TRANSFER');

  if (updateError) {
    console.error('❌ Error expirando órdenes:', updateError);
    throw new Error(updateError.message);
  }

  const historyRows = orderIds.map((orderId) => ({
    order_id: orderId,
    status: 'EXPIRED',
    status_detail: 'transfer_timeout_48h',
    notes: `Orden expirada: sin comprobante en ${expiryHours}h`,
  }));

  const { error: historyError } = await supabaseAdmin
    .from('order_status_history')
    .insert(historyRows);

  if (historyError) {
    console.error('⚠️ Error guardando historial de expiración:', historyError);
  }

  return { expiredCount: orderIds.length, orderIds, cutoffIso };
}

/**
 * Si la orden PENDING_TRANSFER ya superó las 48h, la marca EXPIRED y retorna true.
 * Útil al intentar subir comprobante tarde (sin depender solo del cron).
 */
export async function expireTransferOrderIfStale(
  orderId: string,
  createdAt: string
): Promise<boolean> {
  if (!isTransferOrderStale(createdAt)) return false;

  const expiryHours = getTransferExpiryHours();

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'EXPIRED',
      status_detail: 'transfer_timeout_48h',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'PENDING_TRANSFER');

  if (error) {
    console.error('❌ Error expirando orden stale:', error);
    return false;
  }

  await supabaseAdmin.from('order_status_history').insert({
    order_id: orderId,
    status: 'EXPIRED',
    status_detail: 'transfer_timeout_48h',
    notes: `Orden expirada al intentar subir comprobante fuera de las ${expiryHours}h`,
  });

  return true;
}

export type MarkOrderPaidResult =
  | { ok: true }
  | { ok: false; error: string; notFound?: boolean; conflict?: boolean };

/**
 * Marca una orden de transferencia como PAID tras verificación del comprobante.
 * Solo desde AWAITING_VERIFICATION.
 */
export async function markTransferOrderPaid(
  orderId: string
): Promise<MarkOrderPaidResult> {
  const order = await findOrderByAdminId(orderId, [
    'id',
    'status',
    'payment_method',
    'payment_method_id',
    'metadata',
  ]);

  if (!order.ok) {
    return order;
  }

  if (
    !canAdminMarkOrderPaid({
      status: order.row.status,
      payment_method: order.row.payment_method,
      payment_method_id: order.row.payment_method_id,
      metadata: (order.row.metadata as Record<string, unknown> | null) || null,
    })
  ) {
    return {
      ok: false,
      error: `No se puede marcar como PAID una orden en estado '${order.row.status}'. Primero tiene que haber comprobante (AWAITING_VERIFICATION).`,
      conflict: true,
    };
  }

  const nowIso = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'PAID',
      status_detail: 'transfer_verified_manually',
      updated_at: nowIso,
    })
    .eq('id', order.row.id)
    .eq('status', 'AWAITING_VERIFICATION');

  if (updateError) {
    console.error('❌ Error marcando orden PAID:', updateError);
    return { ok: false, error: updateError.message };
  }

  const { error: historyError } = await supabaseAdmin.from('order_status_history').insert({
    order_id: order.row.id,
    status: 'PAID',
    status_detail: 'transfer_verified_manually',
    notes: 'Pago por transferencia verificado y marcado como PAID desde el panel admin',
  });

  if (historyError) {
    console.error('⚠️ Error guardando historial PAID:', historyError);
  }

  return { ok: true };
}

export type RejectTransferOrderResult =
  | { ok: true }
  | { ok: false; error: string; notFound?: boolean; conflict?: boolean };

/**
 * Rechaza una orden de transferencia que todavía no tiene comprobante.
 */
export async function rejectPendingTransferOrder(
  orderId: string
): Promise<RejectTransferOrderResult> {
  const order = await findOrderByAdminId(orderId, [
    'id',
    'status',
    'payment_method',
    'payment_method_id',
    'metadata',
  ]);

  if (!order.ok) {
    return order;
  }

  if (
    !canAdminActOnPendingTransfer({
      status: order.row.status,
      payment_method: order.row.payment_method,
      payment_method_id: order.row.payment_method_id,
      metadata: (order.row.metadata as Record<string, unknown> | null) || null,
    })
  ) {
    return {
      ok: false,
      error: `No se puede rechazar una orden en estado '${order.row.status}'.`,
      conflict: true,
    };
  }

  const previousStatus = order.row.status;
  const nowIso = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'rejected',
      status_detail: 'transfer_rejected_by_admin',
      updated_at: nowIso,
    })
    .eq('id', order.row.id)
    .eq('status', previousStatus);

  if (updateError) {
    console.error('❌ Error rechazando orden:', updateError);
    return { ok: false, error: updateError.message };
  }

  const { error: historyError } = await supabaseAdmin.from('order_status_history').insert({
    order_id: order.row.id,
    status: 'rejected',
    status_detail: 'transfer_rejected_by_admin',
    notes: 'Orden de transferencia rechazada desde el panel admin (sin comprobante)',
  });

  if (historyError) {
    console.error('⚠️ Error guardando historial de rechazo:', historyError);
  }

  return { ok: true };
}

export type ResendReceiptEmailResult =
  | { ok: true; emailId: string | null }
  | { ok: false; error: string; notFound?: boolean; conflict?: boolean };

/**
 * Reenvía al cliente el mail con el link para subir el comprobante.
 */
export async function resendTransferReceiptEmail(
  orderId: string
): Promise<ResendReceiptEmailResult> {
  const order = await findOrderByAdminId(orderId, [
    'id',
    'status',
    'payment_method',
    'payment_method_id',
    'metadata',
    'customer_email',
    'customer_name',
    'total_amount',
    'currency',
  ]);

  if (!order.ok) {
    return order;
  }

  if (
    !canAdminActOnPendingTransfer({
      status: order.row.status,
      payment_method: order.row.payment_method,
      payment_method_id: order.row.payment_method_id,
      metadata: (order.row.metadata as Record<string, unknown> | null) || null,
    })
  ) {
    return {
      ok: false,
      error: `No se puede reenviar el mail: la orden está en estado '${order.row.status}'.`,
      conflict: true,
    };
  }

  const email = String(order.row.customer_email || '').trim();
  if (!email) {
    return { ok: false, error: 'La orden no tiene email de cliente.' };
  }

  const bank = getMerchantBankDetails();
  if (!bank) {
    return {
      ok: false,
      error: 'Faltan datos bancarios (MERCHANT_CBU, MERCHANT_ALIAS, MERCHANT_BANK_HOLDER).',
    };
  }

  const metadata = {
    ...((order.row.metadata as Record<string, unknown> | null) || {}),
  };
  let receiptToken =
    typeof metadata.receipt_token === 'string' ? metadata.receipt_token : '';

  if (!receiptToken) {
    receiptToken = randomBytes(32).toString('hex');
    metadata.receipt_token = receiptToken;
    const { error: tokenError } = await supabaseAdmin
      .from('orders')
      .update({
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.row.id);

    if (tokenError) {
      console.error('❌ Error guardando receipt_token:', tokenError);
      return { ok: false, error: 'No se pudo generar el link de comprobante.' };
    }
  }

  const emailResult = await sendCustomerTransferInstructionsEmail({
    toEmail: email,
    customerName: (order.row.customer_name as string | null) || null,
    orderId: order.row.id,
    totalAmount: Number(order.row.total_amount) || 0,
    currency: (order.row.currency as string) || 'ARS',
    bank,
    receiptUrl: buildReceiptUploadUrl(order.row.id, receiptToken, 'es'),
    expiryHours: getTransferExpiryHours(),
    locale: 'es',
  });

  if (!emailResult.ok) {
    return { ok: false, error: emailResult.error };
  }

  return { ok: true, emailId: emailResult.emailId };
}

type OrderLookupResult =
  | { ok: true; row: Record<string, any> }
  | { ok: false; error: string; notFound?: boolean };

async function findOrderByAdminId(
  orderId: string,
  columns: string[]
): Promise<OrderLookupResult> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    orderId
  );

  let query = supabaseAdmin.from('orders').select(columns.join(', '));
  query = isUuid ? query.eq('id', orderId) : query.eq('mercadopago_order_id', orderId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('❌ Error buscando orden admin:', error);
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: 'Orden no encontrada', notFound: true };
  }

  return { ok: true, row: data as Record<string, any> };
}
