/**
 * This configuration is used to for the Sanity Studio that's mounted on the `\app\admin\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'

// Import schema and structure
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

// Configuración segura con valores por defecto (mismo approach que lib/sanity.ts)
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo-project'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-18'

// Logging para debugging
if (projectId === 'demo-project' || dataset === 'production' && !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.warn('⚠️ Sanity Studio usando configuración por defecto. Configura las variables de entorno.')
}

export default defineConfig({
  basePath: '/admin/studio',
  projectId,
  dataset,
  title: 'Portfolio Cristian Pirovano - Admin',
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    // Desk tool for content management
    deskTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
