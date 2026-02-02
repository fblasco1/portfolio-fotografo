import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminHub from './components/AdminHub'

const ADMIN_EMAIL = 'pirovanofotografia@gmail.com'

export default async function AdminHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/admin/login')
  }

  return <AdminHub />
}
