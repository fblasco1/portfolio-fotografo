import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener la IP del cliente
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || '127.0.0.1';
    
    // Si estamos en desarrollo, usar una IP de prueba
    const testIP = process.env.NODE_ENV === 'development' ? '8.8.8.8' : ip;
    
    // Llamar a la API de geolocalización desde el servidor
    const response = await fetch(`https://ipapi.co/${testIP}/json/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioApp/1.0)',
      },
      // Agregar timeout para evitar esperas largas
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      // Si es error 429 (rate limit), usar fallback inmediatamente
      if (response.status === 429) {
        console.log('⚠️ Rate limit alcanzado, usando fallback');
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: {
        country_code: data.country_code || 'AR',
        country_name: data.country_name || 'Argentina',
        city: data.city || 'Buenos Aires',
        region: data.region || 'Buenos Aires',
        timezone: data.timezone || 'America/Argentina/Buenos_Aires',
        ip: data.ip || testIP
      }
    });
    
  } catch (error) {
    console.error('Error en geolocalización:', error);
    
    // Fallback a Argentina en caso de error
    return NextResponse.json({
      success: false,
      data: {
        country_code: 'AR',
        country_name: 'Argentina',
        city: 'Buenos Aires',
        region: 'Buenos Aires',
        timezone: 'America/Argentina/Buenos_Aires',
        ip: '127.0.0.1'
      }
    });
  }
}
