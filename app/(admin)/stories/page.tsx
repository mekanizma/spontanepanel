import { getServerSupabase } from '@/lib/supabaseServer'

async function getStories() {
  const supabase = await getServerSupabase()
  const { data } = await supabase
    .from('stories')
    .select('id, user_id, media_url, is_active, expires_at, created_at')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function StoriesPage() {
  const stories = await getStories()

  async function remove(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('stories').delete().eq('id', id)
  }

  return (
    <main>
      <h1>Hikaye Yönetimi</h1>
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı</th>
            <th>Aktif</th>
            <th>Son</th>
            <th>Aksiyon</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((s: any) => (
            <tr key={s.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{s.id}</td>
              <td align="center">{s.user_id}</td>
              <td align="center">{s.is_active ? 'Evet' : 'Hayır'}</td>
              <td align="center">{new Date(s.expires_at).toLocaleString('tr-TR')}</td>
              <td align="center">
                <form action={remove}><input type="hidden" name="id" value={s.id} /><button type="submit">Sil</button></form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}


