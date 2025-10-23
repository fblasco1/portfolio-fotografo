#!/usr/bin/env node

/**
 * Script para simular eventos de webhook de Mercado Pago
 * Útil para probar la implementación localmente
 * Ejecutar con: node scripts/simulate-webhook-events.js
 */

const crypto = require('crypto');

// Configuración
const CONFIG = {
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || 'test-secret-key',
  webhookUrl: process.env.NEXT_PUBLIC_BASE_URL ? 
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook/mercadopago` :
              'http://localhost:3000/api/payment/webhook/mercadopago',
  webhookSiteUrl: 'https://webhook.site/unique-id' // Reemplazar con tu URL
};

/**
 * Generar firma HMAC para webhook
 */
function generateWebhookSignature(dataId, requestId, timestamp, secret) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  return hmac.digest('hex');
}

/**
 * Simular evento de orden comercial (topic_merchant_order_wh)
 */
async function simulateMerchantOrderWebhook() {
  console.log('📦 Simulando evento de orden comercial...');
  
  const dataId = '1234567890';
  const requestId = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateWebhookSignature(dataId, requestId, timestamp, CONFIG.webhookSecret);
  
  const payload = {
    id: 1234567890,
    live_mode: false,
    type: 'topic_merchant_order_wh',
    date_created: new Date().toISOString(),
    application_id: 123456789,
    user_id: 987654321,
    version: 1,
    api_version: 'v1',
    action: 'payment.created',
    data: {
      id: dataId
    }
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'x-signature': `ts=${timestamp},v1=${signature}`,
    'x-request-id': requestId,
    'user-agent': 'MercadoPago-Webhook/1.0'
  };
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log('📊 Resultado:', {
      status: response.status,
      response: result,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error enviando webhook:', error.message);
    return false;
  }
}

/**
 * Simular evento de pago (payment)
 */
async function simulatePaymentWebhook() {
  console.log('💳 Simulando evento de pago...');
  
  const dataId = '9876543210';
  const requestId = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateWebhookSignature(dataId, requestId, timestamp, CONFIG.webhookSecret);
  
  const payload = {
    id: 9876543210,
    live_mode: false,
    type: 'payment',
    date_created: new Date().toISOString(),
    application_id: 123456789,
    user_id: 987654321,
    version: 1,
    api_version: 'v1',
    action: 'payment.created',
    data: {
      id: dataId
    }
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'x-signature': `ts=${timestamp},v1=${signature}`,
    'x-request-id': requestId,
    'user-agent': 'MercadoPago-Webhook/1.0'
  };
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log('📊 Resultado:', {
      status: response.status,
      response: result,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Error enviando webhook:', error.message);
    return false;
  }
}

/**
 * Simular webhook con firma inválida
 */
async function simulateInvalidSignatureWebhook() {
  console.log('🔒 Simulando webhook con firma inválida...');
  
  const dataId = '1111111111';
  const requestId = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  const invalidSignature = 'invalid-signature-123';
  
  const payload = {
    id: 1111111111,
    live_mode: false,
    type: 'topic_merchant_order_wh',
    date_created: new Date().toISOString(),
    application_id: 123456789,
    user_id: 987654321,
    version: 1,
    api_version: 'v1',
    action: 'payment.created',
    data: {
      id: dataId
    }
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'x-signature': `ts=${timestamp},v1=${invalidSignature}`,
    'x-request-id': requestId,
    'user-agent': 'MercadoPago-Webhook/1.0'
  };
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log('📊 Resultado (esperado: 401):', {
      status: response.status,
      response: result
    });
    
    return response.status === 401; // Debería rechazar con 401
  } catch (error) {
    console.error('❌ Error enviando webhook:', error.message);
    return false;
  }
}

/**
 * Simular webhook sin headers de firma
 */
async function simulateWebhookWithoutSignature() {
  console.log('⚠️ Simulando webhook sin headers de firma...');
  
  const payload = {
    id: 2222222222,
    live_mode: false,
    type: 'topic_merchant_order_wh',
    date_created: new Date().toISOString(),
    application_id: 123456789,
    user_id: 987654321,
    version: 1,
    api_version: 'v1',
    action: 'payment.created',
    data: {
      id: '2222222222'
    }
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'user-agent': 'MercadoPago-Webhook/1.0'
  };
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log('📊 Resultado (esperado: 401 o procesado sin validación):', {
      status: response.status,
      response: result
    });
    
    return true; // Puede ser 401 o 200 dependiendo de si WEBHOOK_SECRET está configurado
  } catch (error) {
    console.error('❌ Error enviando webhook:', error.message);
    return false;
  }
}

/**
 * Verificar que el endpoint esté activo
 */
async function checkWebhookEndpoint() {
  console.log('🔍 Verificando endpoint de webhook...');
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'GET'
    });
    
    const result = await response.json();
    
    console.log('📊 Estado del endpoint:', {
      status: response.status,
      response: result
    });
    
    return response.ok && result.status === 'active';
  } catch (error) {
    console.error('❌ Error verificando endpoint:', error.message);
    return false;
  }
}

/**
 * Mostrar instrucciones de configuración
 */
function showConfigurationInstructions() {
  console.log('\n📋 INSTRUCCIONES DE CONFIGURACIÓN:');
  console.log('=====================================');
  
  console.log('\n1. 🔑 Configurar variables de entorno en .env.local:');
  console.log('   MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret_de_mp');
  console.log('   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx');
  console.log('   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  
  console.log('\n2. 🌐 Configurar webhook en panel de Mercado Pago:');
  console.log('   - URL: https://TU_DOMINIO/api/payment/webhook/mercadopago');
  console.log('   - Eventos: topic_merchant_order_wh, payment');
  console.log('   - Copiar la clave secreta generada');
  
  console.log('\n3. 🧪 Para pruebas con webhook.site:');
  console.log('   - Actualizar CONFIG.webhookSiteUrl con tu URL única');
  console.log('   - Configurar webhook en MP apuntando a webhook.site');
  console.log('   - Simular eventos desde el panel de MP');
  
  console.log('\n4. 🚀 Para pruebas locales:');
  console.log('   - Ejecutar: npm run dev');
  console.log('   - Ejecutar: node scripts/simulate-webhook-events.js');
  console.log('   - Verificar logs del servidor');
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 SIMULACIÓN DE EVENTOS DE WEBHOOK');
  console.log('====================================\n');
  
  // Verificar configuración
  if (!CONFIG.webhookSecret || CONFIG.webhookSecret === 'test-secret-key') {
    console.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado o usando valor de prueba');
    console.log('💡 La validación de firma estará desactivada o usará clave de prueba');
  }
  
  // Verificar endpoint
  const endpointOk = await checkWebhookEndpoint();
  if (!endpointOk) {
    console.error('❌ Endpoint de webhook no está disponible');
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en localhost:3000');
    showConfigurationInstructions();
    process.exit(1);
  }
  
  console.log('\n🎭 Ejecutando simulaciones...\n');
  
  // Ejecutar simulaciones
  const results = {
    merchantOrder: await simulateMerchantOrderWebhook(),
    payment: await simulatePaymentWebhook(),
    invalidSignature: await simulateInvalidSignatureWebhook(),
    noSignature: await simulateWebhookWithoutSignature()
  };
  
  console.log('\n📊 RESUMEN DE SIMULACIONES:');
  console.log('============================');
  console.log(`📦 Orden comercial: ${results.merchantOrder ? '✅ OK' : '❌ ERROR'}`);
  console.log(`💳 Pago: ${results.payment ? '✅ OK' : '❌ ERROR'}`);
  console.log(`🔒 Firma inválida: ${results.invalidSignature ? '✅ OK (rechazado)' : '❌ ERROR'}`);
  console.log(`⚠️ Sin firma: ${results.noSignature ? '✅ OK' : '❌ ERROR'}`);
  
  const allOk = Object.values(results).every(result => result);
  
  if (allOk) {
    console.log('\n🎉 ¡Todas las simulaciones pasaron correctamente!');
    console.log('💡 Tu implementación de webhook está funcionando bien');
  } else {
    console.log('\n⚠️ Algunas simulaciones fallaron');
    console.log('💡 Revisa los logs del servidor para más detalles');
  }
  
  showConfigurationInstructions();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateWebhookSignature,
  simulateMerchantOrderWebhook,
  simulatePaymentWebhook,
  simulateInvalidSignatureWebhook,
  simulateWebhookWithoutSignature,
  checkWebhookEndpoint
};
