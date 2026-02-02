import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPayment } from '@/lib/mercadopago-admin';

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
      return NextResponse.json({ error: 'ID de pago requerido' }, { status: 400 });
    }

    const payment = await getPayment(id);

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Pago no encontrado' },
      { status: 500 }
    );
  }
}
