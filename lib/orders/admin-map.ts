import type { Order } from '@/app/types/admin';

const VALID_STATUSES: Order['status'][] = [
  'pending',
  'approved',
  'rejected',
  'in_process',
  'cancelled',
  'refunded',
  'PENDING_TRANSFER',
  'AWAITING_VERIFICATION',
  'PAID',
  'EXPIRED',
  'SHIPPED',
];

export function mapSupabaseOrderToOrder(row: Record<string, unknown>): Order {
  const status = (row.status as string) || 'pending';
  const paymentMethod = String(row.payment_method || row.payment_method_id || '');
  const metadata = (row.metadata as Record<string, unknown>) || {};
  const isTransfer =
    paymentMethod.toUpperCase() === 'TRANSFER' ||
    status === 'PENDING_TRANSFER' ||
    status === 'AWAITING_VERIFICATION' ||
    metadata.payment_flow === 'manual_transfer';
  // Órdenes de transferencia: siempre el UUID de Supabase (no hay mercadopago_order_id)
  const id = isTransfer
    ? (row.id as string)
    : (row.mercadopago_order_id as string) || (row.id as string);

  const payer = (row.payer as Record<string, unknown> | null) || null;
  const orderStatus = VALID_STATUSES.includes(status as Order['status'])
    ? (status as Order['status'])
    : 'pending';

  return {
    id: String(id),
    user_id: (row.user_id as string) || null,
    customer_email: (row.customer_email as string) || '',
    customer_name: (row.customer_name as string) || null,
    customer_phone: (row.customer_phone as string) || null,
    payer: payer && Object.keys(payer).length > 0 ? (payer as Order['payer']) : null,
    payment_id: (row.payment_id as string) || null,
    preference_id: (row.preference_id as string) || null,
    mercadopago_order_id: (row.mercadopago_order_id as string) || null,
    status: orderStatus,
    status_detail: (row.status_detail as string) || null,
    total_amount: Number(row.total_amount) || 0,
    currency: (row.currency as string) || 'ARS',
    payment_method_id:
      (row.payment_method_id as string) || (row.payment_method as string) || null,
    installments: Number(row.installments) || 1,
    items: Array.isArray(row.items)
      ? (
          row.items as Array<{ title?: string; quantity?: number; price?: number }>
        ).map((item) => ({
          title: item.title || 'Producto',
          quantity: item.quantity || 1,
          price: Number(item.price) || 0,
        }))
      : [],
    shipping_address: row.shipping_address || null,
    metadata,
    created_at: (row.created_at as string) || new Date().toISOString(),
    updated_at: (row.updated_at as string) || new Date().toISOString(),
  };
}
