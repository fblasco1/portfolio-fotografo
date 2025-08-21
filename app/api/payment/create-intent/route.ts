import { NextRequest, NextResponse } from 'next/server';
import { PaymentFactory } from '@/lib/payment/payment-factory';
import { initializePaymentProviders } from '@/lib/payment/config';
import type { RegionInfo } from '@/lib/payment/region-detector';

// Inicializar proveedores de pago
initializePaymentProviders();

export async function POST(request: NextRequest) {
  try {
    const { region, items, customerInfo } = await request.json();
    
    // Validar datos requeridos
    if (!region || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Datos de región e items requeridos'
      }, { status: 400 });
    }

    console.log('💳 Creando sesión de pago:', {
      region: region.country,
      currency: region.currency,
      itemsCount: items.length,
      provider: region.paymentProvider
    });

    // Calcular total
    const subtotal = items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Crear intent de pago usando el factory
    const paymentIntent = await PaymentFactory.createPaymentIntent(
      region as RegionInfo,
      subtotal,
      items
    );

    if (!paymentIntent) {
      throw new Error('No se pudo crear la sesión de pago');
    }

    console.log('✅ Sesión de pago creada:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      provider: paymentIntent.provider
    });

    return NextResponse.json({
      success: true,
      paymentIntent,
      customerInfo
    });

  } catch (error: any) {
    console.error('❌ Error creando sesión de pago:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

