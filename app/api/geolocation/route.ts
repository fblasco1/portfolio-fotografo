import { NextRequest, NextResponse } from 'next/server';

// Cache simple en memoria para evitar llamadas repetidas
const geolocationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function GET(request: NextRequest) {
  try {
    // Obtener la IP del cliente
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : realIP || request.ip || '127.0.0.1';
    
    // Si estamos en localhost, usar una IP de Argentina para pruebas
    const testIP = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' 
      ? '192.168.0.16' // IP de Argentina para pruebas locales
      : ip;
    
    // Verificar cache primero
    const cacheKey = `geolocation_${testIP}`;
    const cached = geolocationCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('📦 Usando datos de geolocalización en cache');
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true
      });
    }
    
    // Intentar múltiples APIs de geolocalización como fallback
    const apis = [
      `https://ipapi.co/${testIP}/json/`,
      `https://ip-api.com/json/${testIP}`,
      `https://ipinfo.io/${testIP}/json`
    ];
    
    let lastError: Error | null = null;
    
    for (const apiUrl of apis) {
      try {
        console.log(`🌍 Intentando API: ${apiUrl}`);
        
        // Crear AbortController para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PortfolioApp/1.0)',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 429) {
            console.log(`⚠️ Rate limit en ${apiUrl}, probando siguiente API`);
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Normalizar datos según la API utilizada
        let normalizedData;
        if (apiUrl.includes('ipapi.co')) {
          normalizedData = {
            country_code: data.country_code || 'AR',
            country_name: data.country_name || 'Argentina',
            city: data.city || 'Buenos Aires',
            region: data.region || 'Buenos Aires',
            timezone: data.timezone || 'America/Argentina/Buenos_Aires',
            ip: data.ip || testIP
          };
        } else if (apiUrl.includes('ip-api.com')) {
          normalizedData = {
            country_code: data.countryCode || 'AR',
            country_name: data.country || 'Argentina',
            city: data.city || 'Buenos Aires',
            region: data.regionName || 'Buenos Aires',
            timezone: data.timezone || 'America/Argentina/Buenos_Aires',
            ip: data.query || testIP
          };
        } else if (apiUrl.includes('ipinfo.io')) {
          normalizedData = {
            country_code: data.country || 'AR',
            country_name: data.country || 'Argentina',
            city: data.city || 'Buenos Aires',
            region: data.region || 'Buenos Aires',
            timezone: data.timezone || 'America/Argentina/Buenos_Aires',
            ip: data.ip || testIP
          };
        }
        
        // Guardar en cache
        geolocationCache.set(cacheKey, {
          data: normalizedData,
          timestamp: Date.now()
        });
        
        console.log('✅ Geolocalización exitosa:', normalizedData);
        
        return NextResponse.json({
          success: true,
          data: normalizedData,
          source: apiUrl
        });
        
      } catch (apiError) {
        console.log(`❌ Error con API ${apiUrl}:`, apiError);
        lastError = apiError as Error;
        continue;
      }
    }
    
    // Si todas las APIs fallan, usar fallback
    throw lastError || new Error('Todas las APIs de geolocalización fallaron');
    
  } catch (error) {
    console.error('❌ Error en geolocalización:', error);
    
    // Fallback a Argentina en caso de error
    const fallbackData = {
      country_code: 'AR',
      country_name: 'Argentina',
      city: 'Buenos Aires',
      region: 'Buenos Aires',
      timezone: 'America/Argentina/Buenos_Aires',
      ip: '127.0.0.1'
    };
    
    return NextResponse.json({
      success: false, // Indicar que es fallback
      data: fallbackData,
      error: 'No se pudo detectar la ubicación automáticamente. Por favor, selecciona tu país manualmente.',
      fallback: true
    });
  }
}
