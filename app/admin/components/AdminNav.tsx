'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAdmin } from '@/app/admin/login/actions'
import { Button } from '@/app/[locale]/components/ui/button'
import { LayoutDashboard, FileText, LogOut, ShoppingBag } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname() || ''

  const isHub = pathname === '/admin' || pathname === '/admin/'
  const isDashboard = pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/orders')
  const isStudio = pathname.startsWith('/admin/studio')

  const navButtonClass = "gap-2 border border-stone-200 bg-white shadow-sm hover:bg-stone-50 hover:border-stone-300"

  return (
    <nav
      className={`flex flex-wrap items-center gap-2 bg-white px-4 py-3 ${
        isStudio
          ? 'mb-0 rounded-none border-0 py-2 shadow-none'
          : 'mb-6 rounded-lg border-b border-stone-200 shadow-sm'
      }`}
    >
      {!isHub && (
        <Link href="/admin">
          <Button variant="outline" size="sm" className={navButtonClass}>
            <LayoutDashboard className="h-4 w-4" />
            Panel
          </Button>
        </Link>
      )}
      {!isDashboard && (
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className={navButtonClass}>
            <ShoppingBag className="h-4 w-4" />
            Órdenes
          </Button>
        </Link>
      )}
      {!isStudio && (
        <Link href="/admin/studio">
          <Button variant="outline" size="sm" className={navButtonClass}>
            <FileText className="h-4 w-4" />
            Contenido
          </Button>
        </Link>
      )}
      <div className="flex-1" />
      <form action={logoutAdmin} className="inline">
        <Button type="submit" variant="outline" size="sm" className="gap-2">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </form>
    </nav>
  )
}
