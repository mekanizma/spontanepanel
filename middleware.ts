import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Supabase client oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          res.cookies.delete({ name, ...options })
        },
      },
    }
  )

  // Admin e-postaları listesi
  const adminEmails = [
    'admin@spontane.com',
    'yildirim@spontane.com',
    'test@admin.com',
  ]

  // Kullanıcıyı kontrol et
  const { data: { user } } = await supabase.auth.getUser()

  // Admin sayfalarına erişim kontrolü
  if (req.nextUrl.pathname.startsWith('/dashboard') || 
      req.nextUrl.pathname.startsWith('/users') ||
      req.nextUrl.pathname.startsWith('/events') ||
      req.nextUrl.pathname.startsWith('/reports') ||
      req.nextUrl.pathname.startsWith('/notifications') ||
      req.nextUrl.pathname.startsWith('/premium') ||
      req.nextUrl.pathname.startsWith('/verification') ||
      req.nextUrl.pathname.startsWith('/badges') ||
      req.nextUrl.pathname.startsWith('/stories') ||
      req.nextUrl.pathname.startsWith('/settings')) {
    
    // Kullanıcı giriş yapmamışsa login'e yönlendir
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Admin kontrolü
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }
  }

  // Login sayfasından admin sayfalarına yönlendirme
  if (req.nextUrl.pathname === '/login' && user && adminEmails.includes(user.email || '')) {
    const redirectTo = req.nextUrl.searchParams.get('redirect') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api|assets).*)'],
}


