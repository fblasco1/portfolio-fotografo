import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { mapSupabaseOrderToOrder } from '@/lib/orders/admin-map';
import { supabaseAdmin } from '@/lib/supabase/client';

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
