'use client'

import UserActions from './UserActions'
import { useState, useEffect } from 'react'

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

async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/admin/users', { cache: 'no-store' })
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

// İsim temizleme fonksiyonu
function getCleanUserName(user: User): string {
  // Eğer full_name varsa direkt kullan
  if (user.full_name) {
    // Full name'deki tüm sayıları ve gereksiz karakterleri temizle
    let cleanName = user.full_name;
    // Başındaki ve sonundaki sayıları temizle
    cleanName = cleanName.replace(/^\d+\s*/, '').replace(/\s*\d+$/, '');
    // Kelimeler arasındaki tek başına sayıları temizle (örn: "Kart 2" -> "Kart")
    cleanName = cleanName.replace(/\s+\d+\s*/g, ' ');
    return cleanName.trim();
  }
  
  // Username'i temizle ve isim/soyisim gibi davran
  let username = user.username;
  
  // Başındaki sayıları, underscore'ları ve özel karakterleri temizle
  username = username.replace(/^[0-9_$]+/, '');
  
  // Sonundaki sayılar ve karakterleri temizle
  username = username.replace(/[0-9_]+$/, '');
  
  // Eğer "user_" ile başlıyorsa, onu da temizle
  username = username.replace(/^user_/, '');
  
  // Underscore'ları boşlukla değiştir
  username = username.replace(/_/g, ' ');
  
  // Tek başına sayıları temizle
  username = username.replace(/\s+\d+\s*/g, ' ');
  
  // Trim yap ve büyük harfle başlat
  username = username.trim();
  if (username) {
    username = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  }
  
  return username || 'Kullanıcı';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUsers() {
      try {
        const usersData = await getUsers()
        setUsers(usersData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  function refreshUsers() {
    setLoading(true)
    getUsers().then(usersData => {
      setUsers(usersData)
      setLoading(false)
    }).catch(err => {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
      setLoading(false)
    })
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
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
        <p className="text-gray-600 mt-1">Tüm kullanıcıları görüntüle ve yönet</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">E-posta</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Etkinlik</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">
                      {getCleanUserName(user)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {user.event_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {user.is_premium && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Premium
                        </span>
                      )}
                      {user.is_verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Doğrulanmış
                        </span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Askıda
                        </span>
                      )}
                      {user.status === 'active' && !user.is_premium && !user.is_verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Normal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <UserActions user={user} onUpdate={refreshUsers} />
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