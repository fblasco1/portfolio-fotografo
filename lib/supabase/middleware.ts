import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAIL = 'pirovanofotografia@gmail.com'

export async function updateSessionAndCheckAdmin(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase env vars missing in middleware - redirecting to login')
    return { response: NextResponse.redirect(new URL('/admin/login', request.url)), user: null }
  }

  try {
    let response = NextResponse.next({ request: { headers: request.headers } })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
      return { response: NextResponse.redirect(new URL('/admin/login', request.url)), user: null }
    }

    return { response, user }
  } catch (err) {
    console.error('❌ Middleware admin auth error:', err)
    return { response: NextResponse.redirect(new URL('/admin/login', request.url)), user: null }
  }
}
