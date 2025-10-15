#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar la configuración de Mercado Pago
 * 
 * Ejecutar con: node scripts/test-mercadopago-config.js
 */

// Cargar variables de entorno desde .env.local
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Buscar archivo .env.local en la raíz del proyecto
const envPath = path.resolve(__dirname, '..', '.env.local');

console.log('\n🔍 === Diagnóstico de Configuración de Mercado Pago ===\n');

// Verificar si existe el archivo .env.local
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: No se encontró el archivo .env.local');
  console.error(`   Buscado en: ${envPath}`);
  console.error('');
  console.error('💡 Solución:');
  console.error('   1. Copia el archivo env.example a .env.local');
  console.error('   2. Edita .env.local con tus credenciales reales');
  console.error('');
  console.error('   Comando: cp env.example .env.local');
  console.error('');
  process.exit(1);
}

// Cargar variables del archivo .env.local
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ ERROR cargando .env.local:', result.error.message);
  process.exit(1);
}

console.log('✅ Archivo .env.local encontrado y cargado');
console.log(`   Ubicación: ${envPath}`);
console.log('');

// Verificar variables de entorno
const checks = [
  {
    name: 'NEXT_PUBLIC_BASE_URL',
    value: process.env.NEXT_PUBLIC_BASE_URL,
    required: true,
    validator: (val) => {
      if (!val) return { valid: false, error: 'No configurada' };
      
      // Verificar espacios
      if (val !== val.trim()) {
        return { valid: false, error: 'Contiene espacios al inicio o final' };
      }
      
      // Verificar que sea una URL válida
      try {
        const url = new URL(val);
        if (!url.protocol.match(/^https?:$/)) {
          return { valid: false, error: 'Debe usar protocolo http:// o https://' };
        }
        return { valid: true };
      } catch (e) {
        return { valid: false, error: 'URL inválida - ' + e.message };
      }
    }
  },
  {
    name: 'MERCADOPAGO_ACCESS_TOKEN',
    value: process.env.MERCADOPAGO_ACCESS_TOKEN,
    required: true,
    validator: (val) => {
      if (!val) return { valid: false, error: 'No configurada' };
      if (val.includes('your-') || val.includes('here')) {
        return { valid: false, error: 'Usando valor de ejemplo' };
      }
      if (val.length < 20) {
        return { valid: false, error: 'Token parece ser muy corto' };
      }
      return { valid: true };
    }
  },
  {
    name: 'MERCADOPAGO_PUBLIC_KEY',
    value: process.env.MERCADOPAGO_PUBLIC_KEY,
    required: false,
    validator: (val) => {
      if (!val) return { valid: false, error: 'No configurada (opcional)' };
      if (val.includes('your-') || val.includes('here')) {
        return { valid: false, error: 'Usando valor de ejemplo' };
      }
      return { valid: true };
    }
  }
];

let hasErrors = false;

checks.forEach(check => {
  const result = check.validator(check.value);
  const status = result.valid ? '✅' : (check.required ? '❌' : '⚠️');
  
  console.log(`${status} ${check.name}`);
  
  if (result.valid) {
    if (check.name === 'NEXT_PUBLIC_BASE_URL') {
      console.log(`   → ${check.value}`);
    } else {
      // Ocultar tokens sensibles
      const maskedValue = check.value 
        ? check.value.substring(0, 10) + '...' + check.value.substring(check.value.length - 4)
        : 'No configurada';
      console.log(`   → ${maskedValue}`);
    }
  } else {
    console.log(`   → ${result.error}`);
    if (check.required) hasErrors = true;
  }
  console.log('');
});

// Verificar URLs de retorno
if (process.env.NEXT_PUBLIC_BASE_URL) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL.trim().replace(/\/$/, '');
  
  console.log('📍 URLs de Retorno que se generarán:');
  console.log(`   Success: ${baseUrl}/payment/success`);
  console.log(`   Failure: ${baseUrl}/payment/failure`);
  console.log(`   Pending: ${baseUrl}/payment/pending`);
  console.log('');
  
  console.log('🔔 URL de Webhook:');
  console.log(`   ${baseUrl}/api/payment/webhook/mercadopago?source_news=webhooks`);
  console.log('');
}

// Resultado final
console.log('═'.repeat(60));
if (hasErrors) {
  console.log('❌ ERRORES ENCONTRADOS - Por favor corrige la configuración');
  console.log('');
  console.log('💡 Pasos para solucionar:');
  console.log('   1. Copia el archivo env.example a .env.local');
  console.log('   2. Reemplaza los valores con tus credenciales reales');
  console.log('   3. Reinicia el servidor de desarrollo');
  console.log('   4. Ejecuta este script nuevamente');
  console.log('');
  console.log('📖 Lee: SOLUCION_ERROR_BACK_URLS.md para más detalles');
  process.exit(1);
} else {
  console.log('✅ CONFIGURACIÓN CORRECTA - Puedes proceder con las pruebas');
  console.log('');
  console.log('🚀 Siguiente paso:');
  console.log('   Ejecuta: npm run dev');
  console.log('   Luego visita: http://localhost:3000/es/shop');
  console.log('');
  process.exit(0);
}


