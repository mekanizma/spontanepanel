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
  
  console.log('Middleware - Path:', req.nextUrl.pathname)
  console.log('Middleware - User:', user?.email)
  console.log('Middleware - Admin emails:', adminEmails)

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
    
    console.log('Middleware - Admin sayfasına erişim:', req.nextUrl.pathname)
    
    // Kullanıcı giriş yapmamışsa login'e yönlendir
    if (!user) {
      console.log('Middleware - Kullanıcı giriş yapmamış, login\'e yönlendiriliyor')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Admin kontrolü
    const isAdmin = adminEmails.includes(user.email || '')
    console.log('Middleware - Admin kontrolü:', isAdmin, 'Email:', user.email)
    
    if (!isAdmin) {
      console.log('Middleware - Admin değil, login\'e yönlendiriliyor')
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }
    
    console.log('Middleware - Admin erişimi onaylandı')
  }

  // Login sayfasından admin sayfalarına yönlendirme
  if (req.nextUrl.pathname === '/login' && user && adminEmails.includes(user.email || '')) {
    console.log('Middleware - Login sayfasında admin kullanıcı, dashboard\'a yönlendiriliyor')
    const redirectTo = req.nextUrl.searchParams.get('redirect') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api|assets).*)'],
}


