#!/usr/bin/env node

/**
 * Script para verificar la configuración de Sanity
 * Ejecuta: node scripts/check-sanity-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Sanity...\n');

// Verificar archivo .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ Archivo .env.local no encontrado');
  console.log('📝 Crea un archivo .env.local basado en env.example');
  console.log('   cp env.example .env.local');
  console.log('   Luego edita .env.local con tus valores reales de Sanity\n');
} else {
  console.log('✅ Archivo .env.local encontrado');
  
  // Leer variables de entorno
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const projectIdMatch = envContent.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/);
  const datasetMatch = envContent.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/);
  
  if (projectIdMatch && projectIdMatch[1] && projectIdMatch[1] !== 'your-project-id-here') {
    console.log(`✅ NEXT_PUBLIC_SANITY_PROJECT_ID: ${projectIdMatch[1]}`);
  } else {
    console.log('❌ NEXT_PUBLIC_SANITY_PROJECT_ID no configurado o usando valor por defecto');
  }
  
  if (datasetMatch && datasetMatch[1]) {
    console.log(`✅ NEXT_PUBLIC_SANITY_DATASET: ${datasetMatch[1]}`);
  } else {
    console.log('❌ NEXT_PUBLIC_SANITY_DATASET no configurado');
  }
}

// Verificar archivos de configuración
const configFiles = [
  'sanity.config.ts',
  'sanity.cli.ts',
  'sanity/env.ts',
  'lib/sanity.ts',
  'lib/sanity-safe.ts'
];

console.log('\n📁 Verificando archivos de configuración:');
configFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - No encontrado`);
  }
});

console.log('\n🔧 Para configurar Sanity:');
console.log('1. Crea un proyecto en https://sanity.io');
console.log('2. Copia el Project ID y Dataset');
console.log('3. Crea .env.local con tus valores');
console.log('4. Ejecuta: npm run dev');
