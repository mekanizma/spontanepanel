import { getServerSupabase } from '@/lib/supabaseServer'

export default async function PremiumPage() {
  async function grant(formData: FormData) {
    'use server'
    const userId = String(formData.get('userId'))
    const plan = String(formData.get('plan') || 'monthly')
    const now = new Date()
    const end = new Date(now)
    if (plan === 'monthly') end.setMonth(end.getMonth() + 1)
    else if (plan === 'yearly') end.setFullYear(end.getFullYear() + 1)
    else end.setFullYear(2099)
    const supabase = await getServerSupabase()
    await supabase.from('user_premium').insert({ user_id: userId, plan_type: plan, start_date: now.toISOString(), end_date: end.toISOString(), amount: 0, currency: 'TRY', status: 'active' })
    await supabase.from('users').update({ is_premium: true, premium_expires_at: end.toISOString() }).eq('id', userId)
  }

  async function cancel(formData: FormData) {
    'use server'
    const userId = String(formData.get('userId'))
    const supabase = await getServerSupabase()
    await supabase.from('user_premium').update({ status: 'cancelled' }).eq('user_id', userId).eq('status', 'active')
    await supabase.from('users').update({ is_premium: false, premium_expires_at: null }).eq('id', userId)
  }

  return (
    <main>
      <h1>Premium Yönetimi</h1>
      <form action={grant} style={{ display: 'grid', gap: 8, maxWidth: 520, marginTop: 16 }}>
        <input name="userId" placeholder="Kullanıcı ID" required />
        <select name="plan" defaultValue="monthly">
          <option value="monthly">Aylık</option>
          <option value="yearly">Yıllık</option>
          <option value="lifetime">Ömür Boyu</option>
        </select>
        <button type="submit">Premium Ver</button>
      </form>
      <form action={cancel} style={{ display: 'grid', gap: 8, maxWidth: 520, marginTop: 16 }}>
        <input name="userId" placeholder="Kullanıcı ID" required />
        <button type="submit">Premium İptal</button>
      </form>
    </main>
  )
}


