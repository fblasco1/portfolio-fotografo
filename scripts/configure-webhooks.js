// scripts/configure-webhooks.js
require('dotenv').config({ path: '.env.local' });

const CONFIG = {
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  webhookUrl: 'https://evil-deer-judge.loca.lt/api/payment/webhook/mercadopago',
  events: [
    'topic_merchant_order_wh', // Orden comercial (principal para API Orders)
    'payment' // Pago (mantener para compatibilidad)
  ]
};

async function configureWebhook() {
  console.log('🔗 CONFIGURACIÓN DE WEBHOOKS PARA API ORDERS');
  console.log('============================================\n');
  
  console.log('📋 Configuración:');
  console.log(`🔑 Access Token: ${CONFIG.accessToken ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`🌐 Webhook URL: ${CONFIG.webhookUrl}`);
  console.log(`📡 Eventos: ${CONFIG.events.join(', ')}\n`);
  
  if (!CONFIG.accessToken) {
    console.error('❌ MERCADOPAGO_ACCESS_TOKEN no está configurado');
    return;
  }
  
  console.log('🎯 PASOS PARA CONFIGURAR WEBHOOKS:');
  console.log('===================================\n');
  
  console.log('1. 🌐 Accede al panel de Mercado Pago:');
  console.log('   https://www.mercadopago.com.ar/developers/panel/credentials\n');
  
  console.log('2. 🔧 Configura el webhook:');
  console.log('   - Selecciona tu aplicación');
  console.log('   - Ve a "Webhooks" → "Configurar notificaciones"');
  console.log(`   - URL de notificación: ${CONFIG.webhookUrl}`);
  console.log('   - Eventos a seleccionar:');
  CONFIG.events.forEach(event => {
    console.log(`     ✅ ${event}`);
  });
  console.log('   - Guarda la configuración\n');
  
  console.log('3. 🔐 Obtén la clave secreta:');
  console.log('   - Copia la clave secreta generada');
  console.log('   - Agrega MERCADOPAGO_WEBHOOK_SECRET a tu .env.local\n');
  
  console.log('4. 🧪 Prueba el webhook:');
  console.log('   - En el panel de webhooks, haz clic en "Simular"');
  console.log('   - Selecciona tu URL configurada');
  console.log('   - Tipo de evento: topic_merchant_order_wh');
  console.log('   - ID de orden: 1234567890 (ejemplo)');
  console.log('   - Haz clic en "Enviar prueba"\n');
  
  console.log('5. 📊 Monitorea los resultados:');
  console.log('   - Verifica que el webhook llegue a tu servidor');
  console.log('   - Revisa los logs del servidor');
  console.log('   - Confirma que se procese correctamente\n');
  
  console.log('🔍 VERIFICACIÓN DE IMPLEMENTACIÓN:');
  console.log('==================================');
  console.log('✅ Endpoint POST: /api/payment/webhook/mercadopago');
  console.log('✅ Validación de firma: x-signature y x-request-id');
  console.log('✅ Procesamiento: topic_merchant_order_wh');
  console.log('✅ Respuesta HTTP 200: dentro de 22 segundos');
  console.log('✅ Logging: eventos recibidos');
  console.log('✅ Manejo de errores: sin afectar el webhook\n');
  
  console.log('📄 EJEMPLO DE PAYLOAD ESPERADO:');
  console.log('===============================');
  const examplePayload = {
    id: 1234567890,
    live_mode: false,
    type: 'topic_merchant_order_wh',
    date_created: '2025-01-23T13:45:00.000-03:00',
    application_id: 123456789,
    user_id: 2645395069,
    version: 1,
    api_version: 'v1',
    action: 'payment.created',
    data: {
      id: '1234567890'
    }
  };
  console.log(JSON.stringify(examplePayload, null, 2));
  
  console.log('\n📋 HEADERS ESPERADOS:');
  console.log('====================');
  console.log('x-signature: ts=1705320600,v1=abc123...');
  console.log('x-request-id: 12345678-1234-1234-1234-123456789012');
  console.log('content-type: application/json\n');
  
  console.log('🚀 PRÓXIMOS PASOS:');
  console.log('==================');
  console.log('1. Configura el webhook en el panel de Mercado Pago');
  console.log('2. Agrega MERCADOPAGO_WEBHOOK_SECRET a .env.local');
  console.log('3. Reinicia el servidor de desarrollo');
  console.log('4. Simula eventos desde el panel de MP');
  console.log('5. Monitorea los logs del servidor');
  console.log('6. Prueba el flujo completo de pago\n');
  
  console.log('💡 TIP: Usa el script de simulación después de configurar:');
  console.log('   node scripts/simulate-webhook-events.js');
}

configureWebhook();
