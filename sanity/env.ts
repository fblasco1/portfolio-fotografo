/**
 * Variables de entorno compartidas entre:
 * - Next.js (prefijo `NEXT_PUBLIC_...`)
 * - Sanity Studio (prefijo `SANITY_STUDIO_...`)
 *
 * Nota: el Studio alojado en `*.sanity.studio` NO hereda variables de Vercel,
 * por lo que debe configurarse con `SANITY_STUDIO_*` (o ambas).
 */

export const apiVersion =
  process.env.SANITY_STUDIO_API_VERSION ||
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  '2025-08-18'

export const dataset = assertValue(
  process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: SANITY_STUDIO_DATASET (or NEXT_PUBLIC_SANITY_DATASET)'
)

export const projectId = assertValue(
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: SANITY_STUDIO_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID)'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
