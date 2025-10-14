'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface User {
  id: string
  username: string
  email: string
  full_name: string
  created_at: string
  is_premium: boolean
  is_verified: boolean
  status: string
  premium_expires_at: string | null
  profile_image_url: string | null
  event_count: number
}

interface UserActionsProps {
  user: User
  onUpdate: () => void
}

export default function UserActions({ user, onUpdate }: UserActionsProps) {
  async function suspendUser(userId: string) {
    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.from('users').update({ status: 'suspended' }).eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı askıya alınırken hata:', error)
        alert('Kullanıcı askıya alınırken hata oluştu')
        return
      }
      
      alert('Kullanıcı başarıyla askıya alındı')
      onUpdate()
    } catch (error) {
      console.error('Kullanıcı askıya alınırken genel hata:', error)
      alert('Kullanıcı askıya alınırken hata oluştu')
    }
  }

  async function unsuspendUser(userId: string) {
    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.from('users').update({ status: 'active' }).eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı askıdan çıkarılırken hata:', error)
        alert('Kullanıcı askıdan çıkarılırken hata oluştu')
        return
      }
      
      alert('Kullanıcı başarıyla askıdan çıkarıldı')
      onUpdate()
    } catch (error) {
      console.error('Kullanıcı askıdan çıkarılırken genel hata:', error)
      alert('Kullanıcı askıdan çıkarılırken hata oluştu')
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.from('users').delete().eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı silinirken hata:', error)
        alert('Kullanıcı silinirken hata oluştu')
        return
      }
      
      alert('Kullanıcı başarıyla silindi')
      onUpdate()
    } catch (error) {
      console.error('Kullanıcı silinirken genel hata:', error)
      alert('Kullanıcı silinirken hata oluştu')
    }
  }

  return (
    <div className="flex gap-2">
      {user.status === 'suspended' ? (
        <button 
          onClick={() => unsuspendUser(user.id)}
          className="btn btn-success btn-sm"
        >
          Askıdan Çıkar
        </button>
      ) : (
        <button 
          onClick={() => suspendUser(user.id)}
          className="btn btn-warning btn-sm"
        >
          Askıya Al
        </button>
      )}
      
      <button 
        onClick={() => deleteUser(user.id)}
        className="btn btn-danger btn-sm"
      >
        Sil
      </button>
    </div>
  )
}
