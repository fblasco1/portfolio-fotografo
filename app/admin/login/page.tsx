'use client'

import { useActionState } from 'react'
import { Button } from '@/app/[locale]/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/[locale]/components/ui/card'
import { Input } from '@/app/[locale]/components/ui/input'
import { Label } from '@/app/[locale]/components/ui/label'
import { Lock } from 'lucide-react'
import { loginAsAdmin } from './actions'

const loginInitialState: { error: string | null } = { error: null }

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAsAdmin, loginInitialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-4">
      <Card className="w-full max-w-md shadow-lg border-stone-200">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
              <Lock className="h-6 w-6 text-stone-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Panel de Administración</CardTitle>
          <CardDescription>Inicia sesión para gestionar órdenes y contenido</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-stone-700 hover:bg-stone-800 text-white"
            >
              {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
