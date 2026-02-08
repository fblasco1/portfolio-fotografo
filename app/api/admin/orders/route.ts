import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Order } from '@/app/types/admin';

function mapSupabaseOrderToOrder(row: Record<string, unknown>): Order {
  const id = (row.mercadopago_order_id as string) || (row.id as string);
  const payer = (row.payer as Record<string, unknown> | null) || null;
  const paymentInfo = (row.payment_info as Record<string, unknown>) || {};
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

    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (beginDate) {
      query = query.gte('created_at', `${beginDate}T00:00:00.000Z`);
    }
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999Z`);
      query = query.lte('created_at', end.toISOString());
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: rows, error } = await query;

    if (error) {
      throw error;
    }

    const mapped: Order[] = (rows || []).map((row) => mapSupabaseOrderToOrder(row as Record<string, unknown>));

    return NextResponse.json({ orders: mapped, total: mapped.length });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}
