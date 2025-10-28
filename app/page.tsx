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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 via-purple-600 to-indigo-800">
      <div className="max-w-md w-full space-y-8 text-center px-4">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Spontane Admin
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Etkinlik yönetim sistemi admin paneli
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/login"
            className="w-full inline-flex justify-center py-3.5 px-6 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition duration-150 ease-in-out"
          >
            Admin Girişi
          </Link>
          
          <div className="text-sm text-white/70 font-medium">
            Sadece yetkili admin kullanıcıları giriş yapabilir
          </div>
        </div>
      </div>
    </div>
  )
}
