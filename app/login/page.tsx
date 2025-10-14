'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'unauthorized') {
      setError('Bu e-posta adresi admin yetkisine sahip değil.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submit başladı!')
    console.log('Email:', email)
    console.log('Password:', password ? '***' : 'boş')
    
    setLoading(true)
    setError('')

    try {
      console.log('Supabase giriş denemesi başlıyor...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Supabase yanıtı:', { data: data?.user?.email, error: error?.message })

      if (error) {
        console.log('Supabase hatası:', error.message)
        setError(error.message)
      } else if (data.user) {
        console.log('Supabase giriş başarılı, kullanıcı:', data.user.email)
        
        // Admin kontrolü - sadece belirli e-postalar admin olabilir
        const adminEmails = [
          'admin@spontane.com',
          'yildirim@spontane.com',
          'test@admin.com',
          // Buraya admin e-postalarını ekleyebilirsiniz
        ]
        
        console.log('Giriş yapan e-posta:', email)
        console.log('Admin e-postaları:', adminEmails)
        console.log('Admin kontrolü:', adminEmails.includes(email))
        
        if (adminEmails.includes(email)) {
          console.log('Admin girişi başarılı, yönlendiriliyor...')
          const redirectTo = searchParams.get('redirect') || '/dashboard'
          console.log('Yönlendirme hedefi:', redirectTo)
          
          // Yönlendirme işlemini daha güvenilir hale getir
          window.location.href = redirectTo
        } else {
          console.log('Admin değil, çıkış yapılıyor')
          setError('Bu e-posta adresi admin yetkisine sahip değil.')
          await supabase.auth.signOut()
        }
      } else {
        console.log('Beklenmeyen durum: data.user yok')
        setError('Giriş yapılırken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Giriş hatası:', error)
      setError('Giriş yapılırken bir hata oluştu.')
    } finally {
      console.log('Giriş işlemi tamamlandı')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Spontane Admin Paneli
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lütfen admin bilgilerinizle giriş yapın
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                E-posta adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              onClick={async (e) => {
                console.log('Giriş butonu tıklandı!')
                console.log('Form submit olacak...')
                
                // Form submit çalışmıyorsa manuel olarak çalıştır
                e.preventDefault()
                await handleLogin(e)
              }}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
            
            {/* Test butonu */}
            <button
              type="button"
              onClick={() => {
                console.log('Test butonu tıklandı!')
                console.log('Email state:', email)
                console.log('Password state:', password ? '***' : 'boş')
              }}
              className="mt-2 w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Test (Console Log)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}