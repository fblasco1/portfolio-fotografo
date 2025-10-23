// scripts/setup-dev-environment.js
require('dotenv').config({ path: '.env.local' });

console.log('🔧 CONFIGURACIÓN DE ENTORNO DE DESARROLLO');
console.log('==========================================\n');

console.log('📋 Para probar pagos en localhost, necesitas una conexión HTTPS.');
console.log('Aquí tienes varias opciones:\n');

console.log('🌐 OPCIÓN 1: Usar ngrok (Recomendado)');
console.log('-------------------------------------');
console.log('1. Instala ngrok: npm install -g ngrok');
console.log('2. En una nueva terminal, ejecuta: ngrok http 3000');
console.log('3. Copia la URL HTTPS que aparece (ej: https://abc123.ngrok.io)');
console.log('4. Usa esa URL para probar el pago\n');

console.log('🌐 OPCIÓN 2: Usar localtunnel');
console.log('-----------------------------');
console.log('1. Instala localtunnel: npm install -g localtunnel');
console.log('2. En una nueva terminal, ejecuta: lt --port 3000');
console.log('3. Usa la URL HTTPS que aparece\n');

console.log('🌐 OPCIÓN 3: Configurar HTTPS local');
console.log('-----------------------------------');
console.log('1. Instala mkcert: https://github.com/FiloSottile/mkcert');
console.log('2. Ejecuta: mkcert -install');
console.log('3. Ejecuta: mkcert localhost');
console.log('4. Configura Next.js para usar HTTPS\n');

console.log('🔧 CONFIGURACIÓN ACTUAL:');
console.log('========================');
console.log(`MERCADOPAGO_ACCESS_TOKEN: ${process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
console.log(`NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: ${process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ? '✅ Configurado' : '❌ No configurado'}`);
console.log(`NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL || '❌ No configurado'}`);

if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.includes('localhost')) {
  console.log('\n⚠️  ADVERTENCIA: NEXT_PUBLIC_BASE_URL está configurado como localhost');
  console.log('   Esto causará errores de SSL con Mercado Pago.');
  console.log('   Usa una de las opciones HTTPS mencionadas arriba.\n');
}

console.log('💡 RECOMENDACIÓN:');
console.log('=================');
console.log('1. Usa ngrok para obtener una URL HTTPS');
console.log('2. Actualiza NEXT_PUBLIC_BASE_URL en .env.local con la URL de ngrok');
console.log('3. Reinicia el servidor de desarrollo');
console.log('4. Prueba el flujo de pago con la URL HTTPS\n');

console.log('📝 Ejemplo de configuración en .env.local:');
console.log('NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io');
console.log('MERCADOPAGO_ACCESS_TOKEN=APP_USR-...');
console.log('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...');
