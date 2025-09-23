import { getServerSupabase } from '@/lib/supabaseServer'

export default async function BadgesPage() {
  async function assign(formData: FormData) {
    'use server'
    const userId = String(formData.get('userId'))
    const badge = String(formData.get('badge'))
    const supabase = await getServerSupabase()
    await supabase.from('user_badges').insert({ user_id: userId, badge_code: badge })
  }

  async function remove(formData: FormData) {
    'use server'
    const userId = String(formData.get('userId'))
    const badge = String(formData.get('badge'))
    const supabase = await getServerSupabase()
    await supabase.from('user_badges').delete().eq('user_id', userId).eq('badge_code', badge)
  }

  return (
    <main>
      <h1>Rozet Yönetimi</h1>
      <form action={assign} style={{ display: 'grid', gap: 8, maxWidth: 520, marginTop: 16 }}>
        <input name="userId" placeholder="Kullanıcı ID" required />
        <input name="badge" placeholder="Rozet Kodu (örn: verified)" required />
        <button type="submit">Rozet Ata</button>
      </form>
      <form action={remove} style={{ display: 'grid', gap: 8, maxWidth: 520, marginTop: 16 }}>
        <input name="userId" placeholder="Kullanıcı ID" required />
        <input name="badge" placeholder="Rozet Kodu" required />
        <button type="submit">Rozeti Kaldır</button>
      </form>
    </main>
  )
}


