/**
 * Sanity Studio en /admin/studio.
 * Rutas bajo /admin/studio son manejadas por este catch-all.
 */

'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
