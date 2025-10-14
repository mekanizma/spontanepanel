'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  badges: Badge
  users: User
}

async function getBadges(): Promise<Badge[]> {
  console.log('🏆 Badges yükleniyor...')
  
  const supabase = createClientComponentClient()

  try {
    console.log('🏆 Badges tablosundan veri çekiliyor...')
    const { data: badges, error } = await supabase
      .from('badges')
      .select(`
        id,
        name,
        description,
        icon_url,
        color,
        created_at
      `)
      .order('created_at', { ascending: false })

    console.log('🏆 Badges sonucu:', { count: badges?.length, error })

    if (error) {
      console.error('Rozetler yüklenirken hata:', error)
      // Badges tablosu yoksa boş array döndür
      if (error.code === 'PGRST205') {
        console.log('⚠️ Badges tablosu bulunamadı, boş array döndürülüyor')
        return []
      }
      throw new Error('Rozetler yüklenirken hata oluştu')
    }

    return badges || []
  } catch (error) {
    console.error('Rozetler yüklenirken genel hata:', error)
    // Badges tablosu yoksa boş array döndür
    if (error instanceof Error && error.message.includes('PGRST205')) {
      console.log('⚠️ Badges tablosu bulunamadı, boş array döndürülüyor')
      return []
    }
    throw new Error('Rozetler yüklenirken hata oluştu')
  }
}

async function getAllUsers(): Promise<User[]> {
  const supabase = createClientComponentClient()
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        full_name,
        profile_image_url
      `)
      .order('username', { ascending: true })

    if (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
      throw new Error('Kullanıcılar yüklenirken hata oluştu')
    }

    return users || []
  } catch (error) {
    console.error('Kullanıcılar yüklenirken genel hata:', error)
    throw new Error('Kullanıcılar yüklenirken hata oluştu')
  }
}

async function getUserBadges(): Promise<UserBadge[]> {
  const supabase = createClientComponentClient()
  
  try {
    const { data: userBadges, error } = await supabase
      .from('user_badges')
      .select(`
        id,
        user_id,
        badge_id,
        assigned_at,
        badges!badge_id (
          id,
          name,
          description,
          icon_url,
          color
        ),
        users!user_id (
          id,
          username,
          email,
          full_name,
          profile_image_url
        )
      `)
      .order('assigned_at', { ascending: false })

    if (error) {
      console.error('Kullanıcı rozetleri yüklenirken hata:', error)
      // User badges tablosu yoksa boş array döndür
      if (error.code === 'PGRST205') {
        console.log('⚠️ User badges tablosu bulunamadı, boş array döndürülüyor')
        return []
      }
      throw new Error('Kullanıcı rozetleri yüklenirken hata oluştu')
    }

    return userBadges || []
  } catch (error) {
    console.error('Kullanıcı rozetleri yüklenirken genel hata:', error)
    // User badges tablosu yoksa boş array döndür
    if (error instanceof Error && error.message.includes('PGRST205')) {
      console.log('⚠️ User badges tablosu bulunamadı, boş array döndürülüyor')
      return []
    }
    throw new Error('Kullanıcı rozetleri yüklenirken hata oluştu')
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
        setBadges(badgesData)
        setUsers(usersData)
        setUserBadges(userBadgesData)
        setLoading(false)
      } catch (err) {
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
      const supabase = createClientComponentClient()
      
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: selectedUser,
          badge_id: selectedBadge,
          assigned_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Rozet atanırken hata:', error)
        alert('Rozet atanırken hata oluştu')
        return
      }
      
      // Listeyi yenile
      const userBadgesData = await getUserBadges()
      setUserBadges(userBadgesData)
      
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
      const supabase = createClientComponentClient()
      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('id', userBadgeId)
      
      if (error) {
        console.error('Rozet kaldırılırken hata:', error)
        alert('Rozet kaldırılırken hata oluştu')
        return
      }
      
      // Listeyi yenile
      const userBadgesData = await getUserBadges()
      setUserBadges(userBadgesData)
      
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
                {badges.map((badge) => (
                  <option key={badge.id} value={badge.id}>
                    {badge.name} - {badge.description}
                  </option>
                ))}
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
      
      {/* Mevcut Rozetler */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Mevcut Rozetler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {badge.icon_url ? (
                    <img 
                      src={badge.icon_url} 
                      alt={badge.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">🏆</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{badge.name}</div>
                  <div className="text-sm text-muted">{badge.description}</div>
                </div>
              </div>
              <div className="text-xs text-muted">
                Renk: <span className="badge" style={{backgroundColor: badge.color}}>{badge.color}</span>
              </div>
            </div>
          ))}
        </div>
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
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {userBadge.users?.profile_image_url ? (
                          <img 
                            src={userBadge.users.profile_image_url} 
                            alt={userBadge.users.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {userBadge.users?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{userBadge.users?.full_name || userBadge.users?.username}</div>
                        <div className="text-sm text-muted">@{userBadge.users?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        {userBadge.badges?.icon_url ? (
                          <img 
                            src={userBadge.badges.icon_url} 
                            alt={userBadge.badges.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">🏆</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{userBadge.badges?.name}</div>
                        <div className="text-sm text-muted">{userBadge.badges?.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(userBadge.assigned_at).toLocaleDateString('tr-TR')}
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