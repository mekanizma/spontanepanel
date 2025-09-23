import { getServerSupabase } from '@/lib/supabaseServer'

async function getPendingVerifications() {
  const supabase = await getServerSupabase()
  const { data } = await supabase
    .from('user_verification')
    .select('id, user_id, verification_type, is_verified, created_at')
    .eq('is_verified', false)
    .order('created_at', { ascending: true })
  return data || []
}

export default async function VerificationPage() {
  const items = await getPendingVerifications()

  async function approve(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('user_verification').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', id)
  }

  async function reject(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('user_verification').delete().eq('id', id)
  }

  return (
    <main>
      <h1>Doğrulama Yönetimi</h1>
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Kullanıcı</th>
            <th>Tür</th>
            <th>Durum</th>
            <th>Aksiyon</th>
          </tr>
        </thead>
        <tbody>
          {items.map((v: any) => (
            <tr key={v.id} style={{ borderTop: '1px solid #eee' }}>
              <td align="center">{v.user_id}</td>
              <td align="center">{v.verification_type}</td>
              <td align="center">{v.is_verified ? 'Doğrulandı' : 'Bekliyor'}</td>
              <td align="center" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <form action={approve}><input type="hidden" name="id" value={v.id} /><button type="submit">Onayla</button></form>
                <form action={reject}><input type="hidden" name="id" value={v.id} /><button type="submit">Reddet</button></form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}


