import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function BadgesPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/badges')
  }

  return (
    <main>
      <h1>Rozet Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold mb-2">Rozet Sistemi</h3>
          <p className="text-muted mb-4">
            Kullanıcıların kazanabileceği rozetler ve başarımlar burada yönetilecek.
          </p>
          <div className="text-sm text-muted">
            Bu özellik yakında eklenecek.
          </div>
        </div>
      </div>
    </main>
  )
}