/**
 * Script para probar el webhook completo de Mercado Pago
 * Simula una notificación de pago aprobado
 * Ejecutar con: node scripts/test-webhook-complete.js
 */

const crypto = require('crypto');

// Configuración
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/payment/webhook/mercadopago';
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';

// Datos de prueba simulando una notificación de Mercado Pago
const testWebhookData = {
  id: 123456789,
  live_mode: false,
  type: "payment",
  date_created: new Date().toISOString(),
  application_id: 123456789,
  user_id: 123456789,
  version: 1,
  api_version: "v1",
  action: "payment.created",
  data: {
    id: "1234567890"
  }
};

/**
 * Genera la firma HMAC para el webhook (igual que en el código real)
 */
function generateWebhookSignature(dataId, requestId, timestamp) {
  if (!WEBHOOK_SECRET) {
    console.log('⚠️ WEBHOOK_SECRET no configurado - saltando validación de firma');
    return null;
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(manifest);
  return hmac.digest('hex');
}

/**
 * Envía la notificación al webhook
 */
async function sendWebhookNotification() {
  try {
    console.log('🧪 Iniciando prueba del webhook completo...\n');

    // Generar headers de seguridad
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateWebhookSignature(testWebhookData.data.id, requestId, timestamp);

    const headers = {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
    };

    // Agregar firma si está configurada
    if (signature) {
      headers['x-signature'] = `ts=${timestamp},v1=${signature}`;
    }

    console.log('📤 Enviando notificación al webhook...');
    console.log('📍 URL:', WEBHOOK_URL);
    console.log('📋 Datos:', JSON.stringify(testWebhookData, null, 2));
    console.log('🔐 Headers:', JSON.stringify(headers, null, 2));

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(testWebhookData)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log('\n📥 Respuesta del webhook:');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Body:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ Webhook procesado exitosamente!');
      console.log('📧 Verifica que se hayan enviado los emails automáticos:');
      console.log('   - Al fotógrafo: cristianpirovanoportfolio@gmail.com');
      console.log('   - Al cliente: (simulado en el webhook)');
    } else {
      console.log('\n❌ Error en el webhook:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('❌ Error enviando notificación al webhook:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Sugerencias:');
      console.log('   1. Asegúrate de que el servidor esté ejecutándose (npm run dev)');
      console.log('   2. Verifica que la URL del webhook sea correcta');
      console.log('   3. Para producción, usa la URL real de tu dominio');
    }
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🔔 Prueba del Webhook de Mercado Pago');
  console.log('=====================================\n');

  // Verificar configuración
  if (!WEBHOOK_URL.includes('localhost') && !WEBHOOK_URL.includes('127.0.0.1')) {
    console.log('🌐 Probando webhook en producción:', WEBHOOK_URL);
  } else {
    console.log('🏠 Probando webhook local:', WEBHOOK_URL);
  }

  if (!WEBHOOK_SECRET) {
    console.log('⚠️  WEBHOOK_SECRET no configurado - la validación de firma será omitida');
  } else {
    console.log('🔐 WEBHOOK_SECRET configurado - validación de firma activa');
  }

  console.log('');

  // Enviar notificación
  await sendWebhookNotification();

  console.log('\n📋 Próximos pasos:');
  console.log('   1. Verifica los logs del servidor para ver el procesamiento');
  console.log('   2. Revisa las bandejas de entrada de los emails');
  console.log('   3. Si hay errores, revisa la configuración de RESEND_API_KEY');
}

// Ejecutar si el script se ejecuta directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { sendWebhookNotification, testWebhookData };
