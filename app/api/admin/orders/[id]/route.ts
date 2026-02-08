import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Order } from '@/app/types/admin';

function mapSupabaseOrderToOrder(row: Record<string, unknown>): Order {
  const id = (row.mercadopago_order_id as string) || (row.id as string);
  const payer = (row.payer as Record<string, unknown> | null) || null;
  const status = (row.status as string) || 'pending';
  const validStatuses = ['pending', 'approved', 'rejected', 'in_process', 'cancelled', 'refunded'];
  const orderStatus = validStatuses.includes(status) ? status as Order['status'] : 'pending';

  return {
    id: String(id),
    user_id: (row.user_id as string) || null,
    customer_email: (row.customer_email as string) || '',
    customer_name: (row.customer_name as string) || null,
    customer_phone: (row.customer_phone as string) || null,
    payer: payer && Object.keys(payer).length > 0 ? payer as Order['payer'] : null,
    payment_id: (row.payment_id as string) || null,
    preference_id: (row.preference_id as string) || null,
    mercadopago_order_id: (row.mercadopago_order_id as string) || null,
    status: orderStatus,
    status_detail: (row.status_detail as string) || null,
    total_amount: Number(row.total_amount) || 0,
    currency: (row.currency as string) || 'ARS',
    payment_method_id: (row.payment_method_id as string) || null,
    installments: Number(row.installments) || 1,
    items: Array.isArray(row.items) ? (row.items as Array<{ title?: string; quantity?: number; price?: number }>).map((item) => ({
      title: item.title || 'Producto',
      quantity: item.quantity || 1,
      price: Number(item.price) || 0,
    })) : [],
    shipping_address: row.shipping_address || null,
    metadata: (row.metadata as Record<string, unknown>) || {},
    created_at: (row.created_at as string) || new Date().toISOString(),
    updated_at: (row.updated_at as string) || new Date().toISOString(),
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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabaseAdmin.from('orders').select('*');

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('mercadopago_order_id', id);
    }

    const { data: row, error } = await query.single();

    if (error || !row) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const order = mapSupabaseOrderToOrder(row as Record<string, unknown>);
    const payment = (row as Record<string, unknown>).payment_info || null;

    return NextResponse.json({ order, payment });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Orden no encontrada' },
      { status: 500 }
    );
  }
}
