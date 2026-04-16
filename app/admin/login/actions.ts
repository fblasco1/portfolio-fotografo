'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'pirovanofotografia@gmail.com'

/** Solo tipos internos: un archivo `'use server'` solo puede exportar async functions. */
type LoginState = { error: string | null }

export async function loginAsAdmin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const signedInEmail = data.user?.email?.toLowerCase().trim() ?? null
  if (signedInEmail !== ADMIN_EMAIL) {
    await supabase.auth.signOut()
    return { error: 'No tienes permisos de administrador.' }
  }

  redirect('/admin')
}

export async function logoutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
