import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { rejectPendingTransferOrder } from '@/lib/orders/supabase-orders';

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

    const result = await rejectPendingTransferOrder(id);
    if (!result.ok) {
      const status = result.notFound ? 404 : result.conflict ? 409 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      orderId: id,
      status: 'rejected',
      message: 'Orden rechazada',
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al rechazar la orden' },
      { status: 500 }
    );
  }
}
