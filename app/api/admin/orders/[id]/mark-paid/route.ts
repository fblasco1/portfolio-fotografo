import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { markTransferOrderPaid } from '@/lib/orders/supabase-orders';

export const runtime = 'nodejs';

export async function POST(
  _request: NextRequest,
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

    const result = await markTransferOrderPaid(id);
    if (!result.ok) {
      const status = result.notFound ? 404 : result.conflict ? 409 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      orderId: id,
      status: 'PAID',
      message: 'Orden marcada como PAID',
    });
  } catch (error) {
    console.error('Error marking order paid:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al marcar como PAID' },
      { status: 500 }
    );
  }
}
