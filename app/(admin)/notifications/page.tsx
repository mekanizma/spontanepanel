import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function NotificationsPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/notifications')
  }

  async function sendNotification(formData: FormData) {
    'use server'
    const title = String(formData.get('title'))
    const message = String(formData.get('message'))
    const type = String(formData.get('type'))
    
    const supabase = await getServerSupabase()
    
    // Tüm kullanıcılara bildirim gönder
    const { data: users } = await supabase
      .from('users')
      .select('id')
    
    if (users) {
      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
      }))
      
      await supabase.from('notifications').insert(notifications)
    }
  }

  return (
    <main>
      <h1>Bildirim Yönetimi</h1>
      
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Herkese Bildirim Gönder</h2>
        
        <form action={sendNotification} className="grid gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium mb-2">Bildirim Başlığı</label>
            <input 
              name="title" 
              className="input" 
              placeholder="Örn: Yeni özellik duyurusu"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mesaj</label>
            <textarea 
              name="message" 
              className="input" 
              rows={4}
              placeholder="Bildirim mesajınızı buraya yazın..."
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bildirim Türü</label>
            <select name="type" className="input" defaultValue="announcement">
              <option value="announcement">Duyuru</option>
              <option value="update">Güncelleme</option>
              <option value="maintenance">Bakım</option>
              <option value="promotion">Promosyon</option>
              <option value="warning">Uyarı</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary">
            Bildirimi Gönder
          </button>
        </form>
      </div>
      
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Bildirim Örnekleri</h2>
        
        <div className="grid gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-green-600">Duyuru</h3>
            <p className="text-sm text-muted">
              "Yeni etkinlik kategorileri eklendi! Artık daha fazla seçenekle etkinlik oluşturabilirsiniz."
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-blue-600">Güncelleme</h3>
            <p className="text-sm text-muted">
              "Uygulama güncellemesi mevcut! Yeni özellikler ve iyileştirmeler için uygulamayı güncelleyin."
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-yellow-600">Bakım</h3>
            <p className="text-sm text-muted">
              "Sistem bakımı nedeniyle 2 saat boyunca hizmet veremeyeceğiz. Anlayışınız için teşekkürler."
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-purple-600">Promosyon</h3>
            <p className="text-sm text-muted">
              "Premium üyelik %50 indirimle! Sınırlı süre için özel fiyatlardan yararlanın."
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
