import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrdersDashboard from '../components/OrdersDashboard'
import AdminNav from '../components/AdminNav'

const ADMIN_EMAIL = 'pirovanofotografia@gmail.com'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="container mx-auto px-4 py-8">
        <AdminNav />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Gestionar órdenes</h1>
          <p className="text-stone-600 mt-1">Órdenes, estados e ingresos de tu tienda</p>
        </div>

        <OrdersDashboard />
      </div>
    </div>
  )
}
