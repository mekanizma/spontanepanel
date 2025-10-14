import { createServiceSupabaseClient } from '@/lib/supabaseService'
import UserActions from './UserActions'

interface User {
  id: string
  username: string
  email: string
  full_name: string
  join_date: string
  is_premium: boolean
  is_verified: boolean
  status: string
  premium_expires_at: string | null
  profile_image_url: string | null
  event_count: number
}

async function getUsers(): Promise<User[]> {
  console.log('👥 Users yükleniyor...')
  
  const supabase = createServiceSupabaseClient()
  
  try {
    console.log('👥 Users tablosundan veri çekiliyor...')
    
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        full_name,
        join_date,
        is_premium,
        is_verified,
        status,
        premium_expires_at,
        profile_image_url
      `)
      .order('join_date', { ascending: false })

    console.log('👥 Users sonucu:', { count: users?.length, error })

    if (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
      throw new Error('Kullanıcılar yüklenirken hata oluştu')
    }

    // Her kullanıcı için etkinlik sayısını al
    const usersWithEventCounts = await Promise.all(
      (users || []).map(async (user) => {
        try {
          const { count: eventCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', user.id)
          
          return {
            ...user,
            event_count: eventCount || 0
          }
        } catch (error) {
          console.error(`Kullanıcı ${user.id} için etkinlik sayısı alınırken hata:`, error)
          return {
            ...user,
            event_count: 0
          }
        }
      })
    )

    return usersWithEventCounts
  } catch (error) {
    console.error('Kullanıcılar yüklenirken genel hata:', error)
    throw new Error('Kullanıcılar yüklenirken hata oluştu')
  }
}

export default async function UsersPage() {
  let users: User[]
  let error: string | null = null

  try {
    users = await getUsers()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bilinmeyen hata'
    users = []
  }

  if (error) {
    return (
      <main>
        <h1>Kullanıcı Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Kullanıcı Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Kayıt Tarihi</th>
                <th>Etkinlik Sayısı</th>
                <th>Durum</th>
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
                    <div className="text-sm">{user.email}</div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(user.join_date).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="text-center">
                      <span className="badge badge-info">{user.event_count}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      {user.is_premium && (
                        <span className="badge badge-success">Premium</span>
                      )}
                      {user.is_verified && (
                        <span className="badge badge-info">Doğrulanmış</span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="badge badge-error">Askıda</span>
                      )}
                      {user.status === 'active' && !user.is_premium && !user.is_verified && (
                        <span className="badge badge-warning">Normal</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <UserActions user={user} onUpdate={() => window.location.reload()} />
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