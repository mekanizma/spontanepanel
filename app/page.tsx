import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Spontane Admin
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Etkinlik yönetim sistemi admin paneli
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Admin Girişi
          </Link>
          
          <div className="text-sm text-gray-500">
            Sadece yetkili admin kullanıcıları giriş yapabilir
          </div>
        </div>
      </div>
    </div>
  )
}
