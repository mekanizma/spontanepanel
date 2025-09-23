import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getStats() {
  const supabase = await getServerSupabase()

  const [{ count: totalUsers }, { count: totalEvents }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
  ])

  const { count: pendingEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: pendingReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return { totalUsers: totalUsers || 0, totalEvents: totalEvents || 0, pendingEvents: pendingEvents || 0, pendingReports: pendingReports || 0 }
}

export default async function DashboardPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/dashboard')
  }
  const stats = await getStats()
  return (
    <main>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 }}>
        <Stat title="Toplam Kullanıcı" value={stats.totalUsers} />
        <Stat title="Toplam Etkinlik" value={stats.totalEvents} />
        <Stat title="Bekleyen Etkinlik" value={stats.pendingEvents} />
        <Stat title="Bekleyen Şikayet" value={stats.pendingReports} />
      </div>
    </main>
  )
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
      <div style={{ color: '#666', fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  )
}


