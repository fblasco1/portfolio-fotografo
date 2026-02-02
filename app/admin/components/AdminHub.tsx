'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/[locale]/components/ui/card'
import { Button } from '@/app/[locale]/components/ui/button'
import { ShoppingBag, FileText, LogOut } from 'lucide-react'

export default function AdminHub() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Panel de Administración</h1>
            <p className="text-stone-600 mt-1">Elige qué deseas gestionar</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/admin/dashboard">
            <Card className="h-full transition-all hover:shadow-lg hover:border-stone-300 hover:-translate-y-0.5 cursor-pointer group">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-stone-600 group-hover:bg-stone-200 mb-2">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Gestionar órdenes</CardTitle>
                <CardDescription>
                  Ver pedidos, estados e ingresos. Dashboard de ventas.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/studio">
            <Card className="h-full transition-all hover:shadow-lg hover:border-stone-300 hover:-translate-y-0.5 cursor-pointer group">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-stone-600 group-hover:bg-stone-200 mb-2">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Gestionar contenido</CardTitle>
                <CardDescription>
                  Sanity Studio. Galerías, libro, biografía, documentales.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
