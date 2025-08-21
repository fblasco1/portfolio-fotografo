import { NextRequest, NextResponse } from 'next/server';
import { detectRegionByIP } from '@/lib/payment/region-detector';

export async function GET(request: NextRequest) {
  try {
    // Obtener IP del cliente
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    
    console.log('🌍 Detectando región para IP:', ip);
    
    // Detectar región por IP
    const region = await detectRegionByIP();
    
    console.log('✅ Región detectada:', region);
    
    return NextResponse.json({
      success: true,
      region
    });
  } catch (error) {
    console.error('❌ Error detectando región:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error detectando región',
      region: null
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { countryCode } = await request.json();
    
    if (!countryCode) {
      return NextResponse.json({
        success: false,
        error: 'Código de país requerido'
      }, { status: 400 });
    }
    
    // Importar dinámicamente para evitar errores de SSR
    const { detectRegion } = await import('@/lib/payment/region-detector');
    const region = detectRegion(countryCode);
    
    console.log('🌍 Región establecida manualmente:', region);
    
    return NextResponse.json({
      success: true,
      region
    });
  } catch (error) {
    console.error('❌ Error estableciendo región:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error estableciendo región'
    }, { status: 500 });
  }
}

