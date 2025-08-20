import 'dotenv/config'
import { Resend } from "resend";

async function debugResend() {
  console.log('🔍 Debuggeando configuración de Resend...')
  console.log('')

  // Verificar variables de entorno
  const apiKey = process.env.RESEND_API_KEY
  console.log('🔑 API Key presente:', apiKey ? '✅ Sí' : '❌ No')
  
  if (!apiKey) {
    console.log('❌ Error: RESEND_API_KEY no está configurada en .env.local')
    console.log('💡 Agrega RESEND_API_KEY=tu_api_key_aqui a tu archivo .env.local')
    return
  }

  console.log('🔑 API Key (primeros 10 caracteres):', apiKey.substring(0, 10) + '...')
  console.log('')

  try {
    const resend = new Resend(apiKey)
    
    console.log('📧 Probando conexión con Resend...')
    
    // Probar la API de Resend
    const response = await resend.contacts.create({
      email: 'test@example.com',
      unsubscribed: false,
      audienceId: '63c905c4-6e5a-4bfa-936f-48f6da4a4fc9',
    })

    console.log('✅ Conexión exitosa con Resend')
    console.log('📋 Respuesta:', JSON.stringify(response, null, 2))
    
  } catch (error: any) {
    console.log('❌ Error conectando con Resend:')
    console.log('   Tipo de error:', error.constructor.name)
    console.log('   Mensaje:', error.message)
    
    if (error.statusCode) {
      console.log('   Código de estado:', error.statusCode)
    }
    
    if (error.response) {
      console.log('   Respuesta del servidor:', error.response)
    }
    
    console.log('')
    console.log('🔧 Posibles soluciones:')
    console.log('   1. Verificar que la API key sea válida')
    console.log('   2. Verificar que el audienceId sea correcto')
    console.log('   3. Verificar que la cuenta de Resend esté activa')
    console.log('   4. Verificar la conectividad a internet')
  }
}

if (require.main === module) {
  debugResend()
}
