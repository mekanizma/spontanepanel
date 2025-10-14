import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  console.log('🚀🚀🚀 MIDDLEWARE ÇALIŞIYOR! Path:', req.nextUrl.pathname)
  
  const res = NextResponse.next()
  
  // Tüm cookie'leri logla
  console.log('🍪 Tüm cookie\'ler:', req.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`))
  
  // Supabase client oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = req.cookies.get(name)?.value
          console.log(`🍪 Cookie ${name}:`, cookie ? `${cookie.substring(0, 20)}...` : 'yok')
          return cookie
        },
        set(name: string, value: string, options: any) {
          console.log(`🍪 Cookie set ${name}:`, value ? `${value.substring(0, 20)}...` : 'yok')
          res.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          console.log(`🍪 Cookie remove ${name}`)
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
  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log('🔍 Middleware - Path:', req.nextUrl.pathname)
  console.log('🔍 Middleware - User:', user?.email)
  console.log('🔍 Middleware - Error:', error?.message)
  console.log('🔍 Middleware - Admin emails:', adminEmails)
  console.log('🔍 Middleware - User exists:', !!user)
  console.log('🔍 Middleware - Session cookie:', req.cookies.get('sb-namydkvicfdxsxdkmmgc-auth-token')?.value ? 'var' : 'yok')

  // Admin sayfalarına erişim kontrolü - GEÇİCİ OLARAK DEVRE DIŞI
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
    
    console.log('🔍 Middleware - Admin sayfasına erişim:', req.nextUrl.pathname)
    console.log('⚠️ Middleware - Authentication kontrolü geçici olarak devre dışı')
    
    // GEÇİCİ OLARAK AUTHENTICATION KONTROLÜNÜ ATLA
    // if (!user) {
    //   console.log('❌ Middleware - Kullanıcı giriş yapmamış, login\'e yönlendiriliyor')
    //   return NextResponse.redirect(new URL('/login', req.url))
    // }

    // // Admin kontrolü
    // const isAdmin = adminEmails.includes(user.email || '')
    // console.log('🔍 Middleware - Admin kontrolü:', isAdmin, 'Email:', user.email)
    
    // if (!isAdmin) {
    //   console.log('❌ Middleware - Admin değil, login\'e yönlendiriliyor')
    //   return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    // }
    
    console.log('✅ Middleware - Admin erişimi onaylandı (kontrol atlandı)')
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
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/users/:path*',
    '/events/:path*',
    '/notifications/:path*',
    '/premium/:path*',
    '/reports/:path*',
    '/verification/:path*',
    '/badges/:path*',
    '/stories/:path*',
    '/settings/:path*',
  ],
}


