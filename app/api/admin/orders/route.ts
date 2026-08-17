import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { mapSupabaseOrderToOrder } from '@/lib/orders/admin-map';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Order } from '@/app/types/admin';

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

    const mapped: Order[] = (rows || []).map((row) =>
      mapSupabaseOrderToOrder(row as Record<string, unknown>)
    );

    return NextResponse.json({ orders: mapped, total: mapped.length });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}
