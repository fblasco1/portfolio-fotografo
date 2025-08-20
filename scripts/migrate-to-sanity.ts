import 'dotenv/config'
import { createClient } from '@sanity/client'
import { products } from '../constants/images'

// Configuración del cliente Sanity
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false
})

// Función para migrar solo productos
async function migrateProducts() {
  console.log('🛍️ Migrando productos...')
  
  console.log('📷 Migrando fotografías...')
  for (let i = 0; i < products.photos.length; i++) {
    const photo = products.photos[i]
    
    try {
      const photoData = {
        _type: 'product',
        category: 'photo',
        image: null, // Se subirá manualmente
        price: 50, // Precio por defecto, se puede editar después
        order: i + 1,
        isAvailable: true,
        content: {
          es: {
            title: photo.titleKey === 'photo1.title' ? 'Buenos Aires, Argentina 2022' :
                  photo.titleKey === 'photo2.title' ? 'Buenos Aires, Argentina 2023' :
                  photo.titleKey === 'photo3.title' ? 'Buenos Aires, Argentina 2022' :
                  photo.titleKey === 'photo4.title' ? 'Buenos Aires, Argentina 2023' :
                  photo.titleKey === 'photo5.title' ? 'Buenos Aires, Argentina 2022' :
                  photo.titleKey === 'photo6.title' ? 'Buenos Aires, Argentina 2023' :
                  photo.titleKey === 'photo7.title' ? 'Pushkar, India 2011' :
                  photo.titleKey === 'photo8.title' ? 'Don Khong, Laos 2012' :
                  photo.titleKey === 'photo9.title' ? 'Vian Xai, Laos 2012' :
                  photo.titleKey === 'photo10.title' ? 'Buenos Aires, Argentina 2024' :
                  photo.titleKey === 'photo11.title' ? 'Myanmar 2017' :
                  photo.titleKey === 'photo12.title' ? 'Myanmar 2012' :
                  photo.titleKey === 'photo13.title' ? 'Myanmar 2012' :
                  photo.titleKey === 'photo14.title' ? 'India 2011' :
                  photo.titleKey === 'photo15.title' ? 'Marruecos 2009' :
                  photo.titleKey === 'photo16.title' ? 'Palestina 2013' :
                  photo.titleKey === 'photo17.title' ? 'India 2011' : 'Fotografía',
            subtitle: photo.subtitle
          },
          en: {
            title: photo.titleKey === 'photo1.title' ? 'Buenos Aires, Argentina 2022' :
                  photo.titleKey === 'photo2.title' ? 'Buenos Aires, Argentina 2023' :
                  photo.titleKey === 'photo3.title' ? 'Buenos Aires, Argentina 2022' :
                  photo.titleKey === 'photo4.title' ? 'Buenos Aires, Argentina 2023' :
                  photo.titleKey === 'photo5.title' ? 'Buenos Aires, Argentina 2022' :
                  photo.titleKey === 'photo6.title' ? 'Buenos Aires, Argentina 2023' :
                  photo.titleKey === 'photo7.title' ? 'Pushkar, India 2011' :
                  photo.titleKey === 'photo8.title' ? 'Don Khong, Laos 2012' :
                  photo.titleKey === 'photo9.title' ? 'Vian Xai, Laos 2012' :
                  photo.titleKey === 'photo10.title' ? 'Buenos Aires, Argentina 2024' :
                  photo.titleKey === 'photo11.title' ? 'Myanmar 2017' :
                  photo.titleKey === 'photo12.title' ? 'Myanmar 2012' :
                  photo.titleKey === 'photo13.title' ? 'Myanmar 2012' :
                  photo.titleKey === 'photo14.title' ? 'India 2011' :
                  photo.titleKey === 'photo15.title' ? 'Morocco 2009' :
                  photo.titleKey === 'photo16.title' ? 'Palestine 2013' :
                  photo.titleKey === 'photo17.title' ? 'India 2011' : 'Photography',
            subtitle: photo.subtitle
          }
        }
      }

      const result = await client.create(photoData)
      console.log(`✅ Producto foto "${photoData.content.es.title}" migrado: ${result._id}`)
      console.log(`   🖼️  Imagen: ${photo.url}`)
    } catch (error) {
      console.error(`❌ Error migrando foto ${photo.titleKey}:`, error)
    }
  }

  console.log('📮 Migrando postales...')
  for (let i = 0; i < products.postcards.length; i++) {
    const postcard = products.postcards[i]
    
    try {
      const postcardData = {
        _type: 'product',
        category: 'postcard',
        image: null, // Se subirá manualmente
        price: 15, // Precio por defecto, se puede editar después
        order: products.photos.length + i + 1,
        isAvailable: true,
        content: {
          es: {
            title: postcard.titleKey === 'postcard1.title' ? 'Nabi Saleh, Palestina, 2014' :
                  postcard.titleKey === 'postcard2.title' ? 'Campo de refugiados de Qalandia, Palestina, 2019' :
                  postcard.titleKey === 'postcard3.title' ? 'Bil\'in, Palestina, 2015' :
                  postcard.titleKey === 'postcard4.title' ? 'Bil\'in, Palestina, 2014' :
                  postcard.titleKey === 'postcard5.title' ? 'Campo de refugiados de Aida, Palestina, 2013' : 'Postal',
            subtitle: postcard.subtitle
          },
          en: {
            title: postcard.titleKey === 'postcard1.title' ? 'Nabi Saleh, Palestine, 2014' :
                  postcard.titleKey === 'postcard2.title' ? 'Qalandia Refugee Camp, Palestine, 2019' :
                  postcard.titleKey === 'postcard3.title' ? 'Bil\'in, Palestine, 2015' :
                  postcard.titleKey === 'postcard4.title' ? 'Bil\'in, Palestine, 2014' :
                  postcard.titleKey === 'postcard5.title' ? 'Aida Refugee Camp, Palestine, 2013' : 'Postcard',
            subtitle: postcard.subtitle
          }
        }
      }

      const result = await client.create(postcardData)
      console.log(`✅ Producto postal "${postcardData.content.es.title}" migrado: ${result._id}`)
      console.log(`   🖼️  Imagen: ${postcard.url}`)
    } catch (error) {
      console.error(`❌ Error migrando postal ${postcard.titleKey}:`, error)
    }
  }
}

// Función principal de migración
async function migrateAll() {
  console.log('🚀 Iniciando migración de productos a Sanity CMS...')
  console.log('📝 Esta migración solo incluye productos (fotos y postales).')
  console.log('📷 Las imágenes deben subirse manualmente desde el panel de administración.')
  console.log('')
  
  try {
    
    await migrateProducts()
    console.log('')
    
    console.log('🎉 ¡Migración de productos completada exitosamente!')
    console.log('')
    console.log('📋 Resumen de lo migrado:')
    console.log(`   ✅ ${products.photos.length} productos fotográficos`)
    console.log(`   ✅ ${products.postcards.length} postales`)
    console.log('')
    console.log('🔗 Próximos pasos:')
    console.log('   1. Acceder al panel de administración: http://localhost:3000/admin')
    console.log('   2. Subir imágenes manualmente para cada producto')
    console.log('   3. Configurar precios de productos si es necesario')
    console.log('   4. Verificar que la tienda funcione correctamente')
    
  } catch (error) {
    console.error('❌ Error en la migración:', error)
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateAll()
}

export { migrateAll, migrateProducts }
