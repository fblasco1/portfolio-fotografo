import 'dotenv/config'

// Script para verificar variables de entorno de Sanity
console.log('🔍 Verificando variables de entorno de Sanity...')
console.log('')

const requiredVars = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'NEXT_PUBLIC_SANITY_API_VERSION',
  'SANITY_API_TOKEN'
]

let allVarsPresent = true

requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'SANITY_API_TOKEN' ? '***hidden***' : value}`)
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`)
    allVarsPresent = false
  }
})

console.log('')

if (allVarsPresent) {
  console.log('🎉 ¡Todas las variables de entorno están configuradas!')
} else {
  console.log('⚠️  Faltan variables de entorno.')
  console.log('')
  console.log('📝 Crea un archivo .env.local en la raíz del proyecto con:')
  console.log('')
  console.log('NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id_aqui')
  console.log('NEXT_PUBLIC_SANITY_DATASET=production')
  console.log('NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01')
  console.log('SANITY_API_TOKEN=tu_api_token_aqui')
  console.log('')
  console.log('🔗 Obtén las credenciales desde: https://sanity.io')
}
