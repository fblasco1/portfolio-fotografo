import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extrae mensaje legible de cualquier error (Error, objeto MP, etc.) para evitar "{}" o "[object Object]". */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    if (typeof o.message === 'string' && o.message) return o.message
    if (typeof o.error === 'string') return o.error
    if (typeof o.description === 'string') return o.description
    if (typeof o.status_detail === 'string') return o.status_detail
    if (typeof o.cause === 'string') return o.cause
    const c = o.cause
    if (c && typeof c === 'object') {
      const co = c as Record<string, unknown>
      if (typeof co.message === 'string' && co.message) return co.message
      if (typeof co.description === 'string') return co.description
      if (Array.isArray(c) && c.length > 0 && c[0] && typeof c[0] === 'object') {
        const first = (c[0] as Record<string, unknown>).description ?? (c[0] as Record<string, unknown>).message
        if (typeof first === 'string') return first
      }
    }
    try {
      const s = JSON.stringify(err)
      if (s !== '{}' && s.length < 500) return s
    } catch { /* ignore */ }
  }
  const s = String(err)
  return s === '[object Object]' || !s ? 'Error desconocido' : s
}

/** Mensaje claro para errores de pago (ej. "public key not found"). */
export function formatPaymentError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('public key not found') || lower.includes('public_key not found')) {
    return 'Mercado Pago no reconoce la Public Key. Genera credenciales nuevas: 1) Ir a https://www.mercadopago.com.ar/developers/panel/app 2) Tu integración > Credenciales 3) En "Credenciales de prueba" copiar la Public Key (no el Access Token) 4) Pegar en .env.local como NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY= 5) Reiniciar npm run dev'
  }
  return raw
}
