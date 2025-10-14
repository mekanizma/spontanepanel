'use client'

import React, { useState, useEffect } from 'react'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSendForm, setShowSendForm] = useState(false)
  const [sendForm, setSendForm] = useState({
    title: '',
    message: '',
    type: 'announcement'
  })

  useEffect(() => {
    async function loadNotifications() {
      try {
        const notificationsData = await getNotifications()
        setNotifications(notificationsData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadNotifications()
  }, [])

  async function sendPushNotification() {
    if (!sendForm.title || !sendForm.message) {
      alert('Başlık ve mesaj alanları zorunludur')
      return
    }

    try {
      const supabase = createServiceSupabaseClient()
      
      // Tüm kullanıcılara bildirim gönder
      const { data: users } = await supabase.from('users').select('id')
      
      if (users && users.length > 0) {
        const notificationPromises = users.map(user => 
          supabase.from('notifications').insert({
            user_id: user.id,
            title: sendForm.title,
            message: sendForm.message,
            type: sendForm.type,
            is_read: false
          })
        )
        
        await Promise.all(notificationPromises)
        
        // Formu sıfırla
        setSendForm({ title: '', message: '', type: 'announcement' })
        setShowSendForm(false)
        
        // Bildirimleri yeniden yükle
        const notificationsData = await getNotifications()
        setNotifications(notificationsData)
        
        alert(`Başarıyla ${users.length} kullanıcıya bildirim gönderildi!`)
      } else {
        alert('Gönderilecek kullanıcı bulunamadı')
      }
    } catch (error) {
      console.error('Bildirim gönderilirken hata:', error)
      alert('Bildirim gönderilirken hata oluştu')
    }
  }

  async function deleteNotification(notificationId: string) {
    if (!confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const supabase = createServiceSupabaseClient()
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
      
      if (error) {
        console.error('Bildirim silinirken hata:', error)
        alert('Bildirim silinirken hata oluştu')
        return
      }
      
      // UI'den kaldır
      setNotifications(notifications.filter(notification => notification.id !== notificationId))
      alert('Bildirim başarıyla silindi')
    } catch (error) {
      console.error('Bildirim silinirken genel hata:', error)
      alert('Bildirim silinirken hata oluştu')
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Bildirim Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Bildirimler yükleniyor...</div>
        </div>
      </main>
    )
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
      
      {/* Push Notification Gönderme Formu */}
      <div className="card mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Push Notification Gönder</h2>
          <button 
            onClick={() => setShowSendForm(!showSendForm)}
            className="btn btn-primary"
          >
            {showSendForm ? 'Formu Gizle' : 'Yeni Bildirim Gönder'}
          </button>
        </div>
        
        {showSendForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input
                type="text"
                value={sendForm.title}
                onChange={(e) => setSendForm({...sendForm, title: e.target.value})}
                className="input w-full"
                placeholder="Bildirim başlığı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mesaj</label>
              <textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                className="input w-full"
                rows={3}
                placeholder="Bildirim mesajı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tür</label>
              <select
                value={sendForm.type}
                onChange={(e) => setSendForm({...sendForm, type: e.target.value})}
                className="input w-full"
              >
                <option value="announcement">Duyuru</option>
                <option value="update">Güncelleme</option>
                <option value="warning">Uyarı</option>
                <option value="info">Bilgi</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={sendPushNotification}
                className="btn btn-success"
              >
                Tüm Kullanıcılara Gönder
              </button>
              <button 
                onClick={() => setShowSendForm(false)}
                className="btn btn-secondary"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Mevcut Bildirimler */}
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
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Sil
                    </button>
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