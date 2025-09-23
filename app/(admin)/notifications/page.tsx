import { getServerSupabase } from '@/lib/supabaseServer'

export default async function NotificationsPage() {
  async function send(formData: FormData) {
    'use server'
    const title = String(formData.get('title') || '')
    const body = String(formData.get('body') || '')
    const supabase = await getServerSupabase()
    await supabase.from('admin_notifications').insert({ title, body, target_audience: 'all_users', status: 'queued' })
  }

  return (
    <main>
      <h1>Bildirim Yönetimi</h1>
      <form action={send} style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 520 }}>
        <input name="title" placeholder="Başlık" required />
        <textarea name="body" placeholder="Mesaj" required />
        <button type="submit">Toplu Gönder</button>
      </form>
    </main>
  )
}


