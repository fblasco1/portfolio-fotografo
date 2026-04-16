import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '../components/AdminNav'

const ADMIN_EMAIL = 'pirovanofotografia@gmail.com'

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect('/admin/login')
  }

  let user: { email?: string | null } | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    user = currentUser
  } catch {
    redirect('/admin/login')
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="sticky top-0 z-50 flex-shrink-0 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <AdminNav />
        </div>
      </div>
      <main className="min-h-0 flex-1 relative">{children}</main>
    </div>
  )
}
