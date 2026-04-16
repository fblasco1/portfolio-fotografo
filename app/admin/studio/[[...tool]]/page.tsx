/**
 * Sanity Studio en /admin/studio.
 * Rutas bajo /admin/studio son manejadas por este catch-all.
 */

'use client'

import dynamic from 'next/dynamic'

export default function StudioPage() {
  const Studio = dynamic(() => import('./studio-client'), {ssr: false})
  return <Studio />
}
