import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { searchOrders, mapMPOrderStatusToOrderStatus } from '@/lib/mercadopago-admin';
import type { Order } from '@/app/types/admin';

function mapMPOrderToOrder(mp: import('@/lib/mercadopago-admin').MPOrder): Order {
  const payer = mp.payer;
  const payment =
    (mp as any).transactions?.payments?.[0] || (mp as any).payments?.[0];
  const status = mapMPOrderStatusToOrderStatus(
    mp.status,
    payment?.status,
    payment?.status_detail || mp.status_detail
  );

  const payerName =
    (payer as any)?.name ||
    (payer ? [payer.first_name, payer.last_name].filter(Boolean).join(' ') : null) ||
    null;

  return {
    id: String(mp.id),
    user_id: null,
    customer_email: payer?.email || '',
    customer_name: payerName,
    customer_phone: payer?.phone?.number
      ? `${payer.phone.area_code || ''}${payer.phone.number || ''}`.trim() || null
      : null,
    payer: payer ? { ...payer, name: payerName || (payer as any).name } : null,
    payment_id: payment?.id?.toString() || null,
    preference_id: null,
    mercadopago_order_id: String(mp.id),
    status,
    status_detail: payment?.status_detail || mp.status_detail || null,
    total_amount: parseFloat(String(mp.total_amount || 0)) || 0,
    currency: mp.currency || 'ARS',
    payment_method_id: null,
    installments: 1,
    items: ((mp as any).items || []).map((item: any) => ({
      title: item.title,
      quantity: item.quantity,
      price: parseFloat(String(item.unit_price || 0)) * (item.quantity || 1),
    })),
    shipping_address: payer?.address || null,
    metadata: { external_reference: (mp as any).external_reference },
    created_at: (mp as any).created_date || mp.date_created,
    updated_at: (mp as any).last_updated_date || (mp as any).created_date || mp.date_created,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const beginDate = searchParams.get('begin_date');
    const endDate = searchParams.get('end_date');

    const mpStatus = status && status !== 'all' ? mapOrderStatusToMP(status) : undefined;

    const orders = await searchOrders({
      status: mpStatus,
      begin_date: beginDate || undefined,
      end_date: endDate || undefined,
    });

    const mapped: Order[] = orders.map(mapMPOrderToOrder);

    return NextResponse.json({ orders: mapped, total: mapped.length });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}

function mapOrderStatusToMP(status: string): string {
  const map: Record<string, string> = {
    approved: 'processed',
    pending: 'created',
    rejected: 'failed',
    in_process: 'processing',
    cancelled: 'canceled', // MP usa "canceled" (US)
    refunded: 'refunded',
  };
  return map[status] || 'created';
}
