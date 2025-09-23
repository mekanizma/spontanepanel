import { getServerSupabase } from '@/lib/supabaseServer'

async function getReports() {
  const supabase = await getServerSupabase()
  const { data } = await supabase
    .from('reports')
    .select('id, report_type, description, priority, status, reporter_id, reported_user_id, created_at')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function ReportsPage() {
  const reports = await getReports()

  async function resolveReport(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', id)
  }

  async function dismissReport(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', id)
  }

  return (
    <main>
      <h1>Şikayet Yönetimi</h1>
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Tür</th>
            <th align="left">Açıklama</th>
            <th>Öncelik</th>
            <th>Durum</th>
            <th>Aksiyon</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r: any) => (
            <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{r.report_type}</td>
              <td>{r.description}</td>
              <td align="center">{r.priority}</td>
              <td align="center">{r.status}</td>
              <td align="center" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <form action={resolveReport}><input type="hidden" name="id" value={r.id} /><button type="submit">Çöz</button></form>
                <form action={dismissReport}><input type="hidden" name="id" value={r.id} /><button type="submit">Geçersiz</button></form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}


