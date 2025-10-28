'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
// const router = useRouter()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (typeof window !== 'undefined') {
    console.log('🌐 SUPABASE_URL (client):', supabaseUrl ? 'var' : 'yok')
    console.log('🌐 SUPABASE_ANON_KEY (client):', supabaseAnon ? 'var' : 'yok')
  }
  
  const supabase = createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnon,
  })

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'unauthorized') {
      setError('Bu e-posta adresi admin yetkisine sahip değil.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 LOGIN BAŞLADI!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password ? '***' : 'boş')
    
    setLoading(true)
    setError('')

    try {
      if (!supabaseUrl || !supabaseAnon) {
        console.error('❌ Supabase env eksik: URL veya ANON KEY yok')
        setError('Sunucu yapılandırması eksik (Supabase URL/Key). Lütfen yöneticinize bildirin.')
        setLoading(false)
        return
      }
      console.log('🔐 Supabase auth çağrısı yapılıyor...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 SUPABASE YANITI:', { 
        user: data?.user?.email, 
        error: error?.message,
        session: !!data?.session,
        hasUser: !!data?.user,
        hasSession: !!data?.session
      })

      if (error) {
        console.error('❌ SUPABASE HATASI:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        console.log('✅ KULLANICI BULUNDU:', data.user.email)
        
        // Admin kontrolü
        const adminEmails = [
          'admin@spontane.com',
          'yildirim@spontane.com',
          'test@admin.com',
        ]
        
        console.log('🔍 ADMIN KONTROLÜ:', { 
          email, 
          adminEmails, 
          isAdmin: adminEmails.includes(email) 
        })
        
        if (adminEmails.includes(email)) {
          console.log('✅ ADMIN ONAYLANDI! Yönlendiriliyor...')
          const redirectTo = searchParams.get('redirect') || '/dashboard'
          console.log('🎯 YÖNLENDİRME HEDEFİ:', redirectTo)
          
          // Hard redirect ile yönlendirme (middleware sorununu bypass eder)
          console.log('⏳ Hard redirect için bekleniyor...')
          setTimeout(() => {
            console.log('🚀 Hard redirect yapılıyor:', redirectTo)
            window.location.href = redirectTo
          }, 1000)
        } else {
          console.log('❌ ADMIN DEĞİL!')
          setError('Bu e-posta adresi admin yetkisine sahip değil.')
          await supabase.auth.signOut()
          setLoading(false)
        }
      } else {
        console.log('❌ KULLANICI BULUNAMADI!')
        setError('Giriş yapılırken bir hata oluştu.')
        setLoading(false)
      }
    } catch (error) {
      console.error('❌ GENEL HATA:', error)
      setError('Giriş yapılırken bir hata oluştu.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Spontane Admin</h1>
          <p className="text-white/90 text-lg">Yönetim paneline hoş geldiniz</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="ornek@email.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © 2024 Spontane. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}