import { createServiceSupabaseClient } from '@/lib/supabaseService'
import NotificationForm from './NotificationForm'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  users: {
    username: string
    full_name: string
    profile_image_url: string | null
  }[] | null
}

async function getNotifications(): Promise<Notification[]> {
  console.log('🔔 Notifications yükleniyor...')
  
  const supabase = createServiceSupabaseClient()

  try {
    console.log('🔔 Notifications tablosundan veri çekiliyor...')
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_at,
        users!user_id (
          username,
          full_name,
          profile_image_url
        )
      `)
      .order('created_at', { ascending: false })

    console.log('🔔 Notifications sonucu:', { count: notifications?.length, error })

    if (error) {
      console.error('Bildirimler yüklenirken hata:', error)
      throw new Error('Bildirimler yüklenirken hata oluştu')
    }

    return notifications || []
  } catch (error) {
    console.error('Bildirimler yüklenirken genel hata:', error)
    throw new Error('Bildirimler yüklenirken hata oluştu')
  }
}

export default async function NotificationsPage() {
  let notifications: Notification[]
  let error: string | null = null

  try {
    notifications = await getNotifications()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bilinmeyen hata'
    notifications = []
  }

  if (error) {
    return (
      <main>
        <h1>Bildirim Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Bildirim Yönetimi</h1>
      
      <NotificationForm onUpdate={() => window.location.reload()} />
      
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Mevcut Bildirimler</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Başlık</th>
                <th>Mesaj</th>
                <th>Tür</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {notification.users?.[0]?.profile_image_url ? (
                          <img 
                            src={notification.users[0].profile_image_url} 
                            alt={notification.users[0].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {notification.users?.[0]?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{notification.users?.[0]?.full_name || notification.users?.[0]?.username}</div>
                        <div className="text-sm text-muted">@{notification.users?.[0]?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{notification.title}</div>
                  </td>
                  <td>
                    <div className="text-sm text-muted line-clamp-2">
                      {notification.message}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{notification.type}</span>
                  </td>
                  <td>
                    {notification.is_read ? (
                      <span className="badge badge-success">Okundu</span>
                    ) : (
                      <span className="badge badge-warning">Okunmadı</span>
                    )}
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(notification.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-muted">
                      Görüntüle
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