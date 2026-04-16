/**
 * Sanity Studio en /admin/studio.
 * Rutas bajo /admin/studio son manejadas por este catch-all.
 */

'use client'

import dynamic from 'next/dynamic'

const Studio = dynamic(() => import('./studio-client'), { ssr: false })

export default function StudioPage() {
  return <Studio />
}
