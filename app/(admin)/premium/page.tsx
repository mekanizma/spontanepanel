import { createServiceSupabaseClient } from '@/lib/supabaseService'
import PremiumForm from './PremiumForm'

interface PremiumUser {
  id: string
  username: string
  email: string
  full_name: string
  is_premium: boolean
  premium_expires_at: string | null
  created_at: string
  profile_image_url: string | null
}

async function getPremiumUsers(): Promise<PremiumUser[]> {
  console.log('⭐ Premium Users yükleniyor...')
  
  const supabase = createServiceSupabaseClient()

  try {
    console.log('⭐ Premium Users tablosundan veri çekiliyor...')
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

    console.log('⭐ Premium Users sonucu:', { count: premiumUsers?.length, error })

    if (error) {
      console.error('Premium kullanıcılar yüklenirken hata:', error)
      throw new Error('Premium kullanıcılar yüklenirken hata oluştu')
    }

    return premiumUsers || []
  } catch (error) {
    console.error('Premium kullanıcılar yüklenirken genel hata:', error)
    throw new Error('Premium kullanıcılar yüklenirken hata oluştu')
  }
}

export default async function PremiumPage() {
  let premiumUsers: PremiumUser[]
  let error: string | null = null

  try {
    premiumUsers = await getPremiumUsers()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bilinmeyen hata'
    premiumUsers = []
  }

  if (error) {
    return (
      <main>
        <h1>Premium Üye Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Premium Üye Yönetimi</h1>
      
      <PremiumForm onUpdate={() => window.location.reload()} />
      
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
                      {user.premium_expires_at ? (
                        <span className="badge badge-warning">
                          {new Date(user.premium_expires_at).toLocaleDateString('tr-TR')}
                        </span>
                      ) : (
                        <span className="badge badge-success">Süresiz</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-muted">
                      Premium Aktif
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