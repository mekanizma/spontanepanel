'use client'

import { useState, useEffect } from 'react'

interface Badge {
  id: string
  name: string
  description: string
  icon_url: string | null
  color: string
  created_at: string
}

interface User {
  id: string
  username: string
  email: string
  full_name: string
  profile_image_url: string | null
}

interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  assigned_at: string
  badges: Badge[] | null
  users: User[] | null
}

async function getBadges(): Promise<Badge[]> {
  console.log('🏆 Badges yükleniyor...')
  
  try {
    const res = await fetch('/api/admin/badges', { cache: 'no-store' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    const body = await res.json()
    console.log('📊 API\'den gelen rozetler:', body.badges?.length || 0, 'adet')
    console.log('📋 Rozet isimleri:', body.badges?.map((b: any) => b.name) || [])
    return body.badges || []
  } catch (error) {
    console.error('❌ Rozetler yüklenirken genel hata:', error)
    return []
  }
}

async function getAllUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/admin/users/all', { cache: 'no-store' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    const body = await res.json()
    return body.users || []
  } catch (error) {
    console.error('Kullanıcılar yüklenirken genel hata:', error)
    throw new Error('Kullanıcılar yüklenirken hata oluştu')
  }
}

async function getUserBadges(): Promise<UserBadge[]> {
  try {
    const res = await fetch('/api/admin/badges/user-badges', { cache: 'no-store' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error('❌ User badges API hatası:', body.error || `HTTP ${res.status}`)
      return []
    }
    const body = await res.json()
    console.log('✅ User badges verisi:', body.userBadges?.length || 0, 'adet')
    return body.userBadges || []
  } catch (error) {
    console.error('❌ Kullanıcı rozetleri yüklenirken genel hata:', error)
    return []
  }
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [badgesData, usersData, userBadgesData] = await Promise.all([
          getBadges(),
          getAllUsers(),
          getUserBadges()
        ])
        console.log('✅ Badges yüklendi:', badgesData.length, 'adet')
        console.log('✅ Users yüklendi:', usersData.length, 'adet')
        console.log('✅ User badges yüklendi:', userBadgesData.length, 'adet')
        
        setBadges(badgesData)
        setUsers(usersData)
        
        // Sıralama
        const sortedBadges = [...userBadgesData].sort((a, b) => {
          const aDate = a.assigned_at ? new Date(a.assigned_at).getTime() : 0
          const bDate = b.assigned_at ? new Date(b.assigned_at).getTime() : 0
          return bDate - aDate
        })
        
        setUserBadges(sortedBadges)
        setLoading(false)
      } catch (err) {
        console.error('❌ Load data hatası:', err)
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function assignBadge() {
    if (!selectedUser || !selectedBadge) {
      alert('Lütfen kullanıcı ve rozet seçin')
      return
    }

    try {
      const res = await fetch('/api/admin/badges/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser,
          badge_id: selectedBadge
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Rozet atanırken hata oluştu')
        return
      }
      
      // Listeyi yenile
      const userBadgesData = await getUserBadges()
      console.log('🔄 Yeni user badges data:', userBadgesData.length)
      
      // Sıralama
      const sortedBadges = userBadgesData.sort((a, b) => {
        const aDate = a.assigned_at ? new Date(a.assigned_at).getTime() : 0
        const bDate = b.assigned_at ? new Date(b.assigned_at).getTime() : 0
        return bDate - aDate
      })
      
      setUserBadges(sortedBadges)
      
      // Formu sıfırla
      setSelectedUser('')
      setSelectedBadge('')
      setShowAssignForm(false)
      
      alert('Rozet başarıyla atandı!')
    } catch (error) {
      console.error('Rozet atanırken genel hata:', error)
      alert('Rozet atanırken hata oluştu')
    }
  }

  async function removeBadge(userBadgeId: string) {
    if (!confirm('Bu rozeti kullanıcıdan kaldırmak istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const res = await fetch(`/api/admin/badges/remove?id=${userBadgeId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Rozet kaldırılırken hata oluştu')
        return
      }
      
      // Listeyi yenile
      const userBadgesData = await getUserBadges()
      
      // Sıralama
      const sortedBadges = userBadgesData.sort((a, b) => {
        const aDate = a.assigned_at ? new Date(a.assigned_at).getTime() : 0
        const bDate = b.assigned_at ? new Date(b.assigned_at).getTime() : 0
        return bDate - aDate
      })
      
      setUserBadges(sortedBadges)
      
      alert('Rozet başarıyla kaldırıldı!')
    } catch (error) {
      console.error('Rozet kaldırılırken genel hata:', error)
      alert('Rozet kaldırılırken hata oluştu')
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Rozet Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Rozetler yükleniyor...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Rozet Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Rozet Yönetimi</h1>
      
      {/* Rozet Atama Formu */}
      <div className="card mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Rozet Atama</h2>
          <button 
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="btn btn-primary"
          >
            {showAssignForm ? 'Formu Gizle' : 'Yeni Rozet Ata'}
          </button>
        </div>
        
        {showAssignForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kullanıcı Seç</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="input w-full"
              >
                <option value="">Kullanıcı seçin...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rozet Seç</label>
              <select
                value={selectedBadge}
                onChange={(e) => setSelectedBadge(e.target.value)}
                className="input w-full"
              >
                <option value="">Rozet seçin...</option>
                {badges.length === 0 ? (
                  <option value="" disabled>Henüz rozet yok - Önce rozet oluşturun</option>
                ) : (
                  badges.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name} - {badge.description}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={assignBadge}
                className="btn btn-success"
              >
                Rozet Ata
              </button>
              <button 
                onClick={() => setShowAssignForm(false)}
                className="btn btn-secondary"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Kullanıcı Rozetleri */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Kullanıcı Rozetleri</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rozet</th>
                <th>Atama Tarihi</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {userBadges.map((userBadge) => (
                <tr key={userBadge.id}>
                  <td>
                    <div>
                      <div className="font-medium">{userBadge.users?.[0]?.full_name || userBadge.users?.[0]?.username}</div>
                      <div className="text-sm text-muted">@{userBadge.users?.[0]?.username}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        {userBadge.badges?.[0]?.icon_url ? (
                          <img 
                            src={userBadge.badges[0].icon_url} 
                            alt={userBadge.badges[0].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">🏆</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{userBadge.badges?.[0]?.name}</div>
                        <div className="text-sm text-muted">{userBadge.badges?.[0]?.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {userBadge.assigned_at ? new Date(userBadge.assigned_at).toLocaleDateString('tr-TR') : '-'}
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => removeBadge(userBadge.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Kaldır
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