import { createI18nMiddleware } from 'next-international/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { updateSessionAndCheckAdmin } from '@/lib/supabase/middleware'

const I18nMiddleware = createI18nMiddleware({
    locales: ['en', 'es'],
    defaultLocale: 'en',
    urlMappingStrategy: 'rewriteDefault',
})

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Rutas admin: solo login es pública; el resto requiere auth
    if (pathname.startsWith('/admin')) {
        if (pathname.startsWith('/admin/login')) {
            return NextResponse.next()
        }
        const { response } = await updateSessionAndCheckAdmin(request)
        return response
    }

    return I18nMiddleware(request)
}

export const config = {
    matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)']
}