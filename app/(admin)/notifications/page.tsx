import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getNotifications() {
  const supabase = await getServerSupabase()

  try {
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
      .limit(100)

    if (error) {
      console.error('Bildirimler yüklenirken hata:', error)
      return []
    }

    return notifications || []
  } catch (error) {
    console.error('Bildirimler yüklenirken genel hata:', error)
    return []
  }
}

export default async function NotificationsPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/notifications')
  }
  
  const notifications = await getNotifications()

  async function sendNotification(formData: FormData) {
    'use server'
    try {
      const title = String(formData.get('title'))
      const message = String(formData.get('message'))
      const type = String(formData.get('type'))
      const userId = String(formData.get('userId'))

      if (!title || !message || !type) {
        console.error('Eksik alanlar')
        return
      }

      const supabase = await getServerSupabase()
      
      if (userId && userId !== 'all') {
        // Belirli kullanıcıya gönder
        const { error } = await supabase.from('notifications').insert({
          user_id: userId,
          title,
          message,
          type,
          is_read: false
        })
        
        if (error) {
          console.error('Bildirim gönderilirken hata:', error)
        }
      } else {
        // Tüm kullanıcılara gönder - bu durumda tüm kullanıcıları alıp her birine gönder
        const { data: users } = await supabase.from('users').select('id')
        
        if (users) {
          const notificationInserts = users.map(user => ({
            user_id: user.id,
            title,
            message,
            type,
            is_read: false
          }))
          
          const { error } = await supabase.from('notifications').insert(notificationInserts)
          
          if (error) {
            console.error('Toplu bildirim gönderilirken hata:', error)
          }
        }
      }
    } catch (error) {
      console.error('Bildirim gönderilirken genel hata:', error)
    }
  }

  return (
    <main>
      <h1>Bildirim Yönetimi</h1>
      
      {/* Bildirim Gönderme Formu */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Yeni Bildirim Gönder</h2>
        <form action={sendNotification} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Başlık</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input"
              placeholder="Bildirim başlığı"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">Mesaj</label>
            <textarea
              id="message"
              name="message"
              required
              rows={3}
              className="input"
              placeholder="Bildirim mesajı"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">Tür</label>
            <select id="type" name="type" required className="input">
              <option value="info">Bilgi</option>
              <option value="warning">Uyarı</option>
              <option value="success">Başarı</option>
              <option value="error">Hata</option>
              <option value="announcement">Duyuru</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="userId" className="block text-sm font-medium mb-1">Hedef</label>
            <select id="userId" name="userId" className="input">
              <option value="all">Tüm Kullanıcılar</option>
              {/* Burada kullanıcı listesi olabilir */}
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary">
            Bildirim Gönder
          </button>
        </form>
      </div>

      {/* Bildirim Listesi */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Son Bildirimler</h2>
        
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold mb-2">Henüz bildirim yok</h3>
            <p className="text-muted">Gönderilen bildirimler burada görünecek.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${
                        notification.type === 'info' ? 'badge-info' :
                        notification.type === 'warning' ? 'badge-warning' :
                        notification.type === 'success' ? 'badge-success' :
                        notification.type === 'error' ? 'badge-error' :
                        'badge-info'
                      }`}>
                        {notification.type}
                      </span>
                      <span className="text-sm text-muted">
                        {new Date(notification.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold mb-1">{notification.title}</h3>
                    <p className="text-muted mb-2">{notification.message}</p>
                    
                    {notification.users && (
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <span>👤</span>
                        <span>{notification.users.full_name || notification.users.username}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {notification.is_read ? (
                      <span className="badge badge-success">Okundu</span>
                    ) : (
                      <span className="badge badge-warning">Okunmadı</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}