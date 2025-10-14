import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getUsers() {
  console.log('👥 Users yükleniyor...')
  const supabase = await getServerSupabase()
  
  try {
    console.log('👥 Users tablosundan veri çekiliyor...')
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        full_name,
        created_at,
        is_premium,
        is_verified,
        is_suspended,
        premium_expires_at,
        profile_image_url
      `)
      .order('created_at', { ascending: false })

    console.log('👥 Users sonucu:', { count: users?.length, error })

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
    return []
  }
}

export default async function UsersPage() {
  // Geçici olarak auth kontrolünü devre dışı bırak
  // const supabase = await getServerSupabase()
  // const { data } = await supabase.auth.getUser()
  // if (!data.user) {
  //   redirect('/login?redirect=/users')
  // }
  
  const users = await getUsers()

  async function suspendUser(formData: FormData) {
    'use server'
    try {
      const userId = String(formData.get('userId'))
      const supabase = await getServerSupabase()
      const { error } = await supabase.from('users').update({ is_suspended: true }).eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı askıya alınırken hata:', error)
      }
    } catch (error) {
      console.error('Kullanıcı askıya alınırken genel hata:', error)
    }
  }

  async function unsuspendUser(formData: FormData) {
    'use server'
    try {
      const userId = String(formData.get('userId'))
      const supabase = await getServerSupabase()
      const { error } = await supabase.from('users').update({ is_suspended: false }).eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı askıdan çıkarılırken hata:', error)
      }
    } catch (error) {
      console.error('Kullanıcı askıdan çıkarılırken genel hata:', error)
    }
  }

  async function deleteUser(formData: FormData) {
    'use server'
    try {
      const userId = String(formData.get('userId'))
      const supabase = await getServerSupabase()
      const { error } = await supabase.from('users').delete().eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı silinirken hata:', error)
      }
    } catch (error) {
      console.error('Kullanıcı silinirken genel hata:', error)
    }
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
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
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
                      {user.is_suspended && (
                        <span className="badge badge-error">Askıda</span>
                      )}
                      {!user.is_premium && !user.is_verified && !user.is_suspended && (
                        <span className="badge badge-warning">Normal</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {user.is_suspended ? (
                        <form action={unsuspendUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className="btn btn-success btn-sm">
                            Askıdan Çıkar
                          </button>
                        </form>
                      ) : (
                        <form action={suspendUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className="btn btn-warning btn-sm">
                            Askıya Al
                          </button>
                        </form>
                      )}
                      
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button 
                          type="submit" 
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
                              e.preventDefault()
                            }
                          }}
                        >
                          Sil
                        </button>
                      </form>
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
