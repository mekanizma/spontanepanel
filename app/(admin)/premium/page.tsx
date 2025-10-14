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

export default function PremiumPage() {
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPremiumUsers() {
      try {
        const premiumUsersData = await getPremiumUsers()
        setPremiumUsers(premiumUsersData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadPremiumUsers()
  }, [])

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
        return
      }
      
      // UI'den kaldır
      setPremiumUsers(premiumUsers.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Premium üyelik iptal edilirken genel hata:', error)
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
      
      <div className="card mt-6">
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