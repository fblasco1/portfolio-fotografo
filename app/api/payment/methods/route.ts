import { NextRequest, NextResponse } from 'next/server';
import { PaymentFactory } from '@/lib/payment/payment-factory';
import { initializePaymentProviders } from '@/lib/payment/config';
import type { RegionInfo } from '@/lib/payment/region-detector';

// Inicializar proveedores de pago
initializePaymentProviders();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'AR';
    
    // Crear región ficticia para obtener el proveedor
    const region: RegionInfo = {
      country,
      currency: country === 'AR' ? 'ARS' : 'USD',
      isLatinAmerica: true,
      isSupported: true,
      paymentProvider: 'mercadopago'
    };

    const provider = PaymentFactory.getProvider(region);
    
    if (!provider || !provider.getAvailablePaymentMethods) {
      return NextResponse.json({
        success: false,
        error: 'Proveedor de pago no soporta obtener métodos'
      }, { status: 400 });
    }

    const methods = await provider.getAvailablePaymentMethods();

    return NextResponse.json({
      success: true,
      methods
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo métodos de pago:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

