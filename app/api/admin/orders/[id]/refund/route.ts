import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { refundOrder } from '@/lib/mercadopago-admin';

export async function POST(
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
      return NextResponse.json({ error: 'ID de orden requerido' }, { status: 400 });
    }

    await refundOrder(id);

    return NextResponse.json({ success: true, message: 'Reembolso procesado' });
  } catch (error) {
    console.error('Error refunding order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar reembolso' },
      { status: 500 }
    );
  }
}
