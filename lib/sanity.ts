/**
 * Cliente unificado de Sanity con manejo de errores robusto
 * Combina la funcionalidad de configuración segura con fallbacks
 */

import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

// Configuración por defecto para desarrollo
const DEFAULT_CONFIG = {
  projectId: 'demo-project',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
}

// Función para obtener la configuración de Sanity de manera segura
function getSanityConfig() {
  try {
    // Intentar usar la configuración centralizada primero
    try {
      const { projectId, dataset, apiVersion } = require('../sanity/env')
      return { projectId, dataset, apiVersion }
    } catch {
      // Si falla, usar variables de entorno directamente
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || DEFAULT_CONFIG.projectId
      const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || DEFAULT_CONFIG.dataset
      const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || DEFAULT_CONFIG.apiVersion
      
      if (projectId === DEFAULT_CONFIG.projectId || dataset === DEFAULT_CONFIG.dataset) {
        console.warn('⚠️ Usando configuración por defecto de Sanity. Configura las variables de entorno.')
      }
      
      return { projectId, dataset, apiVersion }
    }
  } catch (error) {
    console.error('❌ Error obteniendo configuración de Sanity:', error)
    return DEFAULT_CONFIG
  }
}

// Crear cliente de Sanity
const config = getSanityConfig()

export const client = createClient({
  projectId: config.projectId,
  dataset: config.dataset,
  apiVersion: config.apiVersion,
  useCdn: process.env.NODE_ENV === 'production', // CDN en producción
})

// Crear builder de imágenes
const builder = imageUrlBuilder(client)

/**
 * Helper para generar URLs de imágenes de Sanity
 * @param source - Referencia de imagen de Sanity
 * @returns Builder de imagen con método .url()
 */
export const urlFor = (source: any) => {
  try {
    return builder.image(source)
  } catch (error) {
    console.error('❌ Error creando URL de imagen:', error)
    // Retornar builder mock en caso de error
    return {
      url: () => '/placeholder.svg',
      width: () => ({ url: () => '/placeholder.svg' }),
      height: () => ({ url: () => '/placeholder.svg' }),
      size: () => ({ url: () => '/placeholder.svg' }),
      format: () => ({ url: () => '/placeholder.svg' }),
      quality: () => ({ url: () => '/placeholder.svg' }),
    } as any
  }
}

/**
 * Verifica si Sanity está configurado correctamente
 * @returns true si hay credenciales válidas configuradas
 */
export function isSanityConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
    process.env.NEXT_PUBLIC_SANITY_DATASET &&
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== DEFAULT_CONFIG.projectId
  )
}

/**
 * Obtiene productos de manera segura (función legacy, usar sanity-products.ts)
 * @deprecated Usar getProducts() de lib/sanity-products.ts en su lugar
 */
export async function getProducts() {
  try {
    if (!isSanityConfigured()) {
      console.warn('⚠️ Sanity no configurado, devolviendo productos mock')
      return getMockProducts()
    }
    
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        title,
        subtitle,
        description,
        price,
        category,
        images[] {
          asset-> {
            _id,
            url
          }
        }
      }
    `)
    
    return products || []
  } catch (error) {
    console.error('❌ Error obteniendo productos de Sanity:', error)
    return getMockProducts()
  }
}

// Productos mock para desarrollo
function getMockProducts() {
  return [
    {
      _id: 'mock-photo-1',
      _type: 'product' as const,
      category: 'photo' as const,
      price: 50,
      isAvailable: true,
      order: 1,
      content: {
        es: {
          title: 'Fotografía Artística',
          subtitle: 'Edición limitada'
        },
        en: {
          title: 'Artistic Photography',
          subtitle: 'Limited edition'
        }
      },
      image: {
        asset: {
          _id: 'mock-image-1',
          url: '/placeholder.svg'
        }
      }
    },
    {
      _id: 'mock-postcard-1',
      _type: 'product' as const,
      category: 'postcard' as const,
      price: 15,
      isAvailable: true,
      order: 2,
      content: {
        es: {
          title: 'Postal Personalizada',
          subtitle: 'Diseño único'
        },
        en: {
          title: 'Custom Postcard',
          subtitle: 'Unique design'
        }
      },
      image: {
        asset: {
          _id: 'mock-image-2',
          url: '/placeholder.svg'
        }
      }
    }
  ]
}
