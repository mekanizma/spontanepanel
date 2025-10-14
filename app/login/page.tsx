'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

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
          
          // Session'ın tam olarak kurulmasını bekle
          console.log('⏳ Session kurulması bekleniyor...')
          setTimeout(async () => {
            try {
              // Session'ı tekrar kontrol et
              const { data: { session } } = await supabase.auth.getSession()
              console.log('🔍 Session kontrolü:', !!session)
              
              if (session) {
                console.log('🚀 Session hazır, yönlendirme yapılıyor:', redirectTo)
                router.push(redirectTo)
              } else {
                console.log('⚠️ Session henüz hazır değil, tekrar deneniyor...')
                setTimeout(() => {
                  console.log('🚀 İkinci deneme yönlendirme:', redirectTo)
                  router.push(redirectTo)
                }, 500)
              }
            } catch (error) {
              console.error('Session kontrolü hatası:', error)
              console.log('🚀 Hata durumunda yönlendirme:', redirectTo)
              router.push(redirectTo)
            }
          }, 1500)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Spontane Admin
          </h1>
          <p className="text-white/80">
            Yönetim paneline hoş geldiniz
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin@spontane.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}