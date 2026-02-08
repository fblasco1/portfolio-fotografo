import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrder, mapMPOrderStatusToOrderStatus } from '@/lib/mercadopago-admin';
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
    metadata: {
      external_reference: (mp as any).external_reference,
      transactions: (mp as any).transactions,
    },
    created_at: mp.date_created,
    updated_at: (mp as any).last_updated_date || mp.date_created,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const mpOrder = await getOrder(id);
    const order = mapMPOrderToOrder(mpOrder);

    return NextResponse.json({ order, raw: mpOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Orden no encontrada' },
      { status: 500 }
    );
  }
}
