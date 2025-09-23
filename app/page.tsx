import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    redirect('/dashboard')
  }
  return (
    <main style={{ padding: 24 }}>
      <h1>Spontane Admin</h1>
      <p>Giriş yapmanız gerekiyor. Lütfen Login sayfasına gidin.</p>
    </main>
  )
}
