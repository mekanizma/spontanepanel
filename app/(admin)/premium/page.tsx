import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getPremiumUsers() {
  const supabase = await getServerSupabase()
  
  const { data: users } = await supabase
    .from('users')
    .select(`
      id,
      username,
      email,
      full_name,
      is_premium,
      premium_expires_at,
      created_at,
      profile_image_url
    `)
    .eq('is_premium', true)
    .order('premium_expires_at', { ascending: false })

  return users || []
}

export default async function PremiumPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/premium')
  }
  
  const premiumUsers = await getPremiumUsers()

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
      
      <div className="grid gap-6 mt-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Premium Ver</h2>
          <form action={grant} className="grid gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı ID</label>
              <input 
                name="userId" 
                className="input" 
                placeholder="Kullanıcı ID girin" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Plan Türü</label>
              <select name="plan" className="input" defaultValue="monthly">
                <option value="monthly">Aylık</option>
                <option value="yearly">Yıllık</option>
                <option value="lifetime">Ömür Boyu</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Premium Ver
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Premium İptal Et</h2>
          <form action={cancel} className="grid gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı ID</label>
              <input 
                name="userId" 
                className="input" 
                placeholder="Kullanıcı ID girin" 
                required 
              />
            </div>
            <button type="submit" className="btn btn-danger">
              Premium İptal Et
            </button>
          </form>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Premium Kullanıcılar</h2>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Premium Bitiş Tarihi</th>
                <th>Kayıt Tarihi</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {premiumUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.profile_image_url ? (
                          <img 
                            src={user.profile_image_url} 
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{user.full_name || user.username}</div>
                        <div className="text-sm text-muted">@{user.username}</div>
                        <div className="text-xs text-muted">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">{user.email}</div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {user.premium_expires_at ? 
                        new Date(user.premium_expires_at).toLocaleDateString('tr-TR') : 
                        'Ömür Boyu'
                      }
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <form action={cancel}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button 
                        type="submit" 
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          if (!confirm('Bu kullanıcının premium üyeliğini iptal etmek istediğinizden emin misiniz?')) {
                            e.preventDefault()
                          }
                        }}
                      >
                        İptal Et
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}




