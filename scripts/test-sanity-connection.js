#!/usr/bin/env node

/**
 * Script para probar la configuración de Sanity
 * Ejecuta: node scripts/test-sanity-connection.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Verificando configuración de Sanity...\n');

// Cargar variables de entorno desde .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
  
  console.log('✅ Variables de entorno cargadas desde .env.local');
} else {
  console.log('⚠️ Archivo .env.local no encontrado');
}

// Verificar variables de entorno
console.log('\n1. Verificando variables de entorno:');
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;

console.log('NEXT_PUBLIC_SANITY_PROJECT_ID:', projectId ? '✅ Configurado' : '❌ No configurado');
console.log('NEXT_PUBLIC_SANITY_DATASET:', dataset ? '✅ Configurado' : '❌ No configurado');
console.log('NEXT_PUBLIC_SANITY_API_VERSION:', apiVersion || 'Usando valor por defecto');

// Verificar archivos de configuración
console.log('\n2. Verificando archivos de configuración:');
const configFiles = [
  'sanity.config.ts',
  'sanity.cli.ts', 
  'sanity/env.ts',
  'lib/sanity.ts',
  'lib/sanity-safe.ts'
];

configFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - No encontrado`);
  }
});

// Verificar si la configuración es válida
console.log('\n3. Estado de la configuración:');
if (projectId && dataset) {
  console.log('✅ Sanity está configurado correctamente');
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Dataset: ${dataset}`);
} else {
  console.log('⚠️ Sanity no está completamente configurado');
  console.log('   El proyecto usará el modo demo con datos mock');
}

console.log('\n✅ Verificación completada');
