import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Tüm istekleri olduğu gibi devam ettir (auth kontrolü sayfa tarafında yapılır)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api|assets).*)'],
}


