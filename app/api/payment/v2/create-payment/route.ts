import { NextRequest, NextResponse } from 'next/server';
import { PaymentFactory } from '@/lib/payment/payment-factory';
import { initializePaymentProviders } from '@/lib/payment/config';
import type { RegionInfo } from '@/lib/payment/region-detector';
import type { PaymentRequest } from '@/app/types/payment';

// Inicializar proveedores de pago
initializePaymentProviders();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region, paymentData } = body;
    
    // Validar datos requeridos
    if (!region || !paymentData) {
      return NextResponse.json({
        success: false,
        error: 'Datos de región y pago requeridos'
      }, { status: 400 });
    }

    // Validar campos del pago
    const requiredFields = ['token', 'transaction_amount', 'installments', 'payment_method_id', 'payer'];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return NextResponse.json({
          success: false,
          error: `Campo requerido faltante: ${field}`
        }, { status: 400 });
      }
    }

    console.log('💳 Procesando pago con API Orders v2:', {
      region: region.country,
      currency: region.currency,
      amount: paymentData.transaction_amount,
      installments: paymentData.installments,
      provider: region.paymentProvider
    });

    // Crear pago usando el factory (ahora con flujo de 2 pasos: orden + pago)
    const paymentResponse = await PaymentFactory.createPayment(
      region as RegionInfo,
      paymentData as PaymentRequest
    );

    if (!paymentResponse) {
      throw new Error('No se pudo crear el pago');
    }

    console.log('✅ Pago procesado con API Orders v2:', {
      id: paymentResponse.id,
      status: paymentResponse.status,
      statusDetail: paymentResponse.status_detail,
      amount: paymentResponse.transaction_amount
    });

    return NextResponse.json({
      success: true,
      payment: paymentResponse
    });

  } catch (error: any) {
    console.error('❌ Error procesando pago con API Orders v2:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}
