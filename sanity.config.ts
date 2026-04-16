/**
 * This configuration is used to for the Sanity Studio that's mounted on the `\app\admin\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'

// Import schema and structure
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

import {apiVersion, dataset, projectId} from './sanity/env'

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
