'use client'

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
      const res = await fetch(`/api/admin/users?action=suspend&id=${userId}`, { method: 'POST' })
      if (!res.ok) {
        throw new Error('Request failed')
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
      const res = await fetch(`/api/admin/users?action=unsuspend&id=${userId}`, { method: 'POST' })
      if (!res.ok) {
        throw new Error('Request failed')
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
      const res = await fetch(`/api/admin/users?action=delete&id=${userId}`, { method: 'POST' })
      if (!res.ok) {
        throw new Error('Request failed')
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
          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          Askıdan Çıkar
        </button>
      ) : (
        <button 
          onClick={() => suspendUser(user.id)}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
        >
          Askıya Al
        </button>
      )}
      
      <button 
        onClick={() => deleteUser(user.id)}
        className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
      >
        Sil
      </button>
    </div>
  )
}
