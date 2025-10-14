'use client'

import { createServiceSupabaseClient } from '@/lib/supabaseService'
import { useState } from 'react'

interface NotificationFormProps {
  onUpdate: () => void
}

export default function NotificationForm({ onUpdate }: NotificationFormProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'announcement'
  })

  async function sendPushNotification() {
    if (!form.title || !form.message) {
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
            title: form.title,
            message: form.message,
            type: form.type,
            is_read: false
          })
        )
        
        await Promise.all(notificationPromises)
        
        // Formu sıfırla
        setForm({ title: '', message: '', type: 'announcement' })
        setShowForm(false)
        
        alert(`Başarıyla ${users.length} kullanıcıya bildirim gönderildi!`)
        onUpdate()
      } else {
        alert('Gönderilecek kullanıcı bulunamadı')
      }
    } catch (error) {
      console.error('Bildirim gönderilirken hata:', error)
      alert('Bildirim gönderilirken hata oluştu')
    }
  }

  return (
    <div className="card mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Push Notification Gönder</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Formu Gizle' : 'Yeni Bildirim Gönder'}
        </button>
      </div>
      
      {showForm && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Başlık</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              className="input w-full"
              placeholder="Bildirim başlığı"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mesaj</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
              className="input w-full"
              rows={3}
              placeholder="Bildirim mesajı"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tür</label>
            <select
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
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
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
