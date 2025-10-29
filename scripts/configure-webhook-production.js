#!/usr/bin/env node

/**
 * Script para configurar webhooks de Mercado Pago en producción
 * 
 * Este script proporciona las instrucciones y comandos necesarios
 * para configurar los webhooks de Mercado Pago en el panel de administración.
 * 
 * @author Portfolio Fotográfico
 * @version 1.0.0
 * @since 2024-10-29
 */

const https = require('https');
const readline = require('readline');

// Configuración
const WEBHOOK_URL = 'https://cristianpirovano.com/api/payment/webhook/mercadopago';
const TOPICS = ['payment', 'topic_merchant_order_wh'];

console.log('🔧 Configuración de Webhooks de Mercado Pago');
console.log('============================================\n');

console.log('📋 Información del Webhook:');
console.log(`   URL: ${WEBHOOK_URL}`);
console.log(`   Topics: ${TOPICS.join(', ')}`);
console.log('   Versión API: 3.0.0');
console.log('   Integración: API Orders\n');

console.log('📝 Instrucciones para Configuración Manual:');
console.log('===========================================\n');

console.log('1. 🌐 Acceder al Panel de Mercado Pago:');
console.log('   - Ir a: https://www.mercadopago.com.ar/developers');
console.log('   - Iniciar sesión con tu cuenta de Mercado Pago');
console.log('   - Seleccionar tu aplicación\n');

console.log('2. 🔗 Configurar Webhook:');
console.log('   - Ir a la sección "Notificaciones webhooks"');
console.log('   - Hacer clic en "Configurar notificaciones"');
console.log('   - Ingresar la URL del webhook:');
console.log(`     ${WEBHOOK_URL}\n`);

console.log('3. 📡 Seleccionar Eventos:');
console.log('   - Marcar "Pagos" (payment)');
console.log('   - Marcar "Órdenes comerciales" (topic_merchant_order_wh)');
console.log('   - Guardar configuración\n');

console.log('4. ✅ Verificar Configuración:');
console.log('   - El webhook debe aparecer como "Activo"');
console.log('   - Verificar que la URL sea correcta');
console.log('   - Probar con una transacción de prueba\n');

console.log('🧪 Prueba del Webhook:');
console.log('=====================\n');

console.log('Para probar que el webhook funciona correctamente:');
console.log('1. Realizar una transacción de prueba en sandbox');
console.log('2. Verificar que llegue la notificación al endpoint');
console.log('3. Revisar los logs del servidor para confirmar recepción\n');

console.log('📊 Monitoreo:');
console.log('=============\n');

console.log('Una vez configurado, puedes monitorear el webhook:');
console.log('- Verificar logs del servidor');
console.log('- Revisar el panel de Mercado Pago');
console.log('- Usar herramientas de debugging\n');

console.log('🔒 Consideraciones de Seguridad:');
console.log('================================\n');

console.log('El webhook debe:');
console.log('- Responder con HTTP 200/201 para notificaciones exitosas');
console.log('- Validar la firma de la notificación (recomendado)');
console.log('- Manejar notificaciones duplicadas (idempotencia)');
console.log('- Procesar las notificaciones de forma asíncrona\n');

console.log('📞 Soporte:');
console.log('===========\n');

console.log('Si tienes problemas:');
console.log('- Revisar la documentación: https://www.mercadopago.com.ar/developers');
console.log('- Contactar soporte: https://www.mercadopago.com.ar/ayuda');
console.log('- Verificar estado del servicio: https://status.mercadopago.com/\n');

console.log('✅ Configuración Completada');
console.log('===========================\n');

console.log('Una vez que hayas configurado el webhook en el panel de Mercado Pago,');
console.log('el sistema estará listo para recibir notificaciones de pagos y órdenes.\n');

// Función para probar la conectividad del webhook
function testWebhookConnectivity() {
  console.log('🔍 Probando conectividad del webhook...\n');
  
  const options = {
    hostname: 'cristianpirovano.com',
    port: 443,
    path: '/api/payment/webhook/mercadopago',
    method: 'GET',
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    if (res.statusCode === 200 || res.statusCode === 404) {
      console.log('   ✅ El endpoint es accesible');
    } else {
      console.log('   ⚠️  El endpoint responde pero con un status inesperado');
    }
  });

  req.on('error', (err) => {
    console.log(`   ❌ Error de conectividad: ${err.message}`);
    console.log('   Verifica que el dominio esté funcionando correctamente');
  });

  req.on('timeout', () => {
    console.log('   ⏰ Timeout - El endpoint no responde en 10 segundos');
    req.destroy();
  });

  req.end();
}

// Preguntar si quiere probar la conectividad
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('¿Quieres probar la conectividad del webhook? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    testWebhookConnectivity();
  }
  
  rl.close();
  console.log('\n🎉 Script completado. ¡Buena suerte con la configuración!');
});
