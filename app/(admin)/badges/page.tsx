import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getUsersWithBadges() {
  const supabase = await getServerSupabase()
  
  const { data: users } = await supabase
    .from('users')
    .select(`
      id,
      username,
      full_name,
      profile_image_url,
      user_badges (
        badge_code,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  return users || []
}

const availableBadges = [
  { code: 'verified', name: 'Doğrulanmış', icon: '✅', color: 'green' },
  { code: 'premium', name: 'Premium', icon: '⭐', color: 'purple' },
  { code: 'early_adopter', name: 'Erken Kullanıcı', icon: '🚀', color: 'blue' },
  { code: 'top_creator', name: 'En İyi Oluşturucu', icon: '🏆', color: 'yellow' },
  { code: 'community_helper', name: 'Topluluk Yardımcısı', icon: '🤝', color: 'green' },
  { code: 'moderator', name: 'Moderatör', icon: '🛡️', color: 'red' },
  { code: 'vip', name: 'VIP', icon: '💎', color: 'purple' },
  { code: 'beta_tester', name: 'Beta Testçi', icon: '🧪', color: 'blue' },
]

export default async function BadgesPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/badges')
  }
  
  const users = await getUsersWithBadges()

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
      
      <div className="grid gap-6 mt-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Rozet Ata</h2>
          <form action={assign} className="grid gap-4 max-w-md">
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
              <label className="block text-sm font-medium mb-2">Rozet</label>
              <select name="badge" className="input" required>
                <option value="">Rozet seçin</option>
                {availableBadges.map((badge) => (
                  <option key={badge.code} value={badge.code}>
                    {badge.icon} {badge.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Rozet Ata
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Rozet Kaldır</h2>
          <form action={remove} className="grid gap-4 max-w-md">
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
              <label className="block text-sm font-medium mb-2">Rozet</label>
              <select name="badge" className="input" required>
                <option value="">Rozet seçin</option>
                {availableBadges.map((badge) => (
                  <option key={badge.code} value={badge.code}>
                    {badge.icon} {badge.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-danger">
              Rozeti Kaldır
            </button>
          </form>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Mevcut Rozetler</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {availableBadges.map((badge) => (
            <div key={badge.code} className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="font-semibold">{badge.name}</div>
              <div className="text-sm text-muted">{badge.code}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Kullanıcı Rozetleri</h2>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rozetler</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
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
                    <div className="flex flex-wrap gap-2">
                      {user.user_badges?.map((badge: any) => {
                        const badgeInfo = availableBadges.find(b => b.code === badge.badge_code)
                        return (
                          <span key={badge.badge_code} className="badge badge-info">
                            {badgeInfo?.icon} {badgeInfo?.name || badge.badge_code}
                          </span>
                        )
                      }) || <span className="text-muted">Rozet yok</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {user.user_badges?.map((badge: any) => (
                        <form key={badge.badge_code} action={remove}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="badge" value={badge.badge_code} />
                          <button 
                            type="submit" 
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              if (!confirm('Bu rozeti kaldırmak istediğinizden emin misiniz?')) {
                                e.preventDefault()
                              }
                            }}
                          >
                            Kaldır
                          </button>
                        </form>
                      ))}
                    </div>
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




