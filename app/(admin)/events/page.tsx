import { cookies } from 'next/headers'
import { getServerSupabase } from '@/lib/supabaseServer'

async function getPending() {
  const supabase = await getServerSupabase()

  const { data } = await supabase
    .from('events')
    .select('id, title, start_time, creator_id, status')
    .eq('status', 'pending')
    .order('start_time', { ascending: true })

  return data || []
}

export default async function EventsPage() {
  const events = await getPending()

  async function approve(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('events').update({ status: 'approved' }).eq('id', id)
  }

  async function reject(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('events').update({ status: 'rejected' }).eq('id', id)
  }
  return (
    <main>
      <h1>Etkinlik Yönetimi</h1>
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Başlık</th>
            <th>Başlangıç</th>
            <th>Durum</th>
            <th>Aksiyon</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e: any) => (
            <tr key={e.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{e.title}</td>
              <td align="center">{new Date(e.start_time).toLocaleString('tr-TR')}</td>
              <td align="center">{e.status}</td>
              <td align="center" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <form action={approve}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit">Onayla</button>
                </form>
                <form action={reject}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit">Reddet</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}


