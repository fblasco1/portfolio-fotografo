import { NextRequest, NextResponse } from 'next/server';
import { PaymentFactory } from '@/lib/payment/payment-factory';
import { initializePaymentProviders } from '@/lib/payment/config';
import type { RegionInfo } from '@/lib/payment/region-detector';

// Inicializar proveedores de pago
initializePaymentProviders();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('payment_method_id');
    const bin = searchParams.get('bin');
    const country = searchParams.get('country') || 'AR';
    
    if (!paymentMethodId || !bin) {
      return NextResponse.json({
        success: false,
        error: 'Parámetros payment_method_id y bin son requeridos'
      }, { status: 400 });
    }

    // Crear región ficticia para obtener el proveedor
    const region: RegionInfo = {
      country,
      currency: country === 'AR' ? 'ARS' : 'USD',
      isLatinAmerica: true,
      isSupported: true,
      paymentProvider: 'mercadopago'
    };

    const provider = PaymentFactory.getProvider(region);
    
    if (!provider || !provider.getIssuers) {
      return NextResponse.json({
        success: false,
        error: 'Proveedor de pago no soporta obtener emisores'
      }, { status: 400 });
    }

    const issuers = await provider.getIssuers(paymentMethodId, bin);

    return NextResponse.json({
      success: true,
      issuers
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo emisores:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

