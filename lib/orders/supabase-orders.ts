/**
 * Persistencia de órdenes en Supabase
 * Se guarda al crear la orden (info del cliente/payer que no se puede obtener de la API de MP)
 * Los webhooks actualizan el estado
 */

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
      currency: order.currency_id || 'ARS',
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
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price ?? (item.unit_price ? item.unit_price * item.quantity : 0),
      })),
      metadata: {
        external_reference: order.external_reference,
        mercadopago_order_id: order.id,
        mercadopago_payment_id: payment?.id,
        date_created: order.date_created,
        date_last_updated: order.last_updated_date,
      },
      external_reference: order.external_reference || `order_${order.id}`,
    };

    const { error } = await supabaseAdmin.from('orders').insert(orderData);

    if (error) {
      console.error('❌ Error guardando orden al crear:', error);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Orden persistida en Supabase al crear:', order.id);
    }
  } catch (err) {
    console.error('❌ Error persistiendo orden:', err);
  }
}
