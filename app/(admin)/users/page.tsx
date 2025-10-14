'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  username: string
  email: string
  full_name: string
  created_at: string
  is_premium: boolean
  is_verified: boolean
  is_suspended: boolean
  premium_expires_at: string | null
  profile_image_url: string | null
  event_count: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUsers() {
      console.log('👥 Users yükleniyor...')
      
      // Doğrudan Supabase client oluştur
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://fbiibwhupuxizqacvhdt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaWlid2h1cHV4aXpxYWN2aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
      )
      
      try {
        console.log('👥 Users tablosundan veri çekiliyor...')
        const { data: users, error } = await supabase
          .from('users')
          .select(`
            id,
            username,
            email,
            full_name,
            created_at,
            is_premium,
            is_verified,
            is_suspended,
            premium_expires_at,
            profile_image_url
          `)
          .order('created_at', { ascending: false })

        console.log('👥 Users sonucu:', { count: users?.length, error })

        if (error) {
          console.error('Kullanıcılar yüklenirken hata:', error)
          setError('Kullanıcılar yüklenirken hata oluştu')
          setLoading(false)
          return
        }

        // Her kullanıcı için etkinlik sayısını al
        const usersWithEventCounts = await Promise.all(
          (users || []).map(async (user) => {
            try {
              const { count: eventCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('creator_id', user.id)
              
              return {
                ...user,
                event_count: eventCount || 0
              }
            } catch (error) {
              console.error(`Kullanıcı ${user.id} için etkinlik sayısı alınırken hata:`, error)
              return {
                ...user,
                event_count: 0
              }
            }
          })
        )

        setUsers(usersWithEventCounts)
        setLoading(false)
      } catch (error) {
        console.error('Kullanıcılar yüklenirken genel hata:', error)
        setError('Kullanıcılar yüklenirken hata oluştu')
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  async function suspendUser(userId: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://fbiibwhupuxizqacvhdt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaWlid2h1cHV4aXpxYWN2aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
      )
      const { error } = await supabase.from('users').update({ is_suspended: true }).eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı askıya alınırken hata:', error)
        return
      }
      
      // UI'yi güncelle
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_suspended: true } : user
      ))
    } catch (error) {
      console.error('Kullanıcı askıya alınırken genel hata:', error)
    }
  }

  async function unsuspendUser(userId: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://fbiibwhupuxizqacvhdt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaWlid2h1cHV4aXpxYWN2aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
      )
      const { error } = await supabase.from('users').update({ is_suspended: false }).eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı askıdan çıkarılırken hata:', error)
        return
      }
      
      // UI'yi güncelle
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_suspended: false } : user
      ))
    } catch (error) {
      console.error('Kullanıcı askıdan çıkarılırken genel hata:', error)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://fbiibwhupuxizqacvhdt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaWlid2h1cHV4aXpxYWN2aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
      )
      const { error } = await supabase.from('users').delete().eq('id', userId)
      
      if (error) {
        console.error('Kullanıcı silinirken hata:', error)
        return
      }
      
      // UI'den kaldır
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Kullanıcı silinirken genel hata:', error)
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Kullanıcı Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Kullanıcılar yükleniyor...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Kullanıcı Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Kullanıcı Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Kayıt Tarihi</th>
                <th>Etkinlik Sayısı</th>
                <th>Durum</th>
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
                        <div className="text-xs text-muted">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">{user.email}</div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="text-center">
                      <span className="badge badge-info">{user.event_count}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      {user.is_premium && (
                        <span className="badge badge-success">Premium</span>
                      )}
                      {user.is_verified && (
                        <span className="badge badge-info">Doğrulanmış</span>
                      )}
                      {user.is_suspended && (
                        <span className="badge badge-error">Askıda</span>
                      )}
                      {!user.is_premium && !user.is_verified && !user.is_suspended && (
                        <span className="badge badge-warning">Normal</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {user.is_suspended ? (
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