import { NextResponse, type NextRequest } from 'next/server'

// Basit koruma: public sayfalar dışındaki tüm admin rotaları cookie'de session varlığını ister
export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const isAdminRoute = url.pathname.startsWith('/dashboard')
    || url.pathname.startsWith('/users')
    || url.pathname.startsWith('/events')
    || url.pathname.startsWith('/reports')
    || url.pathname.startsWith('/notifications')
    || url.pathname.startsWith('/premium')
    || url.pathname.startsWith('/verification')
    || url.pathname.startsWith('/badges')
    || url.pathname.startsWith('/stories')
    || url.pathname.startsWith('/settings')

  if (!isAdminRoute) return NextResponse.next()

  // Supabase auth cookie kontrolü
  const hasSession = req.cookies.has('sb-access-token') || req.cookies.has('sb:token') || req.cookies.get('supabase-auth-token')
  if (!hasSession) {
    // Giriş sayfası yoksa ana sayfaya yönlendir
    const redirectUrl = new URL('/', req.url)
    redirectUrl.searchParams.set('redirect', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api|assets).*)'],
}


