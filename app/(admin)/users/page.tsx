import { getServerSupabase } from '@/lib/supabaseServer'

async function getUsers() {
  const supabase = await getServerSupabase()

  const { data } = await supabase
    .from('users')
    .select('id, full_name, email, username, status, is_admin, is_premium, is_verified, created_at')
    .order('created_at', { ascending: false })

  return data || []
}

export default async function UsersPage() {
  const users = await getUsers()
  async function suspend(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('users').update({ status: 'suspended' }).eq('id', id)
  }
  async function activate(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('users').update({ status: 'active' }).eq('id', id)
  }
  return (
    <main>
      <h1>Kullanıcı Yönetimi</h1>
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Ad</th>
            <th align="left">E-posta</th>
            <th>Durum</th>
            <th>Premium</th>
            <th>Doğrulandı</th>
            <th>Aksiyon</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{u.full_name || u.username || '-'}</td>
              <td>{u.email}</td>
              <td align="center">{u.status}</td>
              <td align="center">{u.is_premium ? 'Evet' : 'Hayır'}</td>
              <td align="center">{u.is_verified ? 'Evet' : 'Hayır'}</td>
              <td align="center" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {u.status !== 'suspended' ? (
                  <form action={suspend}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit">Askıya Al</button>
                  </form>
                ) : (
                  <form action={activate}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit">Aktifleştir</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}


