// import { getServerSupabase } from '@/lib/supabaseServer'
// import { redirect } from 'next/navigation'

async function getPremiumUsers() {
  const supabase = await getServerSupabase()

  try {
    const { data: premiumUsers, error } = await supabase
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Premium kullanıcılar yüklenirken hata:', error)
      return []
    }

    return premiumUsers || []
  } catch (error) {
    console.error('Premium kullanıcılar yüklenirken genel hata:', error)
    return []
  }
}

async function getPremiumStats() {
  const supabase = await getServerSupabase()

  try {
    const { count: totalPremium } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)

    const { count: activePremium } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)
      .gt('premium_expires_at', new Date().toISOString())

    const { count: expiredPremium } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)
      .lt('premium_expires_at', new Date().toISOString())

    return {
      totalPremium: totalPremium || 0,
      activePremium: activePremium || 0,
      expiredPremium: expiredPremium || 0
    }
  } catch (error) {
    console.error('Premium istatistikleri yüklenirken hata:', error)
    return {
      totalPremium: 0,
      activePremium: 0,
      expiredPremium: 0
    }
  }
}

export default async function PremiumPage() {
  // Geçici olarak auth kontrolünü devre dışı bırak
  // const supabase = await getServerSupabase()
  // const { data } = await supabase.auth.getUser()
  // if (!data.user) {
  //   redirect('/login?redirect=/premium')
  // }
  
  const premiumUsers = await getPremiumUsers()
  const stats = await getPremiumStats()

  async function revokePremium(formData: FormData) {
    'use server'
    try {
      const userId = String(formData.get('userId'))
      const supabase = await getServerSupabase()
      const { error } = await supabase
        .from('users')
        .update({ 
          is_premium: false,
          premium_expires_at: null
        })
        .eq('id', userId)
      
      if (error) {
        console.error('Premium iptal edilirken hata:', error)
      }
    } catch (error) {
      console.error('Premium iptal edilirken genel hata:', error)
    }
  }

  async function extendPremium(formData: FormData) {
    'use server'
    try {
      const userId = String(formData.get('userId'))
      const months = parseInt(String(formData.get('months')))
      
      if (!months || months <= 0) {
        console.error('Geçersiz ay sayısı')
        return
      }

      const supabase = await getServerSupabase()
      
      // Mevcut premium bitiş tarihini al
      const { data: user } = await supabase
        .from('users')
        .select('premium_expires_at')
        .eq('id', userId)
        .single()

      let newExpiryDate
      if (user?.premium_expires_at && new Date(user.premium_expires_at) > new Date()) {
        // Mevcut tarihten itibaren uzat
        newExpiryDate = new Date(user.premium_expires_at)
        newExpiryDate.setMonth(newExpiryDate.getMonth() + months)
      } else {
        // Bugünden itibaren başlat
        newExpiryDate = new Date()
        newExpiryDate.setMonth(newExpiryDate.getMonth() + months)
      }

      const { error } = await supabase
        .from('users')
        .update({ 
          is_premium: true,
          premium_expires_at: newExpiryDate.toISOString()
        })
        .eq('id', userId)
      
      if (error) {
        console.error('Premium uzatılırken hata:', error)
      }
    } catch (error) {
      console.error('Premium uzatılırken genel hata:', error)
    }
  }

  return (
    <main>
      <h1>Premium Yönetimi</h1>
      
      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="card border-2 border-purple-200 bg-purple-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⭐</span>
            <span className="text-3xl font-bold">{stats.totalPremium}</span>
          </div>
          <div className="text-sm text-muted font-medium">Toplam Premium</div>
        </div>
        
        <div className="card border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-3xl font-bold">{stats.activePremium}</span>
          </div>
          <div className="text-sm text-muted font-medium">Aktif Premium</div>
        </div>
        
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⏰</span>
            <span className="text-3xl font-bold">{stats.expiredPremium}</span>
          </div>
          <div className="text-sm text-muted font-medium">Süresi Dolmuş</div>
        </div>
      </div>

      {/* Premium Kullanıcılar */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Premium Kullanıcılar</h2>
        
        {premiumUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">Henüz premium kullanıcı yok</h3>
            <p className="text-muted">Premium kullanıcılar burada görünecek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>E-posta</th>
                  <th>Premium Bitiş Tarihi</th>
                  <th>Durum</th>
                  <th>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {premiumUsers.map((user) => {
                  const isExpired = user.premium_expires_at && new Date(user.premium_expires_at) < new Date()
                  const isExpiringSoon = user.premium_expires_at && 
                    new Date(user.premium_expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                    new Date(user.premium_expires_at) > new Date()

                  return (
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
                            'Sınırsız'
                          }
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {isExpired ? (
                            <span className="badge badge-error">Süresi Dolmuş</span>
                          ) : isExpiringSoon ? (
                            <span className="badge badge-warning">Yakında Dolacak</span>
                          ) : (
                            <span className="badge badge-success">Aktif</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <form action={extendPremium} className="flex gap-2">
                            <input type="hidden" name="userId" value={user.id} />
                            <select name="months" className="input text-sm" style={{ width: '80px' }}>
                              <option value="1">1 Ay</option>
                              <option value="3">3 Ay</option>
                              <option value="6">6 Ay</option>
                              <option value="12">12 Ay</option>
                            </select>
                            <button type="submit" className="btn btn-success btn-sm">
                              Uzat
                            </button>
                          </form>
                          
                          <form action={revokePremium}>
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
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}