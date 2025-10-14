'use client'

import React, { useState, useEffect } from 'react'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

interface PremiumUser {
  id: string
  username: string
  email: string
  full_name: string
  is_premium: boolean
  premium_expires_at: string | null
  created_at: string
  profile_image_url: string | null
}

interface User {
  id: string
  username: string
  email: string
  full_name: string
  is_premium: boolean
  profile_image_url: string | null
}

async function getPremiumUsers(): Promise<PremiumUser[]> {
  console.log('⭐ Premium Users yükleniyor...')
  
  const supabase = createServiceSupabaseClient()

  try {
    console.log('⭐ Premium Users tablosundan veri çekiliyor...')
    const { data: premiumUsers, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        full_name,
        is_premium,
        premium_expires_at,
        created_at,
        profile_image_url
      `)
      .eq('is_premium', true)
      .order('created_at', { ascending: false })

    console.log('⭐ Premium Users sonucu:', { count: premiumUsers?.length, error })

    if (error) {
      console.error('Premium kullanıcılar yüklenirken hata:', error)
      throw new Error('Premium kullanıcılar yüklenirken hata oluştu')
    }

    return premiumUsers || []
  } catch (error) {
    console.error('Premium kullanıcılar yüklenirken genel hata:', error)
    throw new Error('Premium kullanıcılar yüklenirken hata oluştu')
  }
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
        is_premium,
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

export default function PremiumPage() {
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [premiumDuration, setPremiumDuration] = useState('30') // gün

  useEffect(() => {
    async function loadData() {
      try {
        const [premiumData, usersData] = await Promise.all([
          getPremiumUsers(),
          getAllUsers()
        ])
        setPremiumUsers(premiumData)
        setAllUsers(usersData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function assignPremium() {
    if (!selectedUser) {
      alert('Lütfen bir kullanıcı seçin')
      return
    }

    try {
      const supabase = createServiceSupabaseClient()
      
      // Premium bitiş tarihini hesapla
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(premiumDuration))
      
      const { error } = await supabase
        .from('users')
        .update({ 
          is_premium: true,
          premium_expires_at: expiresAt.toISOString()
        })
        .eq('id', selectedUser)
      
      if (error) {
        console.error('Premium atanırken hata:', error)
        alert('Premium atanırken hata oluştu')
        return
      }
      
      // Listeyi yenile
      const premiumData = await getPremiumUsers()
      setPremiumUsers(premiumData)
      
      // Formu sıfırla
      setSelectedUser('')
      setPremiumDuration('30')
      setShowAssignForm(false)
      
      alert('Premium başarıyla atandı!')
    } catch (error) {
      console.error('Premium atanırken genel hata:', error)
      alert('Premium atanırken hata oluştu')
    }
  }

  async function revokePremium(userId: string) {
    if (!confirm('Bu kullanıcının premium üyeliğini iptal etmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const supabase = createServiceSupabaseClient()
      const { error } = await supabase
        .from('users')
        .update({ 
          is_premium: false,
          premium_expires_at: null
        })
        .eq('id', userId)
      
      if (error) {
        console.error('Premium üyelik iptal edilirken hata:', error)
        alert('Premium üyelik iptal edilirken hata oluştu')
        return
      }
      
      // Listeyi yenile
      const premiumData = await getPremiumUsers()
      setPremiumUsers(premiumData)
      
      alert('Premium üyelik başarıyla iptal edildi!')
    } catch (error) {
      console.error('Premium üyelik iptal edilirken genel hata:', error)
      alert('Premium üyelik iptal edilirken hata oluştu')
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Premium Üye Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Premium kullanıcılar yükleniyor...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Premium Üye Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Premium Üye Yönetimi</h1>
      
      {/* Premium Atama Formu */}
      <div className="card mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Premium Atama</h2>
          <button 
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="btn btn-primary"
          >
            {showAssignForm ? 'Formu Gizle' : 'Yeni Premium Ata'}
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
                {allUsers.filter(user => !user.is_premium).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Premium Süresi (gün)</label>
              <select
                value={premiumDuration}
                onChange={(e) => setPremiumDuration(e.target.value)}
                className="input w-full"
              >
                <option value="7">7 Gün</option>
                <option value="30">30 Gün</option>
                <option value="90">90 Gün</option>
                <option value="365">1 Yıl</option>
                <option value="9999">Süresiz</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={assignPremium}
                className="btn btn-success"
              >
                Premium Ata
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
      
      {/* Premium Kullanıcılar */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Premium Kullanıcılar</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Premium Bitiş Tarihi</th>
                <th>Kayıt Tarihi</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {premiumUsers.map((user) => (
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
                        <div className="text-xs text-muted">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">{user.email}</div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {user.premium_expires_at ? (
                        <span className="badge badge-warning">
                          {new Date(user.premium_expires_at).toLocaleDateString('tr-TR')}
                        </span>
                      ) : (
                        <span className="badge badge-success">Süresiz</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => revokePremium(user.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Premium İptal Et
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