/**
 * Verificación de autenticación admin para rutas API
 */

import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAIL = 'pirovanofotografia@gmail.com';

export async function requireAdmin(): Promise<{ user: { id: string; email: string } }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  if (user.email !== ADMIN_EMAIL) {
    throw new Error('Forbidden');
  }

  return { user: { id: user.id, email: user.email! } };
}
