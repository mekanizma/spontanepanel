'use client'

import React, { useState, useEffect } from 'react'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

interface User {
  id: string
  username: string
  email: string
  full_name: string
  profile_image_url: string | null
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

async function getAllUsers(): Promise<User[]> {
  const supabase = createServiceSupabaseClient()
  
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

export default function BadgesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')

  // Mevcut rozetler
  const badges: Badge[] = [
    { id: 'early_bird', name: 'Erken Kuş', description: 'İlk 100 kullanıcıdan biri', icon: '🐦', color: 'badge-warning' },
    { id: 'event_master', name: 'Etkinlik Ustası', description: '10+ etkinlik oluşturdu', icon: '🎉', color: 'badge-success' },
    { id: 'social_butterfly', name: 'Sosyal Kelebek', description: '50+ arkadaş edindi', icon: '🦋', color: 'badge-info' },
    { id: 'premium_member', name: 'Premium Üye', description: 'Premium üyelik sahibi', icon: '⭐', color: 'badge-primary' },
    { id: 'verified_user', name: 'Doğrulanmış Kullanıcı', description: 'Kimlik doğrulaması tamamlandı', icon: '✅', color: 'badge-success' },
    { id: 'community_helper', name: 'Topluluk Yardımcısı', description: 'Topluluk kurallarına uygun', icon: '🤝', color: 'badge-secondary' },
    { id: 'creative_mind', name: 'Yaratıcı Zihin', description: 'Yaratıcı içerik üreticisi', icon: '🎨', color: 'badge-accent' },
    { id: 'night_owl', name: 'Gece Kuşu', description: 'Gece saatlerinde aktif', icon: '🦉', color: 'badge-neutral' }
  ]

  useEffect(() => {
    async function loadUsers() {
      try {
        const usersData = await getAllUsers()
        setUsers(usersData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  async function assignBadge() {
    if (!selectedUser || !selectedBadge) {
      alert('Lütfen kullanıcı ve rozet seçin')
      return
    }

    try {
      const supabase = createServiceSupabaseClient()
      
      // Rozet atama işlemi (user_badges tablosuna ekle)
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

  if (loading) {
    return (
      <main>
        <h1>Rozet Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Kullanıcılar yükleniyor...</div>
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
                    {badge.icon} {badge.name} - {badge.description}
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
            <div key={badge.id} className="card bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <h3 className="font-semibold">{badge.name}</h3>
                  <p className="text-sm text-muted">{badge.description}</p>
                  <span className={`badge ${badge.color} mt-2`}>
                    {badge.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Kullanıcı Listesi */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Kullanıcılar</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
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
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">{user.email}</div>
                  </td>
                  <td>
                    <button 
                      onClick={() => {
                        setSelectedUser(user.id)
                        setShowAssignForm(true)
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Rozet Ata
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